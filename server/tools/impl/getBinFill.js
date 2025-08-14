// src/llm/impl/getBinFill.js
const { getLatestReading, computeFillPct } = require("../../services/queries");

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

    // Ensure fill percentage is calculated
    const fillPct = doc.fillPct !== undefined ? doc.fillPct : computeFillPct(doc);

    return {
      bin: args.bin,
      binName: doc.binName || getBinName(args.bin),
      exists: true,
      fillPct: fillPct,
      distanceCm: doc.distanceCm,
      binHeightCm: doc.binHeightCm,
      createdAt: doc.createdAt,
      dataAge: doc.dataAge,
      status: doc.status || "unknown",
      recommendation: doc.recommendation || "Không có khuyến nghị",
      message: generateFillMessage(doc, fillPct)
    };
  } catch (error) {
    console.error(`Error in getBinFill for bin ${args.bin}:`, error);
    return {
      error: "Có lỗi xảy ra khi lấy dữ liệu mức độ đầy",
      bin: args.bin,
      binName: getBinName(args.bin)
    };
  }
}

function getBinName(binId) {
  const binNames = {
    plastic: "nhựa",
    organic: "hữu cơ",
    metal: "kim loại",
    paper: "giấy"
  };
  return binNames[binId] || binId;
}

function generateFillMessage(doc, fillPct) {
  if (fillPct === null || fillPct === undefined) {
    return `Không thể xác định mức độ đầy của thùng ${doc.binName} (thiếu dữ liệu cảm biến)`;
  }

  let message = `Thùng ${doc.binName} hiện tại đầy ${fillPct}%`;

  // Add capacity description
  if (fillPct >= 90) {
    message += ` (ĐẦY GẦN HẾT)`;
  } else if (fillPct >= 75) {
    message += ` (ĐẦY NHIỀU)`;
  } else if (fillPct >= 50) {
    message += ` (ĐẦY MỘT NỬA)`;
  } else if (fillPct >= 25) {
    message += ` (ĐẦY ÍT)`;
  } else {
    message += ` (CÒN NHIỀU CHỖ TRỐNG)`;
  }

  // Add data freshness info
  if (doc.dataAge) {
    if (doc.dataAge.isRecent) {
      message += `\n📊 Dữ liệu mới cập nhật (${doc.dataAge.hours} giờ trước)`;
    } else if (doc.dataAge.isStale) {
      message += `\n⚠️ Dữ liệu cũ (${doc.dataAge.hours} giờ trước) - cần cập nhật cảm biến`;
    } else {
      message += `\n📊 Dữ liệu cập nhật ${doc.dataAge.hours} giờ trước`;
    }
  }

  // Add recommendations
  if (doc.status === "critical") {
    message += `\n🚨 KHẨN CẤP: Thùng đã đầy 90%+, cần dọn gấp!`;
  } else if (doc.status === "warning") {
    message += `\n⚠️ CẢNH BÁO: Thùng đã đầy 75%+, cần dọn sớm.`;
  } else if (doc.status === "moderate") {
    message += `\nℹ️ Thùng đang hoạt động bình thường.`;
  } else {
    message += `\n✅ Thùng còn nhiều chỗ trống, hoạt động tốt.`;
  }

  // Add technical details if available
  if (doc.distanceCm !== undefined && doc.binHeightCm !== undefined) {
    const remainingCm = doc.binHeightCm - doc.distanceCm;
    message += `\n📏 Chi tiết kỹ thuật: Cảm biến cách đáy ${doc.distanceCm}cm, thùng cao ${doc.binHeightCm}cm, còn ${remainingCm}cm chỗ trống.`;
  }

  return message;
}

module.exports = getBinFill;
