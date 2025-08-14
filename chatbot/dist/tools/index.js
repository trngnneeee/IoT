"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TOOL_REGISTRY = void 0;
const getBinWeight_1 = __importDefault(require("./impl/getBinWeight"));
const getBinFill_1 = __importDefault(require("./impl/getBinFill"));
const getStatusAll_1 = __importDefault(require("./impl/getStatusAll"));
const getSummary_1 = __importDefault(require("./impl/getSummary"));
const getHistory_1 = __importDefault(require("./impl/getHistory"));
const openBin_1 = __importDefault(require("./impl/openBin"));
// Adapter to ensure all tool functions return Promise<string>
async function adaptToString(fn, args) {
    const result = await fn(args);
    if (typeof result === "string")
        return result;
    return JSON.stringify(result);
}
exports.TOOL_REGISTRY = {
    get_bin_weight: (args) => adaptToString(getBinWeight_1.default, args),
    get_bin_fill: (args) => adaptToString(getBinFill_1.default, args),
    get_status_all: (args) => adaptToString(getStatusAll_1.default, args),
    get_summary: (args) => adaptToString(getSummary_1.default, args),
    get_history: (args) => adaptToString(getHistory_1.default, args),
    open_bin: (args) => adaptToString(openBin_1.default, args),
    help: async () => generateHelpMessage()
};
/**
 * Generate comprehensive help message with examples and context
 */
function generateHelpMessage() {
    return `🤖 **GARBAGE AI CHATBOT - TRỢ GIÚP**

Tôi là chatbot thông minh cho hệ thống IoT phân loại rác. Tôi có thể giúp bạn:

📊 **THÔNG TIN THÙNG RÁC:**
• "Thùng nhựa nặng bao nhiêu?" - Xem khối lượng thùng nhựa
• "Thùng hữu cơ đầy mấy %?" - Xem mức độ đầy thùng hữu cơ
• "Thùng kim loại còn bao nhiêu chỗ trống?" - Xem dung lượng còn lại
• "Thùng giấy đang như thế nào?" - Xem tình trạng thùng giấy

📈 **TỔNG QUAN HỆ THỐNG:**
• "Tình trạng cả 3 thùng?" - Xem tổng quan tất cả thùng
• "Thùng nào đầy nhất?" - So sánh mức độ đầy các thùng
• "Hệ thống hoạt động thế nào?" - Kiểm tra sức khỏe hệ thống

📅 **THỐNG KÊ VÀ LỊCH SỬ:**
• "Tổng rác hôm nay?" - Tổng kết 24h qua
• "Bao nhiêu kg rác tuần này?" - Thống kê theo tuần
• "Lịch sử 6h thùng hữu cơ" - Theo dõi xu hướng
• "Biểu đồ thùng nhựa 1 tháng" - Phân tích dài hạn

🎛️ **ĐIỀU KHIỂN:**
• "Mở thùng nhựa" - Gửi lệnh mở thùng
• "Mở thùng hữu cơ" - Điều khiển servo
• "Mở thùng kim loại" - Kiểm soát cơ khí

💡 **CÁCH HỎI THÔNG MINH:**
• "Thùng nào cần dọn gấp?" - Tự động phát hiện thùng đầy
• "So sánh 3 thùng" - Phân tích tương quan
• "Xu hướng rác thải" - Phân tích thống kê
• "Khuyến nghị dọn dẹp" - Gợi ý thông minh

🔧 **ĐỊNH DẠNG DỮ LIỆU:**
• "Cho tôi dữ liệu JSON" - Xuất dữ liệu JSON
• "Tạo bảng CSV" - Xuất dữ liệu CSV
• "Vẽ biểu đồ" - Mô tả dữ liệu dạng biểu đồ

❓ **CÁC CÂU HỎI KHÁC:**
• "Bạn có thể làm gì?" - Xem danh sách tính năng
• "Giải thích dữ liệu" - Hiểu ý nghĩa số liệu
• "Cách sử dụng?" - Hướng dẫn chi tiết

💬 **GỢI Ý:**
Hãy hỏi tự nhiên như đang nói chuyện với bạn! Tôi hiểu tiếng Việt và tiếng Anh, có thể xử lý câu hỏi phức tạp và đưa ra gợi ý hữu ích.

Ví dụ: "Thùng nào đang có vấn đề và cần chú ý ngay?"
`;
}
