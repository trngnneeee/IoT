// tools/impl/openBin.js
const { enqueueOpen } = require("../../services/queries");

// map tên & validate
const VALID_BINS = new Set(["organic", "recyclable", "landfill"]);
const BIN_NAME = { organic: "hữu cơ", recyclable: "tái chế", landfill: "chôn lấp" };

module.exports = async function openBin(args) {
  const bin = typeof args?.bin === "string" ? args.bin.toLowerCase().trim() : null;

  if (!bin || !VALID_BINS.has(bin)) {
    return {
      error: "Thiếu hoặc bin không hợp lệ. Hãy dùng: organic | recyclable | landfill.",
      bin: args?.bin ?? null
    };
  }

  try {
    const result = await enqueueOpen(bin); // gọi services/queries.enqueueOpen

    // Chuẩn hóa output để formatter/route dùng ổn định
    const ok = !!result?.success;
    return {
      bin,
      binName: BIN_NAME[bin] || bin,
      status: ok ? "success" : "queued",
      message:
        result?.message ||
        (ok ? `Đã gửi lệnh mở thùng ${ArgsSchemas.getBinName(bin)}` : `Đã xếp lệnh mở thùng ${ArgsSchemas.getBinName(bin)}`),
      commandId: result?.commandId ?? result?._id ?? null,
      timestamp: result?.timestamp ?? result?.date ?? new Date().toISOString()
    };
  } catch (err) {
    return {
      error: "Không thể gửi lệnh mở thùng",
      bin,
      detail: err?.message || String(err)
    };
  }
};
