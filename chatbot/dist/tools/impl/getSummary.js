"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getSummary;
const queries_1 = require("../../services/queries");
async function getSummary(args) {
    const hours = args?.windowHours ?? 24;
    const rows = await (0, queries_1.getSummary)(hours);
    // Check if rows is an array and has data
    if (!Array.isArray(rows) || !rows.length) {
        return `Chưa có dữ liệu trong ${hours}h qua.`;
    }
    const text = rows.map((r) => `• ${r._id}: ${Number(r.weightKg || 0).toFixed(2)} kg`).join("\n");
    return `Tổng khối lượng cao nhất ghi nhận theo thùng trong ${hours}h:\n${text}`;
}
