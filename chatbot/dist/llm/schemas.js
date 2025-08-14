"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolCallSchema = exports.ArgsSchemas = exports.ToolName = exports.BinEnum = void 0;
// src/llm/schemas.ts
const zod_1 = require("zod");
exports.BinEnum = zod_1.z.enum(["plastic", "organic", "metal", "paper"]);
exports.ToolName = zod_1.z.enum([
    "get_bin_weight",
    "get_bin_fill",
    "get_status_all",
    "get_summary",
    "get_history",
    "open_bin",
    "help"
]);
exports.ArgsSchemas = {
    get_bin_weight: zod_1.z.object({ bin: exports.BinEnum }),
    get_bin_fill: zod_1.z.object({ bin: exports.BinEnum }),
    get_status_all: zod_1.z.object({}),
    get_summary: zod_1.z.object({ windowHours: zod_1.z.number().int().positive().max(168).default(24) }),
    get_history: zod_1.z.object({ bin: exports.BinEnum, windowHours: zod_1.z.number().int().positive().max(168).default(24) }),
    open_bin: zod_1.z.object({ bin: exports.BinEnum }),
    help: zod_1.z.object({})
};
exports.ToolCallSchema = zod_1.z.object({
    tool: exports.ToolName,
    args: zod_1.z.record(zod_1.z.string(), zod_1.z.any()), // args can be any object
    confidence: zod_1.z.number().min(0).max(1).optional() // ← thêm confidence (tuỳ chọn)
});
