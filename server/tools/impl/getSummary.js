const { getSummary: qSummary } = require("../../services/queries");

function fmt(n, digits = 2) {
  const x = Number(n);
  return Number.isFinite(x) ? x.toFixed(digits) : "0.00";
}

function binLabel(id) {
  const map = {
    1: "organic (hữu cơ)",
    2: "recyclable (tái chế)",
    3: "landfill (chôn lấp)",
  };
  return map[id] || `Bin ${id}`;
}

async function getSummary(args) {
  // queries.getSummary() hiện trả snapshot "current", không theo hours
  const res = await qSummary();

  if (!res || res.error) {
    return res?.error || "Không thể lấy dữ liệu tổng kết.";
  }

  const { period, bins, summary } = res;

  if (!Array.isArray(bins) || bins.length === 0) {
    return `Chưa có dữ liệu trong${period ? " " + period : ""}.`;
  }

  const lines = bins.map(b =>
    `• ${binLabel(b._id)}: ${fmt(b.weightKg)} kg — đầy ${b.trash_vol ?? "N/A"}%`
  ).join("\n");

  const total = summary?.totalWeight;
  const avg   = summary?.averageWeight;
  const footer = (total != null || avg != null)
    ? `\n\nTổng: ${fmt(total)} kg • Trung bình: ${fmt(avg)} kg`
    : "";

  return `Tổng hợp trọng lượng ${period || "hiện tại"}:\n${lines}${footer}`;
}

module.exports = getSummary;
