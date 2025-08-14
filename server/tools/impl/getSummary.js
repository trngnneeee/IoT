const { getSummary: qSummary } = require("../../services/queries");

async function getSummary(args) {
  const hours = args?.windowHours ?? 24;
  const rows = await qSummary(hours);

  if (!Array.isArray(rows) || !rows.length) {
    return `Chưa có dữ liệu trong ${hours}h qua.`;
  }

  const text = rows
    .map(r => `• ${r._id}: ${Number(r.weightKg || 0).toFixed(2)} kg`)
    .join("\n");

  return `Tổng khối lượng cao nhất ghi nhận theo thùng trong ${hours}h:\n${text}`;
}

module.exports = getSummary;
