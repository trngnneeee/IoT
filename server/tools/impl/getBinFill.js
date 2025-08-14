const { getLatestReading } = require("../../services/queries");

// map tên thùng bạn đang dùng
function getBinName(binId) {
  const names = {
    organic: "hữu cơ",
    recyclable: "tái chế",
    landfill: "chôn lấp",
  };
  return names[binId] || binId;
}

// cùng ngưỡng với getBinStatus ở services
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

function generateFillMessage(doc, fillPct) {
  if (fillPct == null) {
    return `Không thể xác định mức độ đầy của thùng ${doc.binName}.`;
  }

  let message = `Thùng ${doc.binName} hiện tại đầy ${fillPct}%`;

  if (fillPct >= 90) message += " (ĐẦY GẦN HẾT)";
  else if (fillPct >= 75) message += " (ĐẦY NHIỀU)";
  else if (fillPct >= 50) message += " (ĐẦY MỘT NỬA)";
  else if (fillPct >= 25) message += " (ĐẦY ÍT)";
  else message += " (CÒN NHIỀU CHỖ TRỐNG)";

  if (doc.dataAge) {
    if (doc.dataAge.isRecent) {
      message += `\n Dữ liệu mới cập nhật (${doc.dataAge.hours} giờ trước)`;
    } else if (doc.dataAge.isStale) {
      message += `\n Dữ liệu cũ (${doc.dataAge.hours} giờ trước) - cân nhắc cập nhật cảm biến`;
    } else {
      message += `\n Dữ liệu cập nhật ${doc.dataAge.hours} giờ trước`;
    }
  }

  if (doc.status === "critical") {
    message += `\n KHẨN CẤP: Thùng đã đầy 80%+, cần dọn gấp!`;
  } else if (doc.status === "warning") {
    message += `\n CẢNH BÁO: Thùng đã đầy 70%+, cần dọn sớm.`;
  } else if (doc.status === "moderate") {
    message += `\n Thùng đang hoạt động bình thường.`;
  } else {
    message += `\n Thùng còn nhiều chỗ trống, hoạt động tốt.`;
  }

  return message;
}

async function getBinFill(args) {
  if (!args || !args.bin) {
    return { error: "Thiếu tham số 'bin'." };
  }

  try {
    const doc = await getLatestReading(args.bin);
    if (!doc) {
      return {
        bin: args.bin,
        binName: getBinName(args.bin),
        exists: false,
        message: `Không có dữ liệu cho thùng ${getBinName(args.bin)}`
      };
    }

    // fillPct đã tính sẵn trong getLatestReading (lấy từ percentage1/2/3)
    const fillPct = (typeof doc.fillPct === "number") ? doc.fillPct : null;
    const status = getStatusFromFill(fillPct);
    const recommendation = getRecommendation(status);

    const enriched = {
      bin: args.bin,
      binName: doc.binName || getBinName(args.bin),
      exists: true,
      fillPct,
      date: doc.date,           // từ trash-volume.date
      dataAge: doc.dataAge,     // đã tính trong getLatestReading
      status,
      recommendation,
      message: generateFillMessage({ ...doc, status }, fillPct)
    };

    return enriched;
  } catch (error) {
    console.error(`Error in getBinFill for bin ${args.bin}:`, error);
    return {
      error: "Có lỗi xảy ra khi lấy dữ liệu mức độ đầy",
      bin: args.bin,
      binName: getBinName(args.bin)
    };
  }
}

module.exports = getBinFill;
