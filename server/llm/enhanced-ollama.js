// Enhanced Ollama converted to JavaScript
// Note: You'll need to install node-fetch: npm install node-fetch
// You'll also need to have the prompt.js and schemas.js files converted

const fetch = require("node-fetch");
// Import these after converting the respective files to JS:
// const { SYSTEM_PROMPT, FEW_SHOT } = require("./prompt");
// const { ToolCallSchema, ArgsSchemas } = require("./schemas");

const BASE = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b-instruct";

/** Đảm bảo model đã có trong Ollama; thiếu thì pull (blocking) */
async function ensureModel(model) {
  try {
    const tagsRes = await fetch(`${BASE}/api/tags`);
    const tags = tagsRes.ok ? await tagsRes.json() : { models: [] };
    const has = Array.isArray(tags?.models) && tags.models.some((m) => m?.name === model);
    if (has) return;
  } catch { 
    /* ignore network probe errors; will try pulling */ 
  }

  const resp = await fetch(`${BASE}/api/pull`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: model, stream: false })
  });
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`pull failed: ${resp.status} ${txt}`);
  }
}

/** Trích 1 object JSON từ text (kể cả khi có prose / code fences) */
function extractJsonObject(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();

  // 1) Thử parse trực tiếp
  try { 
    return JSON.parse(cleaned); 
  } catch {}

  // 2) Tìm block {...} cuối cùng
  const mLast = cleaned.match(/\{[\s\S]*\}$/);
  if (mLast) {
    try { 
      return JSON.parse(mLast[0]); 
    } catch {}
  }

  // 3) Tìm block {...} đầu tiên
  const mFirst = cleaned.match(/\{[\s\S]*?\}/);
  if (mFirst) {
    try { 
      return JSON.parse(mFirst[0]); 
    } catch {}
  }

  throw new Error("LLM trả về không phải JSON hợp lệ");
}

/** Đọc phản hồi chat; hỗ trợ cả stream và non-stream */
async function doChatOnce(base, model, messages) {
  const body = {
    model,
    messages,
    options: { temperature: 0 },
    stream: false // yêu cầu 1 JSON duy nhất
  };

  const r = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(body)
  });

  const text = await r.text();
  if (!r.ok) throw new Error(`Ollama ${r.status}: ${text}`);

  // TH1: JSON duy nhất
  try {
    const outer = JSON.parse(text);
    return String(outer?.message?.content ?? "");
  } catch {
    // TH2: NDJSON / nhiều JSON nối nhau -> lấy JSON cuối cùng hợp lệ
    const lines = text.split(/\r?\n/).filter(l => l.trim().startsWith("{"));
    for (let i = lines.length - 1; i >= 0; i--) {
      try {
        const obj = JSON.parse(lines[i]);
        if (obj?.message?.content) return String(obj.message.content);
      } catch { 
        /* ignore */ 
      }
    }
    throw new Error("Không trích được message.content từ phản hồi Ollama");
  }
}

/** Gọi Ollama để lấy tool-call JSON; trả về CHUỖI JSON hợp lệ (để chat.ts parse) */
async function callEnhancedLLM(messages) {
  // Note: You'll need to uncomment these after converting prompt.js and schemas.js
  // const { SYSTEM_PROMPT, FEW_SHOT } = require("./prompt");
  // const { ToolCallSchema, ArgsSchemas } = require("./schemas");
  
  // Temporary placeholders - replace with actual imports
  const SYSTEM_PROMPT = "You are a helpful assistant for IoT trash management system.";
  const FEW_SHOT = [];
  const ToolCallSchema = {
    safeParse: (obj) => ({ success: true, data: obj })
  };
  const ArgsSchemas = {};

  // 0) đảm bảo model có sẵn
  await ensureModel(MODEL);

  // 1) cấp prompt + few-shot
  const fullMessages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...FEW_SHOT.flatMap((s) => [
      { role: "user", content: s.user },
      { role: "assistant", content: JSON.stringify(s.json) }
    ]),
    ...messages
  ];

  // 2) gọi 1 lần; nếu lỗi 404 liên quan model → pull rồi thử lại
  let content;
  try {
    content = await doChatOnce(BASE, MODEL, fullMessages);
  } catch (e) {
    const msg = String(e?.message || "");
    if (msg.includes("Ollama 404") || /model.+not.+found/i.test(msg)) {
      await ensureModel(MODEL);
      content = await doChatOnce(BASE, MODEL, fullMessages);
    } else {
      throw e;
    }
  }

  // 3) ép lấy đúng object JSON tool-call từ content
  let obj;
  try {
    obj = extractJsonObject(content);
  } catch {
    // nếu content vẫn là prose, thử lần nữa: tìm block JSON đầu/cuối
    const cleaned = content.replace(/```json|```/g, "").trim();
    const m = cleaned.match(/\{[\s\S]*\}$/) || cleaned.match(/\{[\s\S]*?\}/);
    if (!m) throw new Error("LLM trả về không phải JSON hợp lệ");
    obj = JSON.parse(m[0]);
  }

  // 4) validate bằng Zod (simplified for JS version)
  const parsed = ToolCallSchema.safeParse(obj);
  if (!parsed.success) throw new Error("Tool JSON sai schema");

  const tool = parsed.data.tool;
  const argsSchema = ArgsSchemas[tool];
  const argsOk = argsSchema ? argsSchema.safeParse(parsed.data.args) : { success: true, data: parsed.data.args };
  if (!argsOk.success) throw new Error("Args sai schema");

  // 5) trả về CHUỖI JSON để chat.ts `JSON.parse(...)` như bạn đang làm
  return JSON.stringify({
    tool,
    args: argsOk.data,
    confidence: typeof parsed.data.confidence === "number" ? parsed.data.confidence : 0.8
  });
}

/** ======= Fallback: LLM trả lời trực tiếp như ChatGPT ======= */
async function llmDirectAnswer(userQuestion, opts = {}) {
  // đảm bảo model sẵn sàng (nhất quán với callEnhancedLLM)
  await ensureModel(MODEL);

  // system prompt ngắn, tập trung trả lời tự nhiên bằng tiếng Việt
  const SYSTEM = `
Bạn là trợ lý AI lịch sự, trả lời NGẮN GỌN, chính xác bằng tiếng Việt.
Nếu câu hỏi mơ hồ, hãy hỏi lại để làm rõ. Không bịa số liệu.
`.trim();

  const messages = [
    { role: "system", content: SYSTEM },
  ];

  // nối chút lịch sử hội thoại (nếu có) — tránh đưa các câu trả JSON vào để khỏi "lây" format
  if (opts?.history?.length) {
    for (const m of opts.history.slice(-6)) {
      messages.push(m);
    }
  }

  // nhét context thô (nếu có) – giúp bot tham chiếu
  if (opts?.context) {
    messages.push({ 
      role: "user", 
      content: `Ngữ cảnh thêm (JSON): ${JSON.stringify(opts.context)}` 
    });
  }

  // cuối cùng là câu hỏi thật
  messages.push({ role: "user", content: userQuestion });

  // gọi Ollama, trả về string
  const answer = await doChatOnce(BASE, MODEL, messages);
  return answer.trim();
}

// Export để sử dụng trong Node.js (nếu cần)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    ensureModel, 
    extractJsonObject, 
    doChatOnce, 
    callEnhancedLLM, 
    llmDirectAnswer 
  };
}

// Hoặc trong browser có thể sử dụng trực tiếp các functions