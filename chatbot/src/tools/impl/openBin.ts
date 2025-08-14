import { enqueueOpen } from "../../services/queries";

export default async function openBin(args: { bin: string }) {
  if (!args?.bin) return "Thiếu tham số 'bin'.";
  await enqueueOpen(args.bin);
  return `Đã xếp lệnh mở thùng ${args.bin} cho ESP32. ✅`;
}
