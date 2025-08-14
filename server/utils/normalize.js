// Normalize function converted to JavaScript

function normalize(s) {
  return s.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")  // bỏ dấu tiếng Việt
    .replace(/\s+/g, " ")
    .trim();
}

// Export để sử dụng trong Node.js (nếu cần)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { normalize };
}

// Hoặc trong browser có thể sử dụng trực tiếp function normalize()