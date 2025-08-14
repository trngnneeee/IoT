import { getSummary as qSummary } from "../../services/queries";

export default async function getSummary(args: { windowHours?: number }) {
  const hours = args?.windowHours ?? 24;
  const rows = await qSummary(hours);
  
  // Check if rows is an array and has data
  if (!Array.isArray(rows) || !rows.length) {
    return `Chưa có dữ liệu trong ${hours}h qua.`;
  }
  
  const text = rows.map((r: any) => `• ${r._id}: ${Number(r.weightKg || 0).toFixed(2)} kg`).join("\n");
  return `Tổng khối lượng cao nhất ghi nhận theo thùng trong ${hours}h:\n${text}`;
}
