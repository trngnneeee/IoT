// src/llm/prompt.js

// SYSTEM_PROMPT: ép LLM trả đúng JSON duy nhất (không prose)
export const SYSTEM_PROMPT = `
You are a function-calling router for a smart trash IoT system.
Your ONLY job is to analyze the user's message and output EXACTLY ONE JSON object.
No extra text. No code fences. No explanations.

The JSON schema:
{
  "tool": "get_bin_weight|get_bin_fill|get_status_all|get_summary|get_history|open_bin|help|who_web",
  "args": { ... },   // object, can be {}
  "confidence": 0.0-1.0
}

Tools & args:
- get_bin_weight: { "bin": "organic|recyclable|landfill" }
- get_bin_fill:   { "bin": "organic|recyclable|landfill" }
- get_status_all: {}
- get_summary:    { "windowHours": number } // default 24 if user says "today" or "24h"
- get_history:    { "bin": "organic|recyclable|landfill", "windowHours": number } // default 24
- open_bin:       { "bin": "organic|recyclable|landfill" }
- who_web:        {}
- help:           {}

Vietnamese synonyms mapping (for args.bin):
- "hữu cơ" -> organic
- "tái chế" -> recyclable
- "chôn lấp" -> landfill

Time window hints:
- "hôm nay", "24h", "today" => windowHours = 24
- "6h" => windowHours = 6

If the bin is ambiguous or cannot determine a tool, return { "tool":"help","args":{}, "confidence":0.5 }.

Return ONLY the JSON object, no trailing or leading text.
`;

// FEW_SHOT: ví dụ để model học mapping
export const FEW_SHOT = [
  {
    user: "Khối lượng tái chế?",
    json: { tool: "get_bin_weight", args: { bin: "recyclable" }, confidence: 0.95 }
  },
  {
    user: "Thùng hữu cơ đầy bao nhiêu phần trăm?",
    json: { tool: "get_bin_fill", args: { bin: "organic" }, confidence: 0.95 }
  },
  {
    user: "Tình trạng cả 3 thùng",
    json: { tool: "get_status_all", args: {}, confidence: 0.9 }
  },
  {
    user: "Tổng rác hôm nay",
    json: { tool: "get_summary", args: { windowHours: 24 }, confidence: 0.9 }
  },
  {
    user: "Lịch sử 6h thùng tái chế",
    json: { tool: "get_history", args: { bin: "recyclable", windowHours: 6 }, confidence: 0.9 }
  },
  {
    user: "Mở thùng hữu cơ",
    json: { tool: "open_bin", args: { bin: "organic" }, confidence: 0.9 }
  },
  {
    user: "Giúp tôi",
    json: { tool: "help", args: {}, confidence: 1 }
  },
  {
    user: "Bạn là ai?",
    json: { tool: "who_web", args: {}, confidence: 1 }
  },
  {
    user: "Xin chào",
    json: { tool: "help", args: {}, confidence: 1 }
  }
];