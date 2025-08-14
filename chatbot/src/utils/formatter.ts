import { UserPreferences } from './conversation';

export interface FormattedResponse {
  content: string;
  format: 'natural' | 'json' | 'table' | 'csv';
  suggestions?: string[];
  metadata?: any;
}

export class ResponseFormatter {
  static formatResponse(
    data: any,
    userPreferences: UserPreferences,
    userQuery: string,
    tool: string,
    args: any
  ): FormattedResponse {
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

  private static detectRequestedFormat(query: string): 'json' | 'table' | 'csv' | null {
    const lowerQuery = query.toLowerCase();
    if (/json|dữ liệu json|raw data/i.test(lowerQuery)) return 'json';
    if (/table|bảng|biểu|tabular/i.test(lowerQuery)) return 'table';
    if (/csv|excel|spreadsheet/i.test(lowerQuery)) return 'csv';
    return null;
  }

  private static formatAsJSON(data: any, tool: string, args: any): FormattedResponse {
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

  private static formatAsTable(data: any, tool: string, args: any): FormattedResponse {
    let tableContent = '';

    if (tool === 'get_status_all' && Array.isArray(data)) {
      tableContent = this.createBinStatusTable(data);
    } else if (tool === 'get_summary' && typeof data === 'object') {
      tableContent = this.createSummaryTable(data);
    } else if (tool === 'get_history' && Array.isArray(data)) {
      tableContent = this.createHistoryTable(data);
    } else {
      tableContent = this.createGenericTable(data, tool, args);
    }

    return {
      content: tableContent,
      format: 'table',
      metadata: { tool, args, data }
    };
  }

  private static formatAsCSV(data: any, tool: string, args: any): FormattedResponse {
    let csvContent = '';

    if (tool === 'get_status_all' && Array.isArray(data)) {
      csvContent = this.createBinStatusCSV(data);
    } else if (tool === 'get_summary' && typeof data === 'object') {
      csvContent = this.createSummaryCSV(data);
    } else if (tool === 'get_history' && Array.isArray(data)) {
      csvContent = this.createHistoryCSV(data);
    } else {
      csvContent = this.createGenericCSV(data, tool, args);
    }

    return {
      content: csvContent,
      format: 'csv',
      metadata: { tool, args, data }
    };
  }

  private static formatAsNatural(
    data: any,
    preferences: UserPreferences,
    userQuery: string,
    tool: string,
    args: any
  ): FormattedResponse {
    let content = '';
    const suggestions: string[] = [];

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
      case 'who_web':
        content = this.formatWhoWebResponse(data, preferences.language);
        suggestions.push('Xem thêm thông tin về hệ thống?');
        suggestions.push('Hỏi về các thành viên nhóm phát triển?');
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

  private static formatWeightResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Thùng ${data.bin} hiện tại có khối lượng ${data.weight}kg. ${this.getWeightContext(data.weight)}`;
    }
    return `The ${data.bin} bin currently weighs ${data.weight}kg. ${this.getWeightContext(data.weight)}`;
  }

  private static formatFillResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Thùng ${data.bin} đang đầy ${data.percentage}%. ${this.getFillContext(data.percentage)}`;
    }
    return `The ${data.bin} bin is ${data.percentage}% full. ${this.getFillContext(data.percentage)}`;
  }

  private static formatStatusResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Tình trạng các thùng:\n${data.map((bin: any) => 
        `• ${bin.bin}: ${bin.weight}kg (${bin.percentage}% đầy)`
      ).join('\n')}`;
    }
    return `Bin status:\n${data.map((bin: any) => 
      `• ${bin.bin}: ${bin.weight}kg (${bin.percentage}% full)`
    ).join('\n')}`;
  }

  private static formatSummaryResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Tổng kết ${data.windowHours} giờ qua: ${data.totalWeight}kg rác được thu gom. ${this.getSummaryContext(data)}`;
    }
    return `Summary for the last ${data.windowHours} hours: ${data.totalWeight}kg of waste collected. ${this.getSummaryContext(data)}`;
  }

  private static formatHistoryResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Lịch sử thùng ${data.bin} trong ${data.windowHours} giờ qua: ${data.length} bản ghi. ${this.getHistoryContext(data)}`;
    }
    return `History for ${data.bin} bin over the last ${data.windowHours} hours: ${data.length} records. ${this.getHistoryContext(data)}`;
  }

  private static formatControlResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Đã gửi lệnh mở thùng ${data.bin}. ${data.status === 'success' ? 'Thùng đã được mở thành công!' : 'Đang xử lý...'}`;
    }
    return `Command sent to open ${data.bin} bin. ${data.status === 'success' ? 'Bin opened successfully!' : 'Processing...'}`;
  }

  private static formatGenericResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Đã xử lý yêu cầu của bạn. Kết quả: ${JSON.stringify(data, null, 2)}`;
    }
    return `Your request has been processed. Result: ${JSON.stringify(data, null, 2)}`;
  }

  private static getWeightContext(weight: number): string {
    if (weight > 50) return 'Thùng này khá nặng, có thể cần dọn dẹp.';
    if (weight > 30) return 'Thùng có khối lượng trung bình.';
    return 'Thùng còn nhiều chỗ trống.';
  }

  private static getFillContext(percentage: number): string {
    if (percentage > 90) return 'Thùng đã gần đầy hoàn toàn!';
    if (percentage > 80) return 'Thùng đã khá đầy, cần chú ý.';
    if (percentage > 60) return 'Thùng đã đầy hơn một nửa.';
    if (percentage > 30) return 'Thùng đã có một lượng rác đáng kể.';
    return 'Thùng còn nhiều chỗ trống.';
  }

  private static getSummaryContext(data: any): string {
    const avgPerHour = data.totalWeight / data.windowHours;
    if (avgPerHour > 10) return 'Tốc độ thu gom khá cao.';
    if (avgPerHour > 5) return 'Tốc độ thu gom bình thường.';
    return 'Tốc độ thu gom thấp.';
  }

  private static getHistoryContext(data: any): string {
    if (data.length === 0) return 'Không có dữ liệu trong khoảng thời gian này.';
    if (data.length < 5) return 'Dữ liệu còn ít, cần thêm thời gian để phân tích.';
    return 'Đủ dữ liệu để phân tích xu hướng.';
  }
  private static formatWhoWebResponse(data: any, language: string): string {
    if (language === 'vi') {
      return `Tôi là một chatbot thông minh cho hệ thống IoT phân loại rác. Tôi có thể giúp bạn một vài thông tin về thùng rác. Tôi được nhóm phát triển để hỗ trợ bạn trong việc quản lý rác thải một cách hiệu quả hơn và được phát triển bởi nhóm 13 gồm các thành viên 23127181 - 23127270 - 23127438`;
    }
    return `I am an intelligent chatbot for the smart trash IoT system. I can help you with some information about trash bins. I was developed by team 13, consisting of members 23127181 - 23127270 - 23127438`;
  }

  private static generateContextualSuggestions(tool: string, args: any, data: any): string[] {
    const suggestions: string[] = [];

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
  private static createBinStatusTable(data: any[]): string {
    let table = '┌─────────┬──────────┬─────────────┬─────────────┐\n';
    table += '│ Thùng   │ Khối lượng│ % Đầy      │ Trạng thái  │\n';
    table += '├─────────┼──────────┼─────────────┼─────────────┤\n';
    
    data.forEach((bin: any) => {
      const status = bin.percentage > 80 ? '⚠️ Cần dọn' : bin.percentage > 60 ? '🟡 Trung bình' : '🟢 Bình thường';
      table += `│ ${bin.bin.padEnd(7)} │ ${bin.weight.toString().padStart(8)}kg │ ${bin.percentage.toString().padStart(9)}% │ ${status.padEnd(11)} │\n`;
    });
    
    table += '└─────────┴──────────┴─────────────┴─────────────┘';
    return table;
  }

  private static createSummaryTable(data: any): string {
    let table = '┌─────────────────┬─────────────┐\n';
    table += '│ Chỉ số          │ Giá trị     │\n';
    table += '├─────────────────┼─────────────┤\n';
    table += `│ Tổng khối lượng │ ${data.totalWeight}kg     │\n`;
    table += `│ Thời gian       │ ${data.windowHours}h      │\n`;
    table += `│ Trung bình/giờ  │ ${(data.totalWeight / data.windowHours).toFixed(1)}kg/h   │\n`;
    table += '└─────────────────┴─────────────┘';
    return table;
  }

  private static createHistoryTable(data: any[]): string {
    if (data.length === 0) return 'Không có dữ liệu lịch sử.';
    
    let table = '┌─────────────────────┬──────────┬─────────────┐\n';
    table += '│ Thời gian           │ Khối lượng│ % Đầy      │\n';
    table += '├─────────────────────┼──────────┼─────────────┤\n';
    
    data.slice(0, 10).forEach((record: any) => {
      const time = new Date(record.timestamp).toLocaleString('vi-VN');
      table += `│ ${time.padEnd(19)} │ ${record.weight.toString().padStart(8)}kg │ ${record.percentage.toString().padStart(9)}% │\n`;
    });
    
    if (data.length > 10) {
      table += `│ ... và ${data.length - 10} bản ghi khác    │\n`;
    }
    
    table += '└─────────────────────┴──────────┴─────────────┘';
    return table;
  }

  private static createGenericTable(data: any, tool: string, args: any): string {
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
  private static createBinStatusCSV(data: any[]): string {
    let csv = 'Thùng,Khối lượng,% Đầy,Trạng thái\n';
    data.forEach((bin: any) => {
      const status = bin.percentage > 80 ? 'Cần dọn' : bin.percentage > 60 ? 'Trung bình' : 'Bình thường';
      csv += `${bin.bin},${bin.weight}kg,${bin.percentage}%,${status}\n`;
    });
    return csv;
  }

  private static createSummaryCSV(data: any): string {
    return `Chỉ số,Giá trị\nTổng khối lượng,${data.totalWeight}kg\nThời gian,${data.windowHours}h\nTrung bình/giờ,${(data.totalWeight / data.windowHours).toFixed(1)}kg/h`;
  }

  private static createHistoryCSV(data: any[]): string {
    if (data.length === 0) return 'Thời gian,Khối lượng,% Đầy\nKhông có dữ liệu';
    
    let csv = 'Thời gian,Khối lượng,% Đầy\n';
    data.forEach((record: any) => {
      const time = new Date(record.timestamp).toLocaleString('vi-VN');
      csv += `${time},${record.weight}kg,${record.percentage}%\n`;
    });
    return csv;
  }

  private static createGenericCSV(data: any, tool: string, args: any): string {
    return `Thông tin,Giá trị\nTool,${tool}\nArguments,${JSON.stringify(args)}\nData,${JSON.stringify(data)}`;
  }
}
