const { enqueueOpen } = require("../../services/queries");

async function openBin(args) {
  if (!args?.bin) return "Thiếu tham số 'bin'.";
  await enqueueOpen(args.bin);
  return `Đã xếp lệnh mở thùng ${args.bin} cho ESP32. ✅`;
}

module.exports = openBin;
