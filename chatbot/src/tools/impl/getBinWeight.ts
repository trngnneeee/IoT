import { getLatestReading } from "../../services/queries";

export default async function getBinWeight(args: { bin: string }) {
  if (!args?.bin) return { error: "Thiếu tham số 'bin'." };
  
  try {
    const doc = await getLatestReading(args.bin);
    if (!doc) return { 
      bin: args.bin, 
      binName: getBinName(args.bin),
      exists: false,
      message: `Không có dữ liệu cho thùng ${getBinName(args.bin)}`
    };

    return {
      bin: args.bin,
      binName: doc.binName || getBinName(args.bin),
      exists: true,
      weightKg: typeof doc.weightKg === "number" ? Number(doc.weightKg) : null,
      createdAt: doc.createdAt,
      dataAge: doc.dataAge,
      status: doc.status || 'unknown',
      recommendation: doc.recommendation || 'Không có khuyến nghị',
      message: generateWeightMessage(doc)
    };
  } catch (error) {
    console.error(`Error in getBinWeight for bin ${args.bin}:`, error);
    return { 
      error: "Có lỗi xảy ra khi lấy dữ liệu khối lượng",
      bin: args.bin,
      binName: getBinName(args.bin)
    };
  }
}

function getBinName(binId: string): string {
  const binNames: Record<string, string> = {
    "plastic": "nhựa",
    "organic": "hữu cơ", 
    "metal": "kim loại",
    "paper": "giấy"
  };
  return binNames[binId] || binId;
}

function generateWeightMessage(doc: any): string {
  if (doc.weightKg === null || doc.weightKg === undefined) {
    return `Không có dữ liệu khối lượng cho thùng ${doc.binName}`;
  }
  
  let message = `Thùng ${doc.binName} hiện tại có khối lượng ${doc.weightKg} kg`;
  
  if (doc.dataAge) {
    if (doc.dataAge.isRecent) {
      message += ` (dữ liệu mới cập nhật, ${doc.dataAge.hours} giờ trước)`;
    } else if (doc.dataAge.isStale) {
      message += ` (dữ liệu cũ, ${doc.dataAge.hours} giờ trước - cần cập nhật)`;
    } else {
      message += ` (dữ liệu cập nhật ${doc.dataAge.hours} giờ trước)`;
    }
  }
  
  if (doc.status === 'critical') {
    message += `. ⚠️ Thùng đang rất nặng, cần dọn gấp!`;
  } else if (doc.status === 'warning') {
    message += `. ⚠️ Thùng đang khá nặng, cần dọn sớm.`;
  }
  
  return message;
}
