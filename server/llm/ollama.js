const fetch = require("node-fetch");
const { SYSTEM_PROMPT, FEW_SHOT } = require("./prompt");

const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b-instruct";
const BASE  = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

let LLM_AVAILABLE = process.env.USE_LLM !== "0";

(async () => {
  if (!LLM_AVAILABLE) return;
  try {
    const base = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
    const r = await fetch(`${base}/api/tags`);
    if (!r.ok) LLM_AVAILABLE = false;
  } catch {
    LLM_AVAILABLE = false;
  }
})();

async function callRouterLLM(userText) {
  const messages = [
    { role: "system", content: SYSTEM_PROMPT },
    ...FEW_SHOT.flatMap(s => [
      { role: "user", content: s.user },
      { role: "assistant", content: JSON.stringify(s.json) }
    ]),
    { role: "user", content: userText }
  ];

  const r = await fetch(`${BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: MODEL,
      messages,
      options: { temperature: 0 }
    })
  });

  if (!r.ok) throw new Error(`Ollama ${r.status}`);
  const data = await r.json();
  const content = data?.message?.content ?? "";
  return String(content).trim();
}

module.exports = { callRouterLLM };