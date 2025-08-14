const { getDB } = require("./db");

const index_name_bin = {
  organic: 1,
  recyclable: 2,
  landfill: 3
};

function getBinName(keyOrIndex) {
  const names = { organic: "hữu cơ", recyclable: "tái chế", landfill: "chôn lấp" };
  const reverse = { 1: "organic", 2: "recyclable", 3: "landfill" };
  if (typeof keyOrIndex === "number") return names[reverse[keyOrIndex]] || `Bin ${keyOrIndex}`;
  return names[keyOrIndex] || String(keyOrIndex);
}

/** ---------- % đầy (trash-volume) ---------- **/
async function getLatestReading(binId /* organic|recyclable|landfill */) {
  try {
    console.log(`getLatestReading: binId=${binId}`);
    const binIndex = index_name_bin[binId];
    if (!binIndex) throw new Error(`binId không hợp lệ: ${binId}`);

    const db = await getDB();
    const vol = db.collection("trash-volume");

    // Lấy record mới nhất theo 'date'
    const doc = await vol.find({}).sort({ date: -1 }).limit(1).next();
    if (!doc) return null;

    const key = `percentage${binIndex}`;
    const fillPct = (typeof doc[key] === "number") ? doc[key] : null;

    const ts = doc.date ? new Date(doc.date) : null;
    const ageHours = ts ? (Date.now() - ts.getTime()) / 36e5 : null;

    return {
      binId,
      binName: getBinName(binId),
      fillPct,
      allPercentages: {
        p1: doc.percentage1,
        p2: doc.percentage2,
        p3: doc.percentage3
      },
      date: ts,
      dataAge: (ageHours == null) ? null : {
        hours: Math.round(ageHours * 10) / 10,
        isRecent: ageHours < 1,
        isStale: ageHours > 24
      },
      _id: doc._id
    };
  } catch (err) {
    console.error(`Error getting latest reading for bin ${binId}:`, err);
    return null;
  }
}

async function getAllLatestReadings() {
  try {
    const db = await getDB();
    const vol = db.collection("trash-volume");
    const doc = await vol.find({}).sort({ date: -1 }).limit(1).next();
    if (!doc) return [];

    const ts = doc.date ? new Date(doc.date) : null;
    const ageHours = ts ? (Date.now() - ts.getTime()) / 36e5 : null;

    const common = {
      date: ts,
      dataAge: (ageHours == null) ? null : {
        hours: Math.round(ageHours * 10) / 10,
        isRecent: ageHours < 1,
        isStale: ageHours > 24
      },
      _id: doc._id
    };

    return [1,2,3].map(i => ({
      binId: i,
      binName: getBinName(i),
      fillPct: doc[`percentage${i}`] ?? null,
      ...common
    }));
  } catch (err) {
    console.error("Error getting all latest readings:", err);
    return [];
  }
}

/** ---------- Trạng thái tổng hợp ---------- **/
function getBinStatus(data) {
  if (!data || data.fillPct == null) return "unknown (không biết)";
  if (data.fillPct >= 80) return "critical (nguy cấp)";
  if (data.fillPct >= 70) return "warning (cảnh báo)";
  if (data.fillPct >= 50) return "moderate (vừa phải)";
  return "good (tốt)";
}

function getBinRecommendation(data) {
  if (!data) return "Không có dữ liệu";
  const s = getBinStatus(data);
  if (s === "critical (nguy cấp)") return "Cần dọn gấp - thùng đã đầy 80%+";
  if (s === "warning (cảnh báo)")  return "Cần dọn sớm - thùng đã đầy 70%+";
  if (s === "moderate (vừa phải)") return "Thùng đang hoạt động bình thường";
  return "Thùng còn nhiều chỗ trống";
}

function getOverallHealth(results) {
  const critical = results.filter(r => r.data?.status === "critical (nguy cấp)").length;
  const warning  = results.filter(r => r.data?.status === "warning (cảnh báo)").length;
  if (critical > 0) return "critical (nguy cấp)";
  if (warning  > 0) return "warning (cảnh báo)";
  return "good (tốt)";
}

async function getStatusAll(bins = ["organic", "recyclable", "landfill"]) {
  try {
    const results = await Promise.all(bins.map(async binId => {
      const data = await getLatestReading(binId);
      if (data) {
        // Lấy % đầy và tình trạng
        data.status = getBinStatus(data); // ví dụ: "normal", "warning", "critical"
        data.recommendation = getBinRecommendation(data);
      }
      return {
        binId,
        binName: getBinName(binId),
        fillPct: data?.fillPct ?? null,
        status: data?.status ?? "unknown"
      };
    }));
    console.log("getStatusAll: results", results);
    return {
      bins: results,
      totalBins: bins.length,
      activeBins: results.filter(r => r.fillPct !== null).length,
      criticalBins: results.filter(r => r.status === "critical").length,
      lastUpdate: new Date(),
      overallHealth: getOverallHealth(results)
    };
  } catch (err) {
    console.error("Error getting status all:", err);
    return {};
  }
}

/** ---------- Khối lượng (trash-weight) ---------- **
 * Hiện collection chỉ có 1 doc duy nhất với w1/w2/w3 → lấy doc mới nhất theo _id
 */
async function getLatestWeights() {
  try {
    const db = await getDB();
    const col = db.collection("trash-weight");
    const doc = await col.find({}).sort({ _id: -1 }).limit(1).next();
    if (!doc) return null;
    return {
      w1: doc.w1 ?? null,
      w2: doc.w2 ?? null,
      w3: doc.w3 ?? null,
      _id: doc._id
    };
  } catch (err) {
    console.error("Error getting latest weights:", err);
    return null;
  }
}

/** getSummary(): tổng hợp nhanh trọng lượng hiện tại (vì không có lịch sử thời gian) */
async function getSummary() {
  try {
    const weights = await getLatestWeights();
    const vols = await getLatestReading("organic");
    if (!weights) return { error: "Không có dữ liệu cân nặng" };
    if (!vols) return { error: "Không có dữ liệu dung lượng rác trong thùng" };
    const bins = [
      { _id: 1, weightKg: weights.w1 ?? 0, trash_vol: vols.allPercentages.p1 ?? 0 },
      { _id: 2, weightKg: weights.w2 ?? 0, trash_vol: vols.allPercentages.p2 ?? 0 },
      { _id: 3, weightKg: weights.w3 ?? 0, trash_vol: vols.allPercentages.p3 ?? 0 },
    ];
    const totalWeight = bins.reduce((s,b)=>s+(b.weightKg||0),0);
    const avgWeight = totalWeight / bins.length;
    console.log(`getSummary: tổng trọng lượng ${totalWeight} kg, trung bình ${avgWeight} kg`);
    return {
      period: "hiện tại",
      bins,
      summary: {
        totalWeight: Math.round(totalWeight * 100) / 100,
        averageWeight: Math.round(avgWeight * 100) / 100,
        totalReadings: 1,
        binCount: bins.length,
        weight: {
          min: Math.min(...bins.map(b => b.weightKg)),
          max: Math.max(...bins.map(b => b.weightKg)),
          avg: Math.round(avgWeight * 100) / 100
        }
      }
    };
  } catch (err) {
    console.error("Error getting summary:", err);
    return { error: "Không thể lấy dữ liệu tổng kết" };
  }
}
/** Lịch sử cân nặng */ 
async function getHistoryVolume(binId, hours = 24) {
  try {
    const db = await getDB();
    const col = db.collection("trash-volume");

    const since = new Date(Date.now() - hours * 3600 * 1000);
    const binIndex = index_name_bin[binId];
    if (!binIndex) throw new Error(`binId không hợp lệ: ${binId}`);

    const key = `percentage${binIndex}`;

    const results = await col.find({ date: { $gte: since } })
      .project({ [key]: 1, date: 1 })
      .sort({ date: 1 })
      .toArray();

    return {
      binId,
      binName: getBinName(binId),
      period: `${hours} giờ`,
      data: results.map(r => ({
        date: r.date,
        fillPct: r[key]
      })),
      totalReadings: results.length
    };
  } catch (err) {
    console.error(`Error getting volume history for bin ${binId}:`, err);
    return { error: "Không thể lấy dữ liệu lịch sử % đầy" };
  }
}

/** ---------- Hàng đợi mở nắp (open-can) ---------- **/
async function enqueueOpen(binId) {
  try {
    const db = await getDB();
    const col = db.collection("open-can"); // đúng tên collection
    const doc = {
      id: Number(index_name_bin[binId]), // 1|2|3
      pressedBy: "",                     // có thể ghi userId
      pressed: false,
      date: new Date()
    };
    const result = await col.insertOne(doc);

    console.log(`[Open can] Queued open command for bin ${binId}`);
    return {
      success: true,
      message: `Đã gửi lệnh mở thùng ${getBinName(binId)}`,
      commandId: result.insertedId,
      timestamp: doc.date
    };
  } catch (error) {
    console.error(`Error enqueueing open command for bin ${binId}:`, error);
    return { success: false, error: "Không thể gửi lệnh mở thùng" };
  }
}

module.exports = {
  // % đầy
  getLatestReading,
  getAllLatestReadings,
  getStatusAll,

  // cân nặng
  getLatestWeights,
  getSummary,
  getHistoryVolume,

  // điều khiển
  enqueueOpen
};
