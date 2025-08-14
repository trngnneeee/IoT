export function safeInput(s: string): string {
  // chặn HTML đơn giản + cắt trắng
  const cleaned = s.replace(/[<>]/g, "").replace(/\s+/g, " ").trim();
  return cleaned.slice(0, 1000);
}
