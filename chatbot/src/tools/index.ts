import getBinWeight from "./impl/getBinWeight";
import getBinFill from "./impl/getBinFill";
import getStatusAll from "./impl/getStatusAll";
import getSummary from "./impl/getSummary";
import getHistory from "./impl/getHistory";
import openBin from "./impl/openBin";
import whoWeb from "./impl/whoWeb";

type ToolFn = (args: any) => Promise<string>;

// Adapter to ensure all tool functions return Promise<string>
async function adaptToString(fn: Function, args: any): Promise<string> {
  const result = await fn(args);
  if (typeof result === "string") return result;
  return JSON.stringify(result);
}

export const TOOL_REGISTRY: Record<string, ToolFn> = {
  get_bin_weight: (args) => adaptToString(getBinWeight, args),
  get_bin_fill: (args) => adaptToString(getBinFill, args),
  get_status_all: (args) => adaptToString(getStatusAll, args),
  get_summary: (args) => adaptToString(getSummary, args),
  get_history: (args) => adaptToString(getHistory, args),
  open_bin: (args) => adaptToString(openBin, args),
  help: async () => generateHelpMessage(),
  who_web: (args) => adaptToString(whoWeb, args)
};

/**
 * Generate comprehensive help message with examples and context
 */
function generateHelpMessage(): string {
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

