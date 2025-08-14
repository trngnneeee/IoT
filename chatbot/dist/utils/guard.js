"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeInput = safeInput;
function safeInput(s) {
    // chặn HTML đơn giản + cắt trắng
    const cleaned = s.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
    return cleaned.slice(0, 1000);
}
