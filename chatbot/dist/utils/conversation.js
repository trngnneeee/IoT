"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.conversationManager = exports.ConversationManager = void 0;
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
                language: 'vi',
                responseFormat: 'natural',
                detailLevel: 'detailed',
                autoSuggestions: true
            },
            lastQuery: '',
            lastResponse: '',
            lastTool: '',
            lastArgs: {},
            lastData: {},
            timestamp: Date.now()
        };
        this.conversations.set(sessionId, context);
        return context;
    }
    getSession(sessionId) {
        const context = this.conversations.get(sessionId);
        if (!context)
            return null;
        // Check if session has expired
        if (Date.now() - context.timestamp > this.SESSION_TIMEOUT) {
            this.conversations.delete(sessionId);
            return null;
        }
        return context;
    }
    addMessage(sessionId, message) {
        const context = this.getSession(sessionId);
        if (!context)
            return;
        const fullMessage = {
            ...message,
            timestamp: Date.now()
        };
        context.messages.push(fullMessage);
        context.timestamp = Date.now();
        // Keep only recent messages
        if (context.messages.length > this.MAX_HISTORY) {
            context.messages = context.messages.slice(-this.MAX_HISTORY);
        }
    }
    updateContext(sessionId, updates) {
        const context = this.getSession(sessionId);
        if (!context)
            return;
        Object.assign(context, updates);
        context.timestamp = Date.now();
    }
    getConversationSummary(sessionId) {
        const context = this.getSession(sessionId);
        if (!context || context.messages.length === 0)
            return '';
        const recentMessages = context.messages.slice(-5);
        return recentMessages.map(msg => `${msg.role}: ${msg.content.substring(0, 100)}${msg.content.length > 100 ? '...' : ''}`).join('\n');
    }
    detectUserPreferences(sessionId) {
        const context = this.getSession(sessionId);
        if (!context)
            return this.getDefaultPreferences();
        const messages = context.messages;
        const preferences = { ...this.getDefaultPreferences() };
        // Detect language preference
        const vietnameseCount = messages.filter(msg => msg.role === 'user' && /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(msg.content)).length;
        const englishCount = messages.filter(msg => msg.role === 'user' && /[a-zA-Z]/.test(msg.content) && !/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/.test(msg.content)).length;
        if (vietnameseCount > englishCount) {
            preferences.language = 'vi';
        }
        else if (englishCount > vietnameseCount) {
            preferences.language = 'en';
        }
        // Detect response format preference
        const formatRequests = messages.filter(msg => msg.role === 'user' && /(json|csv|table|bảng|biểu)/i.test(msg.content));
        if (formatRequests.length > 0) {
            const lastFormatRequest = formatRequests[formatRequests.length - 1];
            if (/json/i.test(lastFormatRequest.content))
                preferences.responseFormat = 'json';
            else if (/csv/i.test(lastFormatRequest.content))
                preferences.responseFormat = 'csv';
            else if (/table|bảng|biểu/i.test(lastFormatRequest.content))
                preferences.responseFormat = 'table';
        }
        // Detect detail level preference
        const detailedRequests = messages.filter(msg => msg.role === 'user' && /(chi tiết|detailed|expert|chuyên gia|đầy đủ)/i.test(msg.content)).length;
        const simpleRequests = messages.filter(msg => msg.role === 'user' && /(đơn giản|simple|ngắn gọn|tóm tắt)/i.test(msg.content)).length;
        if (detailedRequests > simpleRequests) {
            preferences.detailLevel = 'expert';
        }
        else if (simpleRequests > detailedRequests) {
            preferences.detailLevel = 'simple';
        }
        return preferences;
    }
    getDefaultPreferences() {
        return {
            language: 'vi',
            responseFormat: 'natural',
            detailLevel: 'detailed',
            autoSuggestions: true
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
exports.ConversationManager = ConversationManager;
exports.conversationManager = new ConversationManager();
