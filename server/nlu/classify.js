const { normalize } = require("../utils/normalize");
const { mapBin } = require("./aliases");

function classify(raw) {
  const t = normalize(raw);
  const bin = mapBin(t);

  const patterns = {
    weight: {
      patterns: [
        /(khoi luong|kg|can|nang|trong luong|gam|ton)/,
        /(bin|thung|thùng).*(bao nhieu|co|dang|hien tai)/,
        /(bao nhieu|co bao nhieu).*(kg|gam|ton)/
      ],
      tool: "get_bin_weight",
      requiresBin: true
    },
    fill: {
      patterns: [
        /(muc day|bao nhieu %|full|con cho|do day|phan tram|%)/,
        /(thung|bin).*(day|con|trong|dang)/,
        /(bao nhieu|con bao nhieu).*(phan tram|%)/
      ],
      tool: "get_bin_fill",
      requiresBin: true
    },
    status: {
      patterns: [
        /(tinh trang|status|ca 3 thung|tat ca thung|overview|tong quan)/,
        /(thung nao|bin nao).*(day|con|trong)/,
        /(tinh hinh|hien trang|overview)/
      ],
      tool: "get_status_all",
      requiresBin: false
    },
    summary: {
      patterns: [
        /(tong|tong cong|summary|thong ke).*(hom nay|today|24h|24 h|ngay|24 gio)/,
        /(bao nhieu|co bao nhieu).*(rac|garbage|waste).*(hom nay|today)/,
        /(thong ke|statistics|report).*(ngay|today)/
      ],
      tool: "get_summary",
      requiresBin: false
    },
    history: {
      patterns: [
        /(lich su|nhat ky|bieu do|chart|graph|trend)/,
        /(bao nhieu|co bao nhieu).*(ngay|gio|tuan|thang)/,
        /(theo doi|monitor|tracking)/
      ],
      tool: "get_history",
      requiresBin: true
    },
    control: {
      patterns: [
        /(mo thung|mo nap|bat servo|open|mo|bat)/,
        /(dieu khien|control|command)/
      ],
      tool: "open_bin",
      requiresBin: true
    },
    help: {
      patterns: [
        /(giup|help|tro giup|huong dan|lam sao|the nao)/,
        /(co the|co the nao|biet|hieu)/
      ],
      tool: "help",
      requiresBin: false
    }
  };

  const timePatterns = {
    "6h": 6,
    "6 gio": 6,
    "6 giờ": 6,
    "12h": 12,
    "12 gio": 12,
    "12 giờ": 12,
    "24h": 24,
    "24 gio": 24,
    "24 giờ": 24,
    "hom nay": 24,
    "today": 24,
    "ngay": 24,
    "tuan": 168,
    "week": 168,
    "thang": 720,
    "month": 720
  };

  let detectedTime = 24;
  for (const [pattern, hours] of Object.entries(timePatterns)) {
    if (t.includes(pattern)) {
      detectedTime = hours;
      break;
    }
  }

  const binSynonyms = {
    plastic: ["nhua", "nhựa", "plastic", "chai", "lon", "nilon"],
    organic: ["huu co", "hữu cơ", "organic", "thuc pham", "thực phẩm", "rau", "cu"],
    metal: ["kim loai", "kim loại", "metal", "sat", "sắt", "nhom", "nhôm", "lon", "can"],
    paper: ["giay", "giấy", "paper", "bao", "sach", "sách", "cardboard"]
  };

  let detectedBin = bin;
  if (!detectedBin) {
    for (const [binType, synonyms] of Object.entries(binSynonyms)) {
      if (synonyms.some(syn => t.includes(syn))) {
        detectedBin = binType;
        break;
      }
    }
  }

  let bestMatch = { tool: "help", args: {}, confidence: 0 };

  for (const [category, config] of Object.entries(patterns)) {
    for (const pattern of config.patterns) {
      if (pattern.test(t)) {
        const confidence = pattern.source.length;

        if (confidence > bestMatch.confidence) {
          let args = {};

          if (config.tool === "get_bin_weight" || config.tool === "get_bin_fill") {
            args = { bin: detectedBin || "plastic" };
          } else if (config.tool === "get_summary") {
            args = { windowHours: detectedTime };
          } else if (config.tool === "get_history") {
            args = { bin: detectedBin || "plastic", windowHours: detectedTime };
          } else if (config.tool === "open_bin") {
            args = { bin: detectedBin || "plastic" };
          }

          bestMatch = { tool: config.tool, args, confidence };
        }
      }
    }
  }

  if (bestMatch.confidence === 0) {
    return { tool: "help", args: {} };
  }

  return { tool: bestMatch.tool, args: bestMatch.args };
}

module.exports = { classify };