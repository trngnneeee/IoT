// ConversationManager converted to JavaScript

class ConversationManager {
  constructor() {
    this.conversations = new Map();
    this.MAX_HISTORY = 20;
    this.SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  }

  createSession(sessionId) {
    const context = {
      sessionId,
      messages: [],
      userPreferences: {
        language: "vi",
        responseFormat: "natural",
        detailLevel: "detailed",
        autoSuggestions: true,
      },
      lastQuery: "",
      lastResponse: "",
      lastTool: null,
      lastArgs: {},
      lastData: {},
      timestamp: Date.now(),
      // Mặc định tool-mode để ưu tiên truy vấn dữ liệu;
      // dùng /chat hoặc off-domain gate để sang chat-mode
      mode: "tool",
    };

    this.conversations.set(sessionId, context);
    return context;
  }

  getSession(sessionId) {
    const context = this.conversations.get(sessionId);
    if (!context) return null;

    // Expired?
    if (Date.now() - context.timestamp > this.SESSION_TIMEOUT) {
      this.conversations.delete(sessionId);
      return null;
    }
    return context;
  }

  addMessage(sessionId, message) {
    const context = this.getSession(sessionId);
    if (!context) return;

    const fullMessage = { ...message, timestamp: Date.now() };
    context.messages.push(fullMessage);
    context.timestamp = Date.now();

    // Giữ lịch sử gọn
    if (context.messages.length > this.MAX_HISTORY) {
      context.messages = context.messages.slice(-this.MAX_HISTORY);
    }
  }

  updateContext(sessionId, updates) {
    const context = this.getSession(sessionId);
    if (!context) return;

    Object.assign(context, updates);
    context.timestamp = Date.now();
  }

  // Thêm: reset session (được chat.ts gọi qua /reset hoặc khi cần)
  reset(sessionId) {
    const context = this.getSession(sessionId);
    if (!context) return;

    context.messages = [];
    context.lastQuery = "";
    context.lastResponse = "";
    context.lastTool = null;
    context.lastArgs = {};
    context.lastData = {};
    context.mode = "tool"; // quay về tool-mode
    context.timestamp = Date.now();
  }

  getConversationSummary(sessionId) {
    const context = this.getSession(sessionId);
    if (!context || context.messages.length === 0) return "";

    const recentMessages = context.messages.slice(-5);
    return recentMessages
      .map(
        (msg) =>
          `${msg.role}: ${msg.content.substring(0, 100)}${
            msg.content.length > 100 ? "..." : ""
          }`
      )
      .join("\n");
  }

  detectUserPreferences(sessionId) {
    const context = this.getSession(sessionId);
    if (!context) return this.getDefaultPreferences();

    const messages = context.messages;
    const preferences = { ...this.getDefaultPreferences() };

    // Detect language preference
    const vnMark = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/;
    const vietnameseCount = messages.filter(
      (msg) => msg.role === "user" && vnMark.test(msg.content)
    ).length;
    const englishCount = messages.filter(
      (msg) => msg.role === "user" && /[a-zA-Z]/.test(msg.content) && !vnMark.test(msg.content)
    ).length;

    if (vietnameseCount > englishCount) preferences.language = "vi";
    else if (englishCount > vietnameseCount) preferences.language = "en";

    // Detect response format preference
    const formatRequests = messages.filter(
      (msg) => msg.role === "user" && /(json|csv|table|bảng|biểu)/i.test(msg.content)
    );
    if (formatRequests.length > 0) {
      const last = formatRequests[formatRequests.length - 1].content;
      if (/json/i.test(last)) preferences.responseFormat = "json";
      else if (/csv/i.test(last)) preferences.responseFormat = "csv";
      else if (/table|bảng|biểu/i.test(last)) preferences.responseFormat = "table";
    }

    // Detect detail level preference
    const detailedRequests = messages.filter(
      (msg) => msg.role === "user" && /(chi tiết|detailed|expert|chuyên gia|đầy đủ)/i.test(msg.content)
    ).length;
    const simpleRequests = messages.filter(
      (msg) => msg.role === "user" && /(đơn giản|simple|ngắn gọn|tóm tắt)/i.test(msg.content)
    ).length;

    if (detailedRequests > simpleRequests) preferences.detailLevel = "expert";
    else if (simpleRequests > detailedRequests) preferences.detailLevel = "simple";

    return preferences;
  }

  getDefaultPreferences() {
    return {
      language: "vi",
      responseFormat: "natural",
      detailLevel: "detailed",
      autoSuggestions: true,
    };
  }

  cleanup() {
    const now = Date.now();
    for (const [sessionId, context] of this.conversations.entries()) {
      if (now - context.timestamp > this.SESSION_TIMEOUT) {
        this.conversations.delete(sessionId);
      }
    }
  }
}

// Create singleton instance
const conversationManager = new ConversationManager();

// Export để sử dụng trong Node.js (nếu cần)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConversationManager, conversationManager };
}

// Hoặc trong browser có thể sử dụng trực tiếp
// window.ConversationManager = ConversationManager;
// window.conversationManager = conversationManager;