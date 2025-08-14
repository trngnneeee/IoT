import { getHistory as qHistory } from "../../services/queries";

export default async function getHistory(args: { bin: string, windowHours?: number }) {
  if (!args?.bin) return "Thiếu tham số 'bin'.";
  const hours = args?.windowHours ?? 24;
  const items = await qHistory(args.bin, hours);
  
  // Check if items is an array and has data
  if (!Array.isArray(items) || !items.length) {
    return `Không có dữ liệu ${hours}h qua cho thùng ${args.bin}.`;
  }
  
  const first = items[0], last = items[items.length - 1];
  const delta = (Number(last.weightKg) - Number(first.weightKg)).toFixed(2);
  return `Lịch sử ${hours}h thùng ${args.bin}: ${items.length} điểm. Chênh lệch ~${delta} kg.`;
}
