const { getHistory: qHistory } = require("../../services/queries");

async function getHistory(args) {
  if (!args || !args.bin) return "Thiếu tham số 'bin'.";
  
  const hours = args.windowHours ?? 24;
  const items = await qHistory(args.bin, hours);
  
  if (!Array.isArray(items) || !items.length) {
    return `Không có dữ liệu ${hours}h qua cho thùng ${args.bin}.`;
  }
  
  const first = items[0];
  const last = items[items.length - 1];
  const delta = (Number(last.weightKg) - Number(first.weightKg)).toFixed(2);
  
  return `Lịch sử ${hours}h thùng ${args.bin}: ${items.length} điểm. Chênh lệch ~${delta} kg.`;
}

module.exports = getHistory;