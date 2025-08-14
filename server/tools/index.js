const getBinWeight = require("./impl/getBinWeight");
const getBinFill = require("./impl/getBinFill");
const getStatusAll = require("./impl/getStatusAll");
const getSummary = require("./impl/getSummary");
const getHistory = require("./impl/getHistory");
const openBin = require("./impl/openBin");
const whoWeb = require("./impl/whoWeb");

// Adapter to ensure all tool functions return Promise<string>
// Adapter để mọi tool trả về string
async function adaptToString(fn, args) {
  // Trả nguyên giá trị (object là object, string là string)
  return await fn(args);
}
function generateHelpMessage() {
  return `**GARBAGE AI CHATBOT - TRỢ GIÚP**

Tôi là chatbot thông minh cho hệ thống IoT phân loại rác. Tôi có thể giúp bạn:

**THÔNG TIN THÙNG RÁC:**
• "Thùng hữu cơ nặng bao nhiêu?" - Xem khối lượng thùng hữu cơ
• "Thùng tái chế đầy mấy %?" - Xem mức độ đầy thùng tái chế
• "Thùng chôn lấp đang như thế nào?" - Xem tình trạng thùng chôn lấp

**TỔNG QUAN HỆ THỐNG:**
• "Tình trạng cả 3 thùng?" - Xem tổng quan tất cả thùng
• "Thùng nào đầy nhất?" - So sánh mức độ đầy các thùng
• "Hệ thống hoạt động thế nào?" - Kiểm tra sức khỏe hệ thống

**THỐNG KÊ VÀ LỊCH SỬ:**
• "Tổng rác hôm nay?" - Tổng kết 24h qua
• "Bao nhiêu kg rác tuần này?" - Thống kê theo tuần
• "Lịch sử 6h thùng hữu cơ" - Theo dõi xu hướng
• "Biểu đồ thùng tái chế 1 tháng" - Phân tích dài hạn

**ĐIỀU KHIỂN:**
• "Mở thùng tái chế" - Gửi lệnh mở thùng
• "Mở thùng hữu cơ" - Điều khiển servo
• "Mở thùng chôn lấp" - Kiểm soát cơ khí

**CÁCH HỎI THÔNG MINH:**
• "Thùng nào cần dọn gấp?" - Tự động phát hiện thùng đầy
• "So sánh 3 thùng" - Phân tích tương quan
• "Xu hướng rác thải" - Phân tích thống kê
• "Khuyến nghị dọn dẹp" - Gợi ý thông minh

**ĐỊNH DẠNG DỮ LIỆU:**
• "Cho tôi dữ liệu JSON" - Xuất dữ liệu JSON
• "Tạo bảng CSV" - Xuất dữ liệu CSV
• "Vẽ biểu đồ" - Mô tả dữ liệu dạng biểu đồ

**CÁC CÂU HỎI KHÁC:**
• "Bạn có thể làm gì?" - Xem danh sách tính năng
• "Giải thích dữ liệu" - Hiểu ý nghĩa số liệu
• "Cách sử dụng?" - Hướng dẫn chi tiết

**GỢI Ý:**
Hãy hỏi tự nhiên như đang nói chuyện với bạn! Tôi hiểu tiếng Việt và tiếng Anh, có thể xử lý câu hỏi phức tạp và đưa ra gợi ý hữu ích.

Ví dụ: "Thùng nào đang có vấn đề và cần chú ý ngay?"
`;
}

const TOOL_REGISTRY = {
  get_bin_weight : (args) => adaptToString(getBinWeight, args),
  get_bin_fill   : (args) => adaptToString(getBinFill, args),
  get_status_all : (args) => adaptToString(getStatusAll, args),
  get_summary    : (args) => adaptToString(getSummary, args),
  get_history    : (args) => adaptToString(getHistory, args),
  open_bin       : (args) => adaptToString(openBin, args),
  who_web        : (args) => adaptToString(whoWeb, args),
  help           : async () => `...help message...`
};

// 👇 Export theo 2 kiểu để caller nào cũng chạy được
module.exports = TOOL_REGISTRY;            // const registry = require(...);
module.exports.TOOL_REGISTRY = TOOL_REGISTRY; // const { TOOL_REGISTRY } = require(...);