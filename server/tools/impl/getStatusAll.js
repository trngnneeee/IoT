const { computeFillPct, getStatusAll: qStatus } = require("../../services/queries");

async function getStatusAll() {
  const bins = ["plastic", "organic", "metal"];
  const data = await qStatus(bins);
  
  const items = bins.map(b => {
    const d = data[b];
    if (!d) {
      return { bin: b, exists: false };
    }
    return {
      bin: b,
      exists: true,
      weightKg: typeof d.weightKg === "number" ? Number(d.weightKg) : null,
      fillPct: computeFillPct(d),
      createdAt: d.createdAt
    };
  });

  return { summary: items };
}

module.exports = getStatusAll;
