// src/llm/schemas.js
const { z } = require("zod");

const BinEnum = z.enum(["organic", "recyclable", "landfill"]);

const ToolName = z.enum([
  "get_bin_weight",
  "get_bin_fill",
  "get_status_all",
  "get_summary",
  "get_history",
  "open_bin",
  "help",
  "who_web"
]);

const ArgsSchemas = {
  get_bin_weight: z.object({ bin: BinEnum }),
  get_bin_fill:   z.object({ bin: BinEnum }),
  get_status_all: z.object({}),
  get_summary:    z.object({
    windowHours: z.number().int().positive().max(168).default(24)
  }),
  get_history:    z.object({
    bin: BinEnum,
    windowHours: z.number().int().positive().max(168).default(24)
  }),
  open_bin:       z.object({ bin: BinEnum }),
  help:           z.object({}),
  who_web:        z.object({ bin: BinEnum })
};

const ToolCallSchema = z.object({
  tool: ToolName,
  args: z.record(z.string(), z.any()), // args có thể là bất kỳ object nào
  confidence: z.number().min(0).max(1).optional() // thêm confidence (tuỳ chọn)
});

module.exports = {
  BinEnum,
  ToolName,
  ArgsSchemas,
  ToolCallSchema
};
