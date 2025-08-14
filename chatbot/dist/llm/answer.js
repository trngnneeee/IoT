"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAnswer = generateAnswer;
const node_fetch_1 = __importDefault(require("node-fetch"));
const MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b-instruct";
const BASE = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";
/**
 * Generate intelligent, context-aware answers from tool results + user intent.
 * Enhanced to provide more natural, helpful responses with better context understanding.
 */
async function generateAnswer(params) {
    const { userQuestion, tool, args, data } = params;
    const SYSTEM = `
Bạn là trợ lý AI thông minh cho hệ thống IoT phân loại rác thông minh. 
Mục tiêu: tạo câu trả lời tự nhiên, hữu ích, và chính xác dựa trên dữ liệu thực tế.

QUY TẮC TRẢ LỜI:
1. NGÔN NGỮ: Luôn trả lời bằng tiếng Việt tự nhiên, thân thiện
2. ĐỘ CHÍNH XÁC: Chỉ sử dụng dữ liệu thực từ "DATA", không bịa số
3. NGỮ CẢNH: Bổ sung thông tin hữu ích khi có thể (ví dụ: so sánh giữa các thùng)
4. ĐỊNH DẠNG: Tuân theo yêu cầu định dạng của người dùng nếu có
5. ĐƠN VỊ: Luôn ghi rõ đơn vị (kg, %, cm, giờ, ngày)
6. THỜI GIAN: Ghi rõ thời điểm dữ liệu được cập nhật

CÁC LOẠI THÙNG:
- Plastic (Nhựa): chai, lon, nilon, bao bì
- Organic (Hữu cơ): thực phẩm, rau củ, thức ăn thừa
- Metal (Kim loại): sắt, nhôm, lon, can
- Paper (Giấy): giấy, báo, sách, bìa carton

XỬ LÝ DỮ LIỆU:
- Nếu thiếu dữ liệu: "Chưa có dữ liệu cho [thùng/thời gian]"
- Nếu có lỗi: Giải thích lỗi một cách thân thiện
- Nếu dữ liệu cũ: Ghi rõ "Dữ liệu cập nhật lần cuối: [thời gian]"

BỐI CẢNH BỔ SUNG:
- So sánh giữa các thùng khi có thể
- Đưa ra gợi ý hữu ích (ví dụ: "Thùng [X] đang đầy, cần dọn sớm")
- Giải thích ý nghĩa của số liệu khi cần thiết
`;
    // Enhanced format detection with Vietnamese support
    const wantsJSON = /\b(json|JSON)\b/i.test(userQuestion);
    const wantsCSV = /\b(csv|CSV)\b/i.test(userQuestion);
    const wantsTable = /\b(table|bảng|markdown|markdown table)\b/i.test(userQuestion);
    const wantsChart = /\b(biểu đồ|chart|graph|đồ thị)\b/i.test(userQuestion);
    const formatInstruction = wantsJSON
        ? "Hãy trả lời CHỈ LÀ JSON hợp lệ, không có text khác."
        : wantsCSV
            ? "Hãy trả lời ở định dạng CSV: hàng đầu là header, các hàng sau là dữ liệu."
            : wantsTable
                ? "Hãy trả lời bằng Markdown table với định dạng đẹp."
                : wantsChart
                    ? "Hãy mô tả dữ liệu dưới dạng biểu đồ, sử dụng ASCII art hoặc mô tả chi tiết."
                    : "Hãy trả lời tự nhiên bằng tiếng Việt, có thể bổ sung thông tin hữu ích.";
    // Enhanced context analysis
    const contextHints = [];
    if (tool === "get_bin_weight" || tool === "get_bin_fill") {
        contextHints.push("Đây là thông tin về một thùng cụ thể. Có thể so sánh với các thùng khác nếu có dữ liệu.");
    }
    else if (tool === "get_status_all") {
        contextHints.push("Đây là tổng quan tất cả thùng. Hãy phân tích và so sánh tình trạng các thùng.");
    }
    else if (tool === "get_summary") {
        contextHints.push("Đây là tổng kết theo thời gian. Hãy giải thích ý nghĩa của các con số.");
    }
    else if (tool === "get_history") {
        contextHints.push("Đây là dữ liệu lịch sử. Hãy phân tích xu hướng và thay đổi theo thời gian.");
    }
    const USER = `
CÂU HỎI CỦA NGƯỜI DÙNG: ${userQuestion}

CÔNG CỤ ĐƯỢC SỬ DỤNG: ${tool}
THAM SỐ: ${JSON.stringify(args, null, 2)}

DỮ LIỆU THỰC TẾ:
${JSON.stringify(data, null, 2)}

YÊU CẦU ĐỊNH DẠNG: ${formatInstruction}

GỢI Ý NGỮ CẢNH: ${contextHints.join(" ")}

HƯỚNG DẪN:
- Trả lời tự nhiên, thân thiện như đang nói chuyện với bạn
- Sử dụng dữ liệu thực tế, không bịa số
- Bổ sung thông tin hữu ích khi có thể
- Nếu có lỗi hoặc thiếu dữ liệu, giải thích rõ ràng
- Luôn ghi rõ đơn vị và thời gian
`;
    try {
        const r = await (0, node_fetch_1.default)(`${BASE}/api/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: MODEL,
                messages: [
                    { role: "system", content: SYSTEM },
                    { role: "user", content: USER }
                ],
                options: { temperature: 0.1 } // Slightly more creative but still accurate
            })
        });
        if (!r.ok)
            throw new Error(`Ollama answer gen ${r.status}`);
        const dataResp = await r.json();
        return String(dataResp?.message?.content ?? "").trim();
    }
    catch (error) {
        // Enhanced fallback with better error handling
        console.error("LLM answer generation failed:", error);
        // Generate a smart fallback response
        return generateFallbackResponse(userQuestion, tool, args, data);
    }
}
/**
 * Generate intelligent fallback response when LLM fails
 */
function generateFallbackResponse(userQuestion, tool, args, data) {
    try {
        if (!data || (typeof data === 'object' && Object.keys(data).length === 0)) {
            return "Xin lỗi, hiện tại không có dữ liệu để trả lời câu hỏi của bạn. Vui lòng thử lại sau.";
        }
        let response = "";
        switch (tool) {
            case "get_bin_weight":
                if (data.exists && data.weightKg !== null) {
                    response = `Thùng ${getBinName(args.bin)} hiện tại có khối lượng ${data.weightKg} kg. Dữ liệu cập nhật lần cuối: ${formatTime(data.createdAt)}.`;
                }
                else {
                    response = `Không có dữ liệu khối lượng cho thùng ${getBinName(args.bin)}.`;
                }
                break;
            case "get_bin_fill":
                if (data.exists && data.fillPct !== null) {
                    response = `Thùng ${getBinName(args.bin)} hiện tại đầy ${data.fillPct}%. Dữ liệu cập nhật lần cuối: ${formatTime(data.createdAt)}.`;
                }
                else {
                    response = `Không có dữ liệu mức độ đầy cho thùng ${getBinName(args.bin)}.`;
                }
                break;
            case "get_status_all":
                response = "Tình trạng tất cả thùng:\n";
                for (const [binId, binData] of Object.entries(data)) {
                    if (binData && typeof binData === 'object' && 'exists' in binData && binData.exists) {
                        const weight = binData.weightKg !== null ? `${binData.weightKg} kg` : "không có dữ liệu";
                        const fill = binData.fillPct !== null ? `${binData.fillPct}%` : "không có dữ liệu";
                        response += `- Thùng ${getBinName(binId)}: ${weight}, đầy ${fill}\n`;
                    }
                }
                break;
            case "get_summary":
                if (Array.isArray(data) && data.length > 0) {
                    response = `Tổng kết ${args.windowHours || 24} giờ qua:\n`;
                    data.forEach((item) => {
                        response += `- Thùng ${getBinName(item._id)}: ${item.weightKg || 0} kg\n`;
                    });
                }
                else {
                    response = `Không có dữ liệu tổng kết cho ${args.windowHours || 24} giờ qua.`;
                }
                break;
            case "get_history":
                if (Array.isArray(data) && data.length > 0) {
                    response = `Lịch sử ${args.windowHours || 24} giờ qua của thùng ${getBinName(args.bin)}:\n`;
                    data.slice(0, 5).forEach((item, index) => {
                        const time = formatTime(item.createdAt);
                        const weight = item.weightKg !== null ? `${item.weightKg} kg` : "không có dữ liệu";
                        response += `${index + 1}. ${time}: ${weight}\n`;
                    });
                    if (data.length > 5) {
                        response += `... và ${data.length - 5} bản ghi khác.`;
                    }
                }
                else {
                    response = `Không có dữ liệu lịch sử cho thùng ${getBinName(args.bin)} trong ${args.windowHours || 24} giờ qua.`;
                }
                break;
            case "open_bin":
                response = `Đã gửi lệnh mở thùng ${getBinName(args.bin)}. Thùng sẽ mở trong vài giây.`;
                break;
            default:
                response = "Tôi đã xử lý yêu cầu của bạn. Nếu cần thêm thông tin, hãy hỏi cụ thể hơn.";
        }
        return response;
    }
    catch (error) {
        return "Xin lỗi, có lỗi xảy ra khi xử lý dữ liệu. Vui lòng thử lại sau.";
    }
}
/**
 * Get Vietnamese name for bin type
 */
function getBinName(binId) {
    const binNames = {
        "plastic": "nhựa",
        "organic": "hữu cơ",
        "metal": "kim loại",
        "paper": "giấy"
    };
    return binNames[binId] || binId;
}
/**
 * Format timestamp for display
 */
function formatTime(timestamp) {
    if (!timestamp)
        return "không xác định";
    try {
        const date = new Date(timestamp);
        if (isNaN(date.getTime()))
            return "không xác định";
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        if (diffHours < 1)
            return "vài phút trước";
        if (diffHours < 24)
            return `${diffHours} giờ trước`;
        if (diffHours < 48)
            return "hôm qua";
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    }
    catch {
        return "không xác định";
    }
}
