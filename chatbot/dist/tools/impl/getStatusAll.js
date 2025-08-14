"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = getStatusAll;
const queries_1 = require("../../services/queries");
async function getStatusAll() {
    const bins = ["plastic", "organic", "metal"];
    const data = await (0, queries_1.getStatusAll)(bins);
    const items = bins.map(b => {
        const d = data[b];
        if (!d)
            return { bin: b, exists: false };
        return {
            bin: b,
            exists: true,
            weightKg: typeof d.weightKg === "number" ? Number(d.weightKg) : null,
            fillPct: (0, queries_1.computeFillPct)(d),
            createdAt: d.createdAt
        };
    });
    return { summary: items };
}
