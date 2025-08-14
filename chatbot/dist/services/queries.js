"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLatestReading = getLatestReading;
exports.computeFillPct = computeFillPct;
exports.getStatusAll = getStatusAll;
exports.getSummary = getSummary;
exports.getHistory = getHistory;
exports.enqueueOpen = enqueueOpen;
const db_1 = require("./db");
async function getLatestReading(binId) {
    try {
        const col = (await (0, db_1.getDB)()).collection("bin_readings");
        const doc = await col.find({ binId }).sort({ createdAt: -1 }).limit(1).next();
        if (doc) {
            // Calculate fill percentage if not already present
            if (doc.fillPct === undefined && doc.distanceCm !== undefined && doc.binHeightCm !== undefined) {
                doc.fillPct = computeFillPct(doc);
            }
            // Add human-readable bin name
            doc.binName = getBinName(binId);
            // Add data freshness indicator
            const now = new Date();
            const ageMs = now.getTime() - doc.createdAt.getTime();
            const ageHours = ageMs / (1000 * 60 * 60);
            doc.dataAge = {
                hours: Math.round(ageHours * 10) / 10,
                isRecent: ageHours < 1,
                isStale: ageHours > 24
            };
        }
        return doc;
    }
    catch (error) {
        console.error(`Error getting latest reading for bin ${binId}:`, error);
        return null;
    }
}
function computeFillPct(doc) {
    if (!doc)
        return null;
    try {
        if (typeof doc.distanceCm === "number" && typeof doc.binHeightCm === "number" && doc.binHeightCm > 0) {
            const pct = Math.round(((doc.binHeightCm - doc.distanceCm) / doc.binHeightCm) * 100);
            return Math.max(0, Math.min(100, pct));
        }
        return typeof doc.fillPct === "number" ? doc.fillPct : null;
    }
    catch (error) {
        console.error("Error computing fill percentage:", error);
        return null;
    }
}
async function getStatusAll(bins = ["plastic", "organic", "metal"]) {
    try {
        const out = {};
        const results = await Promise.all(bins.map(async (b) => {
            const data = await getLatestReading(b);
            if (data) {
                // Add comparison data
                data.status = getBinStatus(data);
                data.recommendation = getBinRecommendation(data);
            }
            return { bin: b, data };
        }));
        results.forEach(({ bin, data }) => {
            out[bin] = data;
        });
        // Add overall system status
        out.systemStatus = {
            totalBins: bins.length,
            activeBins: results.filter(r => r.data).length,
            criticalBins: results.filter(r => r.data && r.data.status === 'critical').length,
            lastUpdate: new Date(),
            overallHealth: getOverallHealth(results)
        };
        return out;
    }
    catch (error) {
        console.error("Error getting status all:", error);
        return {};
    }
}
async function getSummary(hours = 24) {
    try {
        const col = (await (0, db_1.getDB)()).collection("bin_readings");
        const since = new Date(Date.now() - hours * 3600 * 1000);
        const pipeline = [
            { $match: { createdAt: { $gte: since } } },
            { $group: {
                    _id: "$binId",
                    weightKg: { $max: "$weightKg" },
                    avgWeightKg: { $avg: "$weightKg" },
                    readings: { $sum: 1 },
                    lastUpdate: { $max: "$createdAt" }
                } },
            { $sort: { _id: 1 } }
        ];
        const results = await col.aggregate(pipeline).toArray();
        // Add additional insights
        const totalWeight = results.reduce((sum, item) => sum + (item.weightKg || 0), 0);
        const avgWeight = results.reduce((sum, item) => sum + (item.avgWeightKg || 0), 0) / results.length;
        return {
            period: `${hours} giờ`,
            bins: results,
            summary: {
                totalWeight: Math.round(totalWeight * 100) / 100,
                averageWeight: Math.round(avgWeight * 100) / 100,
                totalReadings: results.reduce((sum, item) => sum + item.readings, 0),
                binCount: results.length
            }
        };
    }
    catch (error) {
        console.error("Error getting summary:", error);
        return { error: "Không thể lấy dữ liệu tổng kết" };
    }
}
async function getHistory(binId, hours = 24) {
    try {
        const col = (await (0, db_1.getDB)()).collection("bin_readings");
        const since = new Date(Date.now() - hours * 3600 * 1000);
        const results = await col.find({ binId, createdAt: { $gte: since } })
            .project({ weightKg: 1, distanceCm: 1, binHeightCm: 1, createdAt: 1, fillPct: 1 })
            .sort({ createdAt: 1 })
            .limit(500)
            .toArray();
        if (results.length === 0) {
            return { binId, period: `${hours} giờ`, data: [], message: "Không có dữ liệu lịch sử" };
        }
        // Calculate trends and insights
        const trends = calculateTrends(results);
        return {
            binId,
            binName: getBinName(binId),
            period: `${hours} giờ`,
            data: results,
            trends,
            summary: {
                totalReadings: results.length,
                weightRange: {
                    min: Math.min(...results.map(r => r.weightKg || 0)),
                    max: Math.max(...results.map(r => r.weightKg || 0)),
                    current: results[results.length - 1]?.weightKg || 0
                },
                fillRange: {
                    min: Math.min(...results.map(r => r.fillPct || 0)),
                    max: Math.max(...results.map(r => r.fillPct || 0)),
                    current: results[results.length - 1]?.fillPct || 0
                }
            }
        };
    }
    catch (error) {
        console.error(`Error getting history for bin ${binId}:`, error);
        return { error: "Không thể lấy dữ liệu lịch sử" };
    }
}
async function enqueueOpen(binId) {
    try {
        const col = (await (0, db_1.getDB)()).collection("commands");
        const doc = {
            deviceId: "esp32-main",
            action: "open",
            binId,
            status: "pending",
            createdAt: new Date(),
            priority: "normal"
        };
        await col.insertOne(doc);
        // Log the command
        console.log(`[Command] Queued open command for bin ${binId}`);
        return {
            success: true,
            message: `Đã gửi lệnh mở thùng ${getBinName(binId)}`,
            commandId: doc._id,
            timestamp: doc.createdAt
        };
    }
    catch (error) {
        console.error(`Error enqueueing open command for bin ${binId}:`, error);
        return { success: false, error: "Không thể gửi lệnh mở thùng" };
    }
}
// Enhanced helper functions
function getBinName(binId) {
    const binNames = {
        "plastic": "nhựa",
        "organic": "hữu cơ",
        "metal": "kim loại",
        "paper": "giấy"
    };
    return binNames[binId] || binId;
}
function getBinStatus(data) {
    if (!data)
        return 'unknown';
    if (data.fillPct >= 90)
        return 'critical';
    if (data.fillPct >= 75)
        return 'warning';
    if (data.fillPct >= 50)
        return 'moderate';
    return 'good';
}
function getBinRecommendation(data) {
    if (!data)
        return 'Không có dữ liệu';
    const status = getBinStatus(data);
    switch (status) {
        case 'critical':
            return 'Cần dọn gấp - thùng đã đầy 90%+';
        case 'warning':
            return 'Cần dọn sớm - thùng đã đầy 75%+';
        case 'moderate':
            return 'Thùng đang hoạt động bình thường';
        default:
            return 'Thùng còn nhiều chỗ trống';
    }
}
function getOverallHealth(results) {
    const criticalCount = results.filter(r => r.data && r.data.status === 'critical').length;
    const warningCount = results.filter(r => r.data && r.data.status === 'warning').length;
    if (criticalCount > 0)
        return 'critical';
    if (warningCount > 0)
        return 'warning';
    return 'good';
}
function calculateTrends(data) {
    if (data.length < 2)
        return { message: "Không đủ dữ liệu để tính xu hướng" };
    try {
        const weights = data.map(d => d.weightKg || 0).filter(w => w > 0);
        if (weights.length < 2)
            return { message: "Không đủ dữ liệu khối lượng để tính xu hướng" };
        const firstHalf = weights.slice(0, Math.floor(weights.length / 2));
        const secondHalf = weights.slice(Math.floor(weights.length / 2));
        const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        const change = avgSecond - avgFirst;
        const changePercent = (change / avgFirst) * 100;
        let trend = 'stable';
        if (changePercent > 10)
            trend = 'increasing';
        else if (changePercent < -10)
            trend = 'decreasing';
        return {
            trend,
            change: Math.round(change * 100) / 100,
            changePercent: Math.round(changePercent * 100) / 100,
            message: getTrendMessage(trend, changePercent)
        };
    }
    catch (error) {
        return { message: "Không thể tính xu hướng", error: String(error) };
    }
}
function getTrendMessage(trend, changePercent) {
    switch (trend) {
        case 'increasing':
            return `Khối lượng đang tăng (${changePercent > 0 ? '+' : ''}${changePercent.toFixed(1)}%)`;
        case 'decreasing':
            return `Khối lượng đang giảm (${changePercent.toFixed(1)}%)`;
        default:
            return 'Khối lượng ổn định';
    }
}
