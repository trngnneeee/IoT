"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getHistory;
const queries_1 = require("../../services/queries");
async function getHistory(args) {
    if (!args?.bin)
        return "Thiếu tham số 'bin'.";
    const hours = args?.windowHours ?? 24;
    const items = await (0, queries_1.getHistory)(args.bin, hours);
    // Check if items is an array and has data
    if (!Array.isArray(items) || !items.length) {
        return `Không có dữ liệu ${hours}h qua cho thùng ${args.bin}.`;
    }
    const first = items[0], last = items[items.length - 1];
    const delta = (Number(last.weightKg) - Number(first.weightKg)).toFixed(2);
    return `Lịch sử ${hours}h thùng ${args.bin}: ${items.length} điểm. Chênh lệch ~${delta} kg.`;
}
