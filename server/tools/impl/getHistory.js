const { getHistoryVolume } = require("../../services/queries");

function getBinName(binId) {
  const names = { organic: "hữu cơ", recyclable: "tái chế", landfill: "chôn lấp" };
  return names[binId] || binId;
}

function fmt(n, digits = 2) {
  if (n == null || Number.isNaN(Number(n))) return null;
  return Number(n).toFixed(digits);
}

async function getHistory(args) {
  if (!args || !args.bin) return "Thiếu tham số 'bin'.";
  console.log(`getHistory: args=${JSON.stringify(args)}`);
  const bin = args.bin;
  const hours = args.windowHours ? args.windowHours : 24;
  console.log(`getHistory: bin=${getBinName(bin)}, hours=${hours}`);
  const raw = await getHistoryVolume(bin, hours); // từ queries
  const items = Array.isArray(raw) ? raw : raw?.data;

  if (!Array.isArray(items) || items.length === 0) {
    return `Không có dữ liệu ${hours}h qua cho thùng ${getBinName(bin)}.`;
  }

  // ✅ Sắp xếp theo thời gian tăng dần (cũ → mới)
  items.sort((a, b) => new Date(a.date) - new Date(b.date));

  const first = items[0];
  const last = items[items.length - 1];

  const hasFill = typeof first.fillPct === "number" || typeof last.fillPct === "number";
  const hasWeight = typeof first.weightKg === "number" || typeof last.weightKg === "number";

  const t0 = first.date ? new Date(first.date) : null;
  const t1 = last.date ? new Date(last.date) : null;
  const timeNote = (t0 && t1)
    ? ` (${t0.toLocaleString()} → ${t1.toLocaleString()})`
    : "";

  if (hasWeight) {
    const deltaKg = (Number(last.weightKg || 0) - Number(first.weightKg || 0));
    const arrow = deltaKg > 0 ? "↗" : (deltaKg < 0 ? "↘" : "→");
    return `Lịch sử ${hours}h thùng ${getBinName(bin)}: ${items.length} điểm${timeNote}. `
         + `Khối lượng ~${fmt(deltaKg)} kg ${arrow} (từ ${fmt(first.weightKg)} kg lên ${fmt(last.weightKg)} kg).`;
  }

  if (hasFill) {
    const deltaPct = (Number(last.fillPct || 0) - Number(first.fillPct || 0));
    const arrow = deltaPct > 0 ? "↗" : (deltaPct < 0 ? "↘" : "→");
    return `Lịch sử ${hours}h thùng ${getBinName(bin)}: ${items.length} điểm${timeNote}. `
         + `Mức đầy ~${fmt(deltaPct)}% ${arrow} (từ ${fmt(first.fillPct)}% lên ${fmt(last.fillPct)}%).`;
  }

  return `Có ${items.length} bản ghi trong ${hours}h cho thùng ${getBinName(bin)}${timeNote}, `
       + `nhưng không tìm thấy trường 'weightKg' hoặc 'fillPct' để tính chênh lệch.`;
}

module.exports = getHistory;
