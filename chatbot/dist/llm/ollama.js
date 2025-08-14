"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.callRouterLLM = callRouterLLM;
const node_fetch_1 = __importDefault(require("node-fetch"));
const prompt_1 = require("./prompt");
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b-instruct";
const BASE = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
let LLM_AVAILABLE = process.env.USE_LLM !== "0";
(async () => {
    if (!LLM_AVAILABLE)
        return;
    try {
        const base = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
        const r = await (0, node_fetch_1.default)(`${base}/api/tags`);
        if (!r.ok)
            LLM_AVAILABLE = false;
    }
    catch {
        LLM_AVAILABLE = false;
    }
})();
async function callRouterLLM(userText) {
    const messages = [
        { role: "system", content: prompt_1.SYSTEM_PROMPT },
        ...prompt_1.FEW_SHOT.flatMap((s) => [
            { role: "user", content: s.user },
            { role: "assistant", content: JSON.stringify(s.json) }
        ]),
        { role: "user", content: userText }
    ];
    const r = await (0, node_fetch_1.default)(`${BASE}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: MODEL, messages, options: { temperature: 0 } })
    });
    if (!r.ok)
        throw new Error(`Ollama ${r.status}`);
    const data = await r.json();
    const content = data?.message?.content ?? "";
    return String(content).trim();
}
