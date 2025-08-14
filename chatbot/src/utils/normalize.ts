export function normalize(s: string): string {
  return s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // bỏ dấu tiếng Việt
    .replace(/\s+/g, " ")
    .trim();
}
