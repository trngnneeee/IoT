const { getDB } = require("../../services/db"); // hoặc đường dẫn db thực của bạn
const { getLatestReading } = require("../../services/queries");

const INDEX_BY_BIN = { organic: 1, recyclable: 2, landfill: 3 };

function getBinName(binId) {
  const names = { organic: "hữu cơ", recyclable: "tái chế", landfill: "chôn lấp" };
  return names[binId] || binId;
}

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

function generateWeightMessage({ binName, weightKg, dataAge, status }) {
  if (weightKg == null) return `Không có dữ liệu khối lượng cho thùng ${binName}`;

  let msg = `Thùng ${binName} hiện tại nặng ${weightKg} kg`;
  if (dataAge) {
    if (dataAge.isRecent) msg += ` (dữ liệu mới, ${dataAge.hours} giờ trước)`;
    else if (dataAge.isStale) msg += ` (dữ liệu cũ, ${dataAge.hours} giờ trước)`;
    else msg += ` (cập nhật ${dataAge.hours} giờ trước)`;
  }
  if (status === "critical") msg += `. Cần dọn gấp!`;
  else if (status === "warning") msg += `. Cần dọn sớm.`;
  return msg;
}

async function getLatestWeightsDoc() {
  const db = await getDB();
  const col = db.collection("trash-weight");
  // lấy bản ghi mới nhất
  return col.find({}).sort({ _id: -1 }).limit(1).next();
}

async function getBinWeight(args) {
  if (!args || !args.bin) return { error: "Thiếu tham số 'bin'." };

  const bin = String(args.bin);
  const idx = INDEX_BY_BIN[bin];
  if (!idx) return { error: `bin không hợp lệ: ${bin}` };

  try {
    // 1) lấy cân nặng mới nhất từ trash-weight
    const wdoc = await getLatestWeightsDoc();
    if (!wdoc) {
      return {
        bin,
        binName: getBinName(bin),
        exists: false,
        message: `Không có dữ liệu cân nặng cho thùng ${getBinName(bin)}`
      };
    }
    const weightKey = `w${idx}`;
    const weightKg = typeof wdoc[weightKey] === "number" ? Number(wdoc[weightKey]) : null;

    // 2) lấy thông tin % đầy + thời gian từ trash-volume (để có status/recommendation)
    const volDoc = await getLatestReading(bin); // đã trả về {fillPct, date, dataAge, ...}
    const fillPct = volDoc?.fillPct ?? null;
    const status = getStatusFromFill(fillPct);
    const recommendation = getRecommendation(status);

    // dùng thời gian từ trash-volume (vì trash-weight hiện chưa có 'date')
    const dataAge = volDoc?.dataAge ?? null;
    const date = volDoc?.date ?? null;

    const response = {
      bin,
      binName: volDoc?.binName || getBinName(bin),
      exists: true,
      weightKg,
      // thông tin kèm theo từ volume
      fillPct,
      date,
      dataAge,
      status,
      recommendation,
    };

    return {
      ...response,
      message: generateWeightMessage(response)
    };

  } catch (error) {
    console.error(`Error in getBinWeight for bin ${args.bin}:`, error);
    return {
      error: "Có lỗi xảy ra khi lấy dữ liệu khối lượng",
      bin,
      binName: getBinName(bin)
    };
  }
}

module.exports = getBinWeight;
