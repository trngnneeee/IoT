"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callEnhancedLLM = callEnhancedLLM;
exports.llmDirectAnswer = llmDirectAnswer;
exports.llmDirectAnswer2 = llmDirectAnswer2;
// src/llm/enhanced-ollama.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
const prompt_1 = require("./prompt");
const schemas_1 = require("./schemas");
const BASE = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b-instruct";
/** Đảm bảo model đã có trong Ollama; thiếu thì pull (blocking) */
async function ensureModel(model) {
    try {
        const tagsRes = await (0, node_fetch_1.default)(`${BASE}/api/tags`);
        const tags = tagsRes.ok ? await tagsRes.json() : { models: [] };
        const has = Array.isArray(tags?.models) && tags.models.some((m) => m?.name === model);
        if (has)
            return;
    }
    catch { /* ignore */ }
    const resp = await (0, node_fetch_1.default)(`${BASE}/api/pull`, {
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
    }
    catch { }
    // 2) Tìm block {...} cuối cùng
    const mLast = cleaned.match(/\{[\s\S]*\}$/);
    if (mLast) {
        try {
            return JSON.parse(mLast[0]);
        }
        catch { }
    }
    // 3) Tìm block {...} đầu tiên
    const mFirst = cleaned.match(/\{[\s\S]*?\}/);
    if (mFirst) {
        try {
            return JSON.parse(mFirst[0]);
        }
        catch { }
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
    const r = await (0, node_fetch_1.default)(`${base}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(body)
    });
    const text = await r.text();
    if (!r.ok)
        throw new Error(`Ollama ${r.status}: ${text}`);
    // TH1: JSON duy nhất
    try {
        const outer = JSON.parse(text);
        return String(outer?.message?.content ?? "");
    }
    catch {
        // TH2: NDJSON / nhiều JSON nối nhau -> lấy JSON cuối cùng hợp lệ
        const lines = text.split(/\r?\n/).filter(l => l.trim().startsWith("{"));
        for (let i = lines.length - 1; i >= 0; i--) {
            try {
                const obj = JSON.parse(lines[i]);
                if (obj?.message?.content)
                    return String(obj.message.content);
            }
            catch { /* ignore */ }
        }
        throw new Error("Không trích được message.content từ phản hồi Ollama");
    }
}
/** Gọi Ollama để lấy tool-call JSON; trả về CHUỖI JSON hợp lệ (để chat.ts parse) */
async function callEnhancedLLM(messages) {
    // 0) đảm bảo model có sẵn
    await ensureModel(MODEL);
    // 1) cấp prompt + few-shot
    const fullMessages = [
        { role: "system", content: prompt_1.SYSTEM_PROMPT },
        ...prompt_1.FEW_SHOT.flatMap((s) => [
            { role: "user", content: s.user },
            { role: "assistant", content: JSON.stringify(s.json) }
        ]),
        ...messages
    ];
    // 2) gọi 1 lần; nếu lỗi 404 liên quan model → pull rồi thử lại
    let content;
    try {
        content = await doChatOnce(BASE, MODEL, fullMessages);
    }
    catch (e) {
        const msg = String(e?.message || "");
        if (msg.includes("Ollama 404") || /model.+not.+found/i.test(msg)) {
            await ensureModel(MODEL);
            content = await doChatOnce(BASE, MODEL, fullMessages);
        }
        else {
            throw e;
        }
    }
    // 3) ép lấy đúng object JSON tool-call từ content
    let obj;
    try {
        obj = extractJsonObject(content);
    }
    catch {
        // nếu content vẫn là prose, thử lần nữa: tìm block JSON đầu/cuối
        const cleaned = content.replace(/```json|```/g, "").trim();
        const m = cleaned.match(/\{[\s\S]*\}$/) || cleaned.match(/\{[\s\S]*?\}/);
        if (!m)
            throw new Error("LLM trả về không phải JSON hợp lệ");
        obj = JSON.parse(m[0]);
    }
    // 4) validate bằng Zod
    const parsed = schemas_1.ToolCallSchema.safeParse(obj);
    if (!parsed.success)
        throw new Error("Tool JSON sai schema");
    const tool = parsed.data.tool;
    const argsSchema = schemas_1.ArgsSchemas[tool];
    const argsOk = argsSchema.safeParse(parsed.data.args);
    if (!argsOk.success)
        throw new Error("Args sai schema");
    // 5) trả về CHUỖI JSON để chat.ts `JSON.parse(...)` như bạn đang làm
    return JSON.stringify({
        tool,
        args: argsOk.data,
        confidence: typeof parsed.data.confidence === "number" ? parsed.data.confidence : 0.8
    });
}
// ======= Fallback: LLM trả lời trực tiếp như ChatGPT =======
async function llmDirectAnswer(userQuestion, opts) {
    // system prompt ngắn, tập trung trả lời tự nhiên bằng tiếng Việt
    const SYSTEM = `
Bạn là trợ lý AI lịch sự, trả lời NGẮN GỌN, chính xác bằng tiếng Việt.
Nếu câu hỏi mơ hồ, hãy hỏi lại để làm rõ. Không bịa số liệu.
`;
    const messages = [
        { role: "system", content: SYSTEM },
    ];
    // nối chút lịch sử hội thoại (nếu có)
    if (opts?.history?.length) {
        for (const m of opts.history.slice(-6))
            messages.push(m);
    }
    // nhét context thô (nếu có) – giúp bot tham chiếu
    if (opts?.context) {
        messages.push({ role: "user", content: `Ngữ cảnh thêm (JSON): ${JSON.stringify(opts.context)}` });
    }
    // cuối cùng là câu hỏi thật
    messages.push({ role: "user", content: userQuestion });
    // dùng doChatOnce (đã có ở file này) để gọi Ollama, trả về string
    const answer = await doChatOnce(BASE, MODEL, messages);
    return answer.trim();
}
async function llmDirectAnswer2(userQuestion, opts) {
    const SYSTEM = `Bạn là trợ lý AI lịch sự, trả lời NGẮN GỌN, chính xác bằng tiếng Việt. Nếu câu hỏi mơ hồ hãy hỏi lại, không bịa số.`;
    const messages = [
        { role: "system", content: SYSTEM },
    ];
    if (opts?.history?.length) {
        for (const m of opts.history.slice(-6))
            messages.push(m);
    }
    if (opts?.context) {
        messages.push({ role: "user", content: `Ngữ cảnh thêm (JSON): ${JSON.stringify(opts.context)}` });
    }
    messages.push({ role: "user", content: userQuestion });
    const answer = await doChatOnce(process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434", process.env.OLLAMA_MODEL || "qwen2.5:0.5b-instruct", messages);
    return answer.trim();
}
