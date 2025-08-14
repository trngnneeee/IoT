"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const guard_1 = require("../utils/guard");
const classify_1 = require("../nlu/classify");
const tools_1 = require("../tools");
const enhanced_ollama_1 = require("../llm/enhanced-ollama");
const schemas_1 = require("../llm/schemas");
const conversation_1 = require("../utils/conversation");
const formatter_1 = require("../utils/formatter");
const node_fetch_1 = __importDefault(require("node-fetch")); // để probe Ollama
const router = (0, express_1.Router)();
// Bật/tắt LLM bằng .env (mặc định bật)
let LLM_AVAILABLE = process.env.USE_LLM !== "0";
// Ngưỡng tự tin để quyết định fallback trả lời tự nhiên
const CONF_TH = Number(process.env.LLM_CONF_THRESHOLD || "0.65");
/** Probe Ollama một lần khi boot (không chặn server) */
(async () => {
    if (!LLM_AVAILABLE)
        return;
    try {
        const base = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
        const r = await (0, node_fetch_1.default)(`${base}/api/tags`, { method: "GET" });
        if (!r.ok) {
            const errBody = await r.text();
            console.error("Ollama error body:", errBody);
            LLM_AVAILABLE = false;
        }
    }
    catch {
        LLM_AVAILABLE = false;
    }
})();
router.post("/chat", async (req, res) => {
    const userQuestion = (0, guard_1.safeInput)(String(req.body?.message ?? "")).slice(0, 1000);
    if (!userQuestion)
        return res.status(400).json({ error: "Thiếu message" });
    // Lấy / tạo session
    const sessionId = req.body?.sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    let context = conversation_1.conversationManager.getSession(sessionId);
    if (!context) {
        context = conversation_1.conversationManager.createSession(sessionId);
    }
    // Lưu user message
    conversation_1.conversationManager.addMessage(sessionId, { role: "user", content: userQuestion });
    let tool = "help";
    let args = {};
    let confidence = 0.0;
    // 1) NLU: ưu tiên LLM → nếu lỗi thì regex
    try {
        if (LLM_AVAILABLE) {
            const messages = [{ role: "user", content: userQuestion }];
            const raw = await (0, enhanced_ollama_1.callEnhancedLLM)(messages);
            const parsed = JSON.parse(raw.replace(/```json|```/g, "").trim());
            // (optional) validate lại — phòng trường hợp sửa callEnhancedLLM sau này
            const v = schemas_1.ToolCallSchema.safeParse(parsed);
            if (!v.success)
                throw new Error("Tool JSON sai schema");
            const aa = schemas_1.ArgsSchemas[v.data.tool].safeParse(v.data.args);
            if (!aa.success)
                throw new Error("Args sai schema");
            tool = v.data.tool;
            args = aa.data;
            confidence = typeof v.data.confidence === "number" ? v.data.confidence : 0.8;
            conversation_1.conversationManager.updateContext(sessionId, {
                lastTool: tool,
                lastArgs: args,
                lastQuery: userQuestion
            });
        }
        else {
            const f = (0, classify_1.classify)(userQuestion);
            tool = f.tool;
            args = f.args;
            confidence = 0.6;
        }
    }
    catch (err) {
        // JSON bẩn/ECONNREFUSED/... → rơi về regex
        const f = (0, classify_1.classify)(userQuestion);
        tool = f.tool;
        args = f.args;
        confidence = 0.6;
    }
    // 2) Fallback “giống ChatGPT” khi không có tool / tool=help / confidence thấp
    try {
        const fn = tools_1.TOOL_REGISTRY[tool];
        const needDirectLLM = tool === "help" || !fn || confidence < CONF_TH;
        if (needDirectLLM) {
            if (LLM_AVAILABLE) {
                // Lấy 6 lượt hội thoại gần nhất (user/assistant) làm history nhẹ
                const history = conversation_1.conversationManager
                    .getSession(sessionId)
                    ?.messages?.filter((m) => m.role === "user" || m.role === "assistant")
                    ?.slice(-6)
                    ?.map((m) => ({ role: m.role, content: String(m.content || "") })) || [];
                const direct = await (0, enhanced_ollama_1.llmDirectAnswer)(userQuestion, {
                    history,
                    context: {
                        lastTool: conversation_1.conversationManager.getSession(sessionId)?.lastTool,
                        lastArgs: conversation_1.conversationManager.getSession(sessionId)?.lastArgs,
                        lastData: conversation_1.conversationManager.getSession(sessionId)?.lastData
                    }
                });
                conversation_1.conversationManager.addMessage(sessionId, {
                    role: "assistant",
                    content: direct
                });
                conversation_1.conversationManager.updateContext(sessionId, { lastResponse: direct });
                return res.json({
                    reply: direct,
                    tool: tool !== "help" && confidence >= CONF_TH ? tool : null,
                    args,
                    confidence,
                    sessionId,
                    via: "llm-direct"
                });
            }
            else {
                // LLM tắt → trả help “mềm”
                const helpResult = tools_1.TOOL_REGISTRY.help ? await tools_1.TOOL_REGISTRY.help({}) : null;
                const helpText = typeof helpResult === "string"
                    ? helpResult
                    : (helpResult && typeof helpResult === "object" && "text" in helpResult && typeof helpResult.text === "string")
                        ? helpResult.text
                        : `Bạn có thể hỏi:
- "Khối lượng thùng nhựa?"
- "Thùng hữu cơ đầy bao nhiêu %?"
- "Tình trạng cả 3 thùng?"
- "Tổng rác hôm nay?"
- "Lịch sử 6h thùng kim loại?"
- "Mở thùng nhựa"`;
                conversation_1.conversationManager.addMessage(sessionId, { role: "assistant", content: helpText });
                conversation_1.conversationManager.updateContext(sessionId, { lastResponse: helpText });
                return res.json({
                    reply: helpText,
                    tool,
                    args,
                    confidence,
                    sessionId,
                    via: "help"
                });
            }
        }
        // 3) Có tool & đủ tự tin → chạy tool
        const data = await fn(args);
        conversation_1.conversationManager.updateContext(sessionId, { lastData: data });
        // 4) Format câu trả lời (bạn đang dùng formatter tuỳ biến)
        const userPreferences = conversation_1.conversationManager.detectUserPreferences(sessionId);
        const formatted = formatter_1.ResponseFormatter.formatResponse(data, userPreferences, userQuestion, tool, args);
        conversation_1.conversationManager.addMessage(sessionId, {
            role: "assistant",
            content: formatted.content,
            tool,
            args,
            data
        });
        conversation_1.conversationManager.updateContext(sessionId, { lastResponse: formatted.content });
        return res.json({
            reply: formatted.content,
            tool,
            args,
            data,
            confidence,
            sessionId,
            format: formatted.format,
            suggestions: formatted.suggestions,
            via: "tool"
        });
    }
    catch (e) {
        console.error("[/chat] exec error:", e);
        const msg = String(e?.message || "");
        let errorReply = "Có lỗi khi xử lý truy vấn. Kiểm tra log server.";
        if (/Mongo|EBADNAME|ENOTFOUND|ECONN/.test(msg)) {
            errorReply = "Không kết nối được cơ sở dữ liệu. Kiểm tra cấu hình DB.";
        }
        conversation_1.conversationManager.addMessage(sessionId, {
            role: "assistant",
            content: errorReply,
            tool,
            args
        });
        return res.json({
            reply: errorReply,
            tool,
            args,
            confidence,
            sessionId,
            via: "error"
        });
    }
});
// Cập nhật preferences
router.post("/preferences/:sessionId", (req, res) => {
    const { sessionId } = req.params;
    const { preferences } = req.body;
    const context = conversation_1.conversationManager.getSession(sessionId);
    if (!context)
        return res.status(404).json({ error: "Session not found" });
    conversation_1.conversationManager.updateContext(sessionId, {
        userPreferences: { ...context.userPreferences, ...preferences }
    });
    res.json({
        success: true,
        preferences: conversation_1.conversationManager.getSession(sessionId)?.userPreferences
    });
});
// Dọn session cũ định kỳ
setInterval(() => {
    conversation_1.conversationManager.cleanup();
}, 5 * 60 * 1000); // 5 phút
exports.default = router;
