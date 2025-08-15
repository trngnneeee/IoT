const router = require('express').Router();

const { safeInput } = require("../utils/guard");
const { classify } = require("../nlu/classify");

// Cho phép cả 2 kiểu export của tools:
//   module.exports = TOOL_REGISTRY
//   module.exports.TOOL_REGISTRY = TOOL_REGISTRY
const toolsMod = require("../tools");
const TOOL_REGISTRY = toolsMod?.TOOL_REGISTRY ?? toolsMod;

const { callEnhancedLLM, llmDirectAnswer } = require("../llm/enhanced-ollama");
const { ToolCallSchema, ArgsSchemas } = require("../llm/schemas");
const { conversationManager } = require("../utils/conversation");
const fetch = require("node-fetch");
const ChatHistory = require('../model/chat-history.model');

// --- Formatter: tự tìm formatResponse hoặc ResponseFormatter.formatResponse, có fallback ---
let formatResponseFn = null;
try {
  const fmt = require("../utils/formatter");
  // formatter có thể export default là class, hoặc { ResponseFormatter }
  const FormatterClass =
    fmt?.ResponseFormatter          // named export
    || fmt?.default                 // default export (nếu dùng transpile)
    || fmt;                         // module.exports = ResponseFormatter
  if (FormatterClass?.formatResponse) {
    // bind để 'this' bên trong static method trỏ về class
    formatResponseFn = FormatterClass.formatResponse.bind(FormatterClass);
  } else if (typeof fmt?.formatResponse === "function") {
    // nếu export sẵn function thuần thì vẫn bind để an toàn
    formatResponseFn = fmt.formatResponse.bind(fmt);
  }
} catch { /* ignore, dùng fallback */ }
function fallbackFormat(payload) {
  if (payload == null) {
    return { content: "Không có dữ liệu.", format: "plain", suggestions: [] };
  }
  if (typeof payload === "string") {
    return { content: payload, format: "plain", suggestions: [] };
  }
  try {
    return { content: JSON.stringify(payload, null, 2), format: "json", suggestions: [] };
  } catch {
    return { content: String(payload), format: "plain", suggestions: [] };
  }
}

function formatResponse(data, userPrefs, question, tool, args) {
  try {
    if (formatResponseFn) {
      return formatResponseFn(data, userPrefs, question, tool, args);
    }
  } catch (e) {
    console.warn("[Formatter] failed, using fallback:", e?.message || e);
  }
  return fallbackFormat(data);
}

// --- LLM flags ---
let LLM_AVAILABLE = process.env.USE_LLM !== "0";
const CONF_TH = Number(process.env.LLM_CONF_THRESHOLD || "0.65");

// Probe Ollama (một lần, không lặp)
(async () => {
  if (!LLM_AVAILABLE) return;
  try {
    const base = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    const r = await fetch(`${base}/api/tags`, { method: "GET" });
    if (!r.ok) {
      const errBody = await r.text();
      console.error("[Probe] Ollama error body:", errBody);
      LLM_AVAILABLE = false;
    }
  } catch (e) {
    console.warn("[Probe] Ollama unavailable, fallback regex enabled.");
    LLM_AVAILABLE = false;
  }
})();

// (tuỳ chọn) logger request gọn để debug đường dẫn/method
router.use((req, _res, next) => {
  // console.log(`[REQ] ${req.method} ${req.originalUrl}`);
  next();
});

router.post("/chat", async (req, res) => {
  const userQuestion = safeInput(String(req.body?.message ?? "")).slice(0, 1000);
  if (!userQuestion) return res.status(400).json({ error: "Thiếu message" });

  // Lấy / tạo session
  const sessionId =
    req.body?.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  let context = conversationManager.getSession(sessionId);
  if (!context) context = conversationManager.createSession(sessionId);

  // Lưu user message
  conversationManager.addMessage(sessionId, { role: "user", content: userQuestion });

  // Lệnh chuyển chế độ thủ công
  const rawCmd = userQuestion.toLowerCase().trim();
  if (rawCmd === "/chat") {
    conversationManager.updateContext(sessionId, { mode: "chat" });
    return res.json({ reply: "Đã chuyển sang chế độ trò chuyện tự do.", sessionId, via: "switch" });
  }
  if (rawCmd === "/tool") {
    conversationManager.updateContext(sessionId, { mode: "tool" });
    return res.json({ reply: "Đã chuyển về chế độ truy vấn dữ liệu.", sessionId, via: "switch" });
  }

  // Gate: câu hỏi ngoài miền IoT → trả lời tự do (trước NLU)
  const offDomain = /^(kể|chuyện|giải thích|tại sao|how are you|tell me|joke|story|what is|why)\b/i
    .test(userQuestion);
  const sess = conversationManager.getSession(sessionId);

  // Chế độ chat tự do
  if ((sess?.mode === "chat" || offDomain) && LLM_AVAILABLE) {
    const history =
      sess?.messages
        ?.filter((m) => m.role === "user" || m.role === "assistant")
        ?.slice(-6)
        ?.map((m) => ({ role: m.role, content: String(m.content || "") })) || [];
    try {
      const direct = await llmDirectAnswer(userQuestion, { history });
      conversationManager.addMessage(sessionId, { role: "assistant", content: direct });
      conversationManager.updateContext(sessionId, { lastResponse: direct });
      return res.json({ reply: direct, sessionId, via: "llm-direct" });
    } catch (e) {
      console.warn("[ChatMode] llmDirectAnswer failed, falling back to help/tool.");
      // tiếp tục xuống dưới dùng help/tool
    }
  } else if ((sess?.mode === "chat" || offDomain) && !LLM_AVAILABLE) {
    return res.json({
      reply: "Đang ở chế độ trò chuyện tự do nhưng LLM đang tắt. Dùng /tool để quay về truy vấn dữ liệu.",
      sessionId,
      via: "help"
    });
  }

  // ----- Tool inference -----
  let tool = "help";
  let args = {};
  let confidence = 0.0;

  // 1) NLU: ưu tiên LLM → nếu lỗi thì regex
  try {
    if (LLM_AVAILABLE) {
      const messages = [{ role: "user", content: userQuestion }];
      const raw = await callEnhancedLLM(messages);

      let parsed;
      try {
        parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
      } catch (err) {
        console.error("[LLM JSON parse error]", raw);
        throw new Error("LLM trả về kết quả không hợp lệ");
      }

      const v = ToolCallSchema.safeParse(parsed);
      if (!v.success) throw new Error("Tool JSON sai schema");

      const aa = ArgsSchemas[v.data.tool]?.safeParse
        ? ArgsSchemas[v.data.tool].safeParse(v.data.args)
        : { success: true, data: v.data.args };

      if (!aa.success) throw new Error("Args sai schema");

      tool = v.data.tool;
      args = aa.data;
      confidence = typeof v.data.confidence === "number" ? v.data.confidence : 0.8;

      conversationManager.updateContext(sessionId, {
        lastTool: tool,
        lastArgs: args,
        lastQuery: userQuestion
      });
    } else {
      const f = classify(userQuestion);
      tool = f.tool;
      args = f.args;
      confidence = 0.6;
    }
  } catch {
    const f = classify(userQuestion);
    tool = f.tool;
    args = f.args;
    confidence = 0.6;
  }

  // 2) Fallback “ChatGPT-style” khi không có tool / tool=help / confidence thấp
  try {
    const fn = TOOL_REGISTRY?.[tool];
    const needDirectLLM = tool === "help" || !fn || confidence < CONF_TH;

    console.log("[Decision]", {
      tool,
      hasFn: !!fn,
      confidence,
      threshold: CONF_TH,
      needDirectLLM
    });

    if (needDirectLLM) {
      if (LLM_AVAILABLE) {
        const history =
          conversationManager
            .getSession(sessionId)
            ?.messages?.filter((m) => m.role === "user" || m.role === "assistant")
            ?.slice(-6)
            ?.map((m) => ({ role: m.role, content: String(m.content || "") })) || [];

        const direct = await llmDirectAnswer(userQuestion, {
          history,
          context: {
            lastTool: conversationManager.getSession(sessionId)?.lastTool,
            lastArgs: conversationManager.getSession(sessionId)?.lastArgs,
            lastData: conversationManager.getSession(sessionId)?.lastData
          }
        });

        conversationManager.addMessage(sessionId, { role: "assistant", content: direct });
        conversationManager.updateContext(sessionId, { lastResponse: direct });

        return res.json({
          reply: direct,
          tool: null,
          args,
          confidence,
          sessionId,
          via: "llm-direct"
        });
      } else {
        const helpResult = TOOL_REGISTRY?.help ? await TOOL_REGISTRY.help({}) : null;
        const helpText =
          typeof helpResult === "string"
            ? helpResult
            : helpResult && typeof helpResult === "object" && "text" in helpResult
              ? String(helpResult.text)
              : `Bạn có thể hỏi:
- "Khối lượng thùng nhựa?"
- "Thùng hữu cơ đầy bao nhiêu %?"
- "Tình trạng cả 3 thùng?"
- "Tổng rác hôm nay?"
- "Lịch sử 6h thùng kim loại?"
- "Mở thùng nhựa"
- "Bạn là ai"`;

        conversationManager.addMessage(sessionId, { role: "assistant", content: helpText });
        conversationManager.updateContext(sessionId, { lastResponse: helpText });
        return res.json({ reply: helpText, tool, args, confidence, sessionId, via: "help" });
      }
    }

    // 3) Có tool & đủ tự tin → chạy tool
    const data = await fn(args);
    conversationManager.updateContext(sessionId, { lastData: data });

    // 4) Format câu trả lời
    const userPreferences = conversationManager.detectUserPreferences(sessionId);
    const formatted = formatResponse(data, userPreferences, userQuestion, tool, args);

    conversationManager.addMessage(sessionId, {
      role: "assistant",
      content: formatted.content,
      tool,
      args,
      data
    });
    conversationManager.updateContext(sessionId, { lastResponse: formatted.content });

    // Lưu dữ liệu cuộc nói chuyện
    const chatHistory = await ChatHistory.findOne({
      userID: req.account.id
    });
    if (chatHistory) {
      const newChat = [
        {
          id: 1,
          chat: req.body.message
        },
        {
          id: 2,
          chat: formatted.content
        }
      ];

      chatHistory.chat.push(...newChat);
      await chatHistory.save();
    }
    else {
      const newChatRecord = new ChatHistory({
        userID: req.account.id,
        chat: [
          {
            id: 1,
            chat: req.body.message
          },
          {
            id: 2,
            chat: formatted.content
          }
        ]
      });
      await newChatRecord.save();
    }

    return res.json({
      code: "success",
      message: "Chat successfully!",
      reply: formatted.content
    });

  } catch (e) {
    console.error("[/chat] exec error:", e);
    const msg = String(e?.message || "");
    let errorReply = "Có lỗi khi xử lý truy vấn. Kiểm tra log server.";
    if (/Mongo|EBADNAME|ENOTFOUND|ECONN/.test(msg)) {
      errorReply = "Không kết nối được cơ sở dữ liệu. Kiểm tra cấu hình DB.";
    }
    conversationManager.addMessage(sessionId, { role: "assistant", content: errorReply, tool, args });
    return res.json({ reply: errorReply, tool, args, confidence, sessionId, via: "error" });
  }
});

router.post("/preferences/:sessionId", (req, res) => {
  const { sessionId } = req.params;
  const { preferences } = req.body;

  const context = conversationManager.getSession(sessionId);
  if (!context) return res.status(404).json({ error: "Session not found" });

  conversationManager.updateContext(sessionId, {
    userPreferences: { ...context.userPreferences, ...preferences }
  });

  res.json({
    success: true,
    preferences: conversationManager.getSession(sessionId)?.userPreferences
  });
});

// Dọn session cũ định kỳ
setInterval(() => {
  conversationManager.cleanup();
}, 5 * 60 * 1000); // 5 phút

router.get("/chat-history", async (req, res) => {
  const chatHistory = await ChatHistory.findOne({
    userID: req.account.id
  });
  res.json({
    code: "success",
    message: "Get chat history successfully!",
    chatHistory: chatHistory
  })
})

module.exports = router;
