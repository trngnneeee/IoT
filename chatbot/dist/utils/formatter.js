"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResponseFormatter = void 0;
class ResponseFormatter {
    static formatResponse(data, userPreferences, userQuery, tool, args) {
        // Check if user specifically requested a format
        const requestedFormat = this.detectRequestedFormat(userQuery);
        const format = requestedFormat || userPreferences.responseFormat;
        switch (format) {
            case 'json':
                return this.formatAsJSON(data, tool, args);
            case 'table':
                return this.formatAsTable(data, tool, args);
            case 'csv':
                return this.formatAsCSV(data, tool, args);
            case 'natural':
            default:
                return this.formatAsNatural(data, userPreferences, userQuery, tool, args);
        }
    }
    static detectRequestedFormat(query) {
        const lowerQuery = query.toLowerCase();
        if (/json|dữ liệu json|raw data/i.test(lowerQuery))
            return 'json';
        if (/table|bảng|biểu|tabular/i.test(lowerQuery))
            return 'table';
        if (/csv|excel|spreadsheet/i.test(lowerQuery))
            return 'csv';
        return null;
    }
    static formatAsJSON(data, tool, args) {
        const response = {
            tool,
            args,
            data,
            timestamp: new Date().toISOString(),
            format: 'json'
        };
        return {
            content: JSON.stringify(response, null, 2),
            format: 'json',
            metadata: response
        };
    }
    static formatAsTable(data, tool, args) {
        let tableContent = '';
        if (tool === 'get_status_all' && Array.isArray(data)) {
            tableContent = this.createBinStatusTable(data);
        }
        else if (tool === 'get_summary' && typeof data === 'object') {
            tableContent = this.createSummaryTable(data);
        }
        else if (tool === 'get_history' && Array.isArray(data)) {
            tableContent = this.createHistoryTable(data);
        }
        else {
            tableContent = this.createGenericTable(data, tool, args);
        }
        return {
            content: tableContent,
            format: 'table',
            metadata: { tool, args, data }
        };
    }
    static formatAsCSV(data, tool, args) {
        let csvContent = '';
        if (tool === 'get_status_all' && Array.isArray(data)) {
            csvContent = this.createBinStatusCSV(data);
        }
        else if (tool === 'get_summary' && typeof data === 'object') {
            csvContent = this.createSummaryCSV(data);
        }
        else if (tool === 'get_history' && Array.isArray(data)) {
            csvContent = this.createHistoryCSV(data);
        }
        else {
            csvContent = this.createGenericCSV(data, tool, args);
        }
        return {
            content: csvContent,
            format: 'csv',
            metadata: { tool, args, data }
        };
    }
    static formatAsNatural(data, preferences, userQuery, tool, args) {
        let content = '';
        const suggestions = [];
        switch (tool) {
            case 'get_bin_weight':
                content = this.formatWeightResponse(data, preferences.language);
                suggestions.push('Bạn có muốn xem mức độ đầy của thùng này không?');
                suggestions.push('So sánh với các thùng khác?');
                break;
            case 'get_bin_fill':
                content = this.formatFillResponse(data, preferences.language);
                if (data.percentage > 80) {
                    suggestions.push('Thùng này đã gần đầy, cần dọn dẹp sớm!');
                }
                suggestions.push('Xem khối lượng thực tế?');
                break;
            case 'get_status_all':
                content = this.formatStatusResponse(data, preferences.language);
                suggestions.push('Phân tích xu hướng?');
                suggestions.push('So sánh hiệu suất các thùng?');
                break;
            case 'get_summary':
                content = this.formatSummaryResponse(data, preferences.language);
                suggestions.push('Xem chi tiết từng thùng?');
                suggestions.push('Phân tích theo giờ?');
                break;
            case 'get_history':
                content = this.formatHistoryResponse(data, preferences.language);
                suggestions.push('Vẽ biểu đồ xu hướng?');
                suggestions.push('So sánh với các ngày khác?');
                break;
            case 'open_bin':
                content = this.formatControlResponse(data, preferences.language);
                suggestions.push('Kiểm tra trạng thái thùng?');
                suggestions.push('Xem lịch sử mở thùng?');
                break;
            default:
                content = this.formatGenericResponse(data, preferences.language);
        }
        // Add context-aware suggestions based on conversation history
        if (preferences.autoSuggestions) {
            suggestions.push(...this.generateContextualSuggestions(tool, args, data));
        }
        return {
            content,
            format: 'natural',
            suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
            metadata: { tool, args, data }
        };
    }
    static formatWeightResponse(data, language) {
        if (language === 'vi') {
            return `Thùng ${data.bin} hiện tại có khối lượng ${data.weight}kg. ${this.getWeightContext(data.weight)}`;
        }
        return `The ${data.bin} bin currently weighs ${data.weight}kg. ${this.getWeightContext(data.weight)}`;
    }
    static formatFillResponse(data, language) {
        if (language === 'vi') {
            return `Thùng ${data.bin} đang đầy ${data.percentage}%. ${this.getFillContext(data.percentage)}`;
        }
        return `The ${data.bin} bin is ${data.percentage}% full. ${this.getFillContext(data.percentage)}`;
    }
    static formatStatusResponse(data, language) {
        if (language === 'vi') {
            return `Tình trạng các thùng:\n${data.map((bin) => `• ${bin.bin}: ${bin.weight}kg (${bin.percentage}% đầy)`).join('\n')}`;
        }
        return `Bin status:\n${data.map((bin) => `• ${bin.bin}: ${bin.weight}kg (${bin.percentage}% full)`).join('\n')}`;
    }
    static formatSummaryResponse(data, language) {
        if (language === 'vi') {
            return `Tổng kết ${data.windowHours} giờ qua: ${data.totalWeight}kg rác được thu gom. ${this.getSummaryContext(data)}`;
        }
        return `Summary for the last ${data.windowHours} hours: ${data.totalWeight}kg of waste collected. ${this.getSummaryContext(data)}`;
    }
    static formatHistoryResponse(data, language) {
        if (language === 'vi') {
            return `Lịch sử thùng ${data.bin} trong ${data.windowHours} giờ qua: ${data.length} bản ghi. ${this.getHistoryContext(data)}`;
        }
        return `History for ${data.bin} bin over the last ${data.windowHours} hours: ${data.length} records. ${this.getHistoryContext(data)}`;
    }
    static formatControlResponse(data, language) {
        if (language === 'vi') {
            return `Đã gửi lệnh mở thùng ${data.bin}. ${data.status === 'success' ? 'Thùng đã được mở thành công!' : 'Đang xử lý...'}`;
        }
        return `Command sent to open ${data.bin} bin. ${data.status === 'success' ? 'Bin opened successfully!' : 'Processing...'}`;
    }
    static formatGenericResponse(data, language) {
        if (language === 'vi') {
            return `Đã xử lý yêu cầu của bạn. Kết quả: ${JSON.stringify(data, null, 2)}`;
        }
        return `Your request has been processed. Result: ${JSON.stringify(data, null, 2)}`;
    }
    static getWeightContext(weight) {
        if (weight > 50)
            return 'Thùng này khá nặng, có thể cần dọn dẹp.';
        if (weight > 30)
            return 'Thùng có khối lượng trung bình.';
        return 'Thùng còn nhiều chỗ trống.';
    }
    static getFillContext(percentage) {
        if (percentage > 90)
            return 'Thùng đã gần đầy hoàn toàn!';
        if (percentage > 80)
            return 'Thùng đã khá đầy, cần chú ý.';
        if (percentage > 60)
            return 'Thùng đã đầy hơn một nửa.';
        if (percentage > 30)
            return 'Thùng đã có một lượng rác đáng kể.';
        return 'Thùng còn nhiều chỗ trống.';
    }
    static getSummaryContext(data) {
        const avgPerHour = data.totalWeight / data.windowHours;
        if (avgPerHour > 10)
            return 'Tốc độ thu gom khá cao.';
        if (avgPerHour > 5)
            return 'Tốc độ thu gom bình thường.';
        return 'Tốc độ thu gom thấp.';
    }
    static getHistoryContext(data) {
        if (data.length === 0)
            return 'Không có dữ liệu trong khoảng thời gian này.';
        if (data.length < 5)
            return 'Dữ liệu còn ít, cần thêm thời gian để phân tích.';
        return 'Đủ dữ liệu để phân tích xu hướng.';
    }
    static generateContextualSuggestions(tool, args, data) {
        const suggestions = [];
        if (tool === 'get_bin_weight' || tool === 'get_bin_fill') {
            suggestions.push('So sánh với các thùng khác?');
            suggestions.push('Xem xu hướng thay đổi?');
        }
        if (tool === 'get_status_all') {
            suggestions.push('Phân tích hiệu suất?');
            suggestions.push('Dự đoán thời gian đầy?');
        }
        if (tool === 'get_summary') {
            suggestions.push('So sánh với ngày hôm qua?');
            suggestions.push('Phân tích theo giờ cao điểm?');
        }
        return suggestions;
    }
    // Table formatting methods
    static createBinStatusTable(data) {
        let table = '┌─────────┬──────────┬─────────────┬─────────────┐\n';
        table += '│ Thùng   │ Khối lượng│ % Đầy      │ Trạng thái  │\n';
        table += '├─────────┼──────────┼─────────────┼─────────────┤\n';
        data.forEach((bin) => {
            const status = bin.percentage > 80 ? '⚠️ Cần dọn' : bin.percentage > 60 ? '🟡 Trung bình' : '🟢 Bình thường';
            table += `│ ${bin.bin.padEnd(7)} │ ${bin.weight.toString().padStart(8)}kg │ ${bin.percentage.toString().padStart(9)}% │ ${status.padEnd(11)} │\n`;
        });
        table += '└─────────┴──────────┴─────────────┴─────────────┘';
        return table;
    }
    static createSummaryTable(data) {
        let table = '┌─────────────────┬─────────────┐\n';
        table += '│ Chỉ số          │ Giá trị     │\n';
        table += '├─────────────────┼─────────────┤\n';
        table += `│ Tổng khối lượng │ ${data.totalWeight}kg     │\n`;
        table += `│ Thời gian       │ ${data.windowHours}h      │\n`;
        table += `│ Trung bình/giờ  │ ${(data.totalWeight / data.windowHours).toFixed(1)}kg/h   │\n`;
        table += '└─────────────────┴─────────────┘';
        return table;
    }
    static createHistoryTable(data) {
        if (data.length === 0)
            return 'Không có dữ liệu lịch sử.';
        let table = '┌─────────────────────┬──────────┬─────────────┐\n';
        table += '│ Thời gian           │ Khối lượng│ % Đầy      │\n';
        table += '├─────────────────────┼──────────┼─────────────┤\n';
        data.slice(0, 10).forEach((record) => {
            const time = new Date(record.timestamp).toLocaleString('vi-VN');
            table += `│ ${time.padEnd(19)} │ ${record.weight.toString().padStart(8)}kg │ ${record.percentage.toString().padStart(9)}% │\n`;
        });
        if (data.length > 10) {
            table += `│ ... và ${data.length - 10} bản ghi khác    │\n`;
        }
        table += '└─────────────────────┴──────────┴─────────────┘';
        return table;
    }
    static createGenericTable(data, tool, args) {
        let table = '┌─────────────────┬─────────────┐\n';
        table += '│ Thông tin       │ Giá trị     │\n';
        table += '├─────────────────┼─────────────┤\n';
        table += `│ Tool             │ ${tool.padEnd(11)} │\n`;
        table += `│ Arguments        │ ${JSON.stringify(args).padEnd(11)} │\n`;
        table += `│ Data             │ ${JSON.stringify(data).substring(0, 20).padEnd(11)} │\n`;
        table += '└─────────────────┴─────────────┘';
        return table;
    }
    // CSV formatting methods
    static createBinStatusCSV(data) {
        let csv = 'Thùng,Khối lượng,% Đầy,Trạng thái\n';
        data.forEach((bin) => {
            const status = bin.percentage > 80 ? 'Cần dọn' : bin.percentage > 60 ? 'Trung bình' : 'Bình thường';
            csv += `${bin.bin},${bin.weight}kg,${bin.percentage}%,${status}\n`;
        });
        return csv;
    }
    static createSummaryCSV(data) {
        return `Chỉ số,Giá trị\nTổng khối lượng,${data.totalWeight}kg\nThời gian,${data.windowHours}h\nTrung bình/giờ,${(data.totalWeight / data.windowHours).toFixed(1)}kg/h`;
    }
    static createHistoryCSV(data) {
        if (data.length === 0)
            return 'Thời gian,Khối lượng,% Đầy\nKhông có dữ liệu';
        let csv = 'Thời gian,Khối lượng,% Đầy\n';
        data.forEach((record) => {
            const time = new Date(record.timestamp).toLocaleString('vi-VN');
            csv += `${time},${record.weight}kg,${record.percentage}%\n`;
        });
        return csv;
    }
    static createGenericCSV(data, tool, args) {
        return `Thông tin,Giá trị\nTool,${tool}\nArguments,${JSON.stringify(args)}\nData,${JSON.stringify(data)}`;
    }
}
exports.ResponseFormatter = ResponseFormatter;
