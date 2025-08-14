const { getStatusAll: queryStatusAll } = require("../../services/queries"); // Đổi tên tránh xung đột
function getStatusFromFill(fillPct) {
  if (fillPct == null) return "unknown (không biết)";
  if (fillPct >= 80) return "critical (nguy cấp)";
  if (fillPct >= 70) return "warning (cảnh báo)";
  if (fillPct >= 50) return "moderate (vừa phải)";
  return "good (tốt)";
}

function getRecommendation(status) {
  switch (status) {
    case "critical (nguy cấp)":  return "Cần dọn gấp - thùng đã đầy 80%+";
    case "warning (cảnh báo)":   return "Cần dọn sớm - thùng đã đầy 70%+";
    case "moderate (vừa phải)":  return "Thùng đang hoạt động bình thường";
    case "good (tốt)":      return "Thùng còn nhiều chỗ trống";
    default:          return "Không có khuyến nghị";
  }
}

function toVN(binId) {
  const map = { organic: "hữu cơ", recyclable: "tái chế", landfill: "chôn lấp" };
  return map[binId] || binId;
}

async function getStatusAll() {
  const data = await queryStatusAll(["organic", "recyclable", "landfill"]);
  console.log("getStatusAll: data", data);
  if (!data || !Array.isArray(data.bins)) {
    return { summary: [], systemStatus: undefined };
  }

  const items = data.bins.map((b) => ({
    bin: b.binId,
    exists: b.fillPct != null,
    binName: b.binName || toVN(b.binId),
    fillPct: b.fillPct ?? null,
    date: b.date || null,
    dataAge: b.dataAge || null,
    status: b.status || "unknown",
    recommendation: getRecommendation(b.status) || undefined,
    allPercentages: getStatusFromFill(b.fillPct) || undefined
  }));

  const systemStatus = {
    totalBins: data.totalBins || items.length,
    activeBins: data.activeBins || items.filter(x => x.exists).length,
    criticalBins: data.criticalBins || items.filter(x => x.status === "critical").length,
    lastUpdate: data.lastUpdate ? new Date(data.lastUpdate) : new Date(),
    overallHealth: data.overallHealth || "good"
  };
  console.log("getStatusAll: systemStatus", systemStatus);
  console.log("getStatusAll: items", items);
  return { summary: items, systemStatus };
}

module.exports = getStatusAll;
