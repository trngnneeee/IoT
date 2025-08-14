"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = openBin;
const queries_1 = require("../../services/queries");
async function openBin(args) {
    if (!args?.bin)
        return "Thiếu tham số 'bin'.";
    await (0, queries_1.enqueueOpen)(args.bin);
    return `Đã xếp lệnh mở thùng ${args.bin} cho ESP32. ✅`;
}
