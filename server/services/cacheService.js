// In-memory cache service (replaces Redis)
class CacheService {
    constructor() {
        this.defaultTTL = 300; // 5 minutes
        this.cache = new Map(); // Key-value store
        this.onlineUsers = new Set(); // Online users set
        this.userSocketMap = new Map(); // User ID -> Socket ID mapping
        this.timers = new Map(); // TTL timers
    }

    /**
     * Generate cache key with prefix
     */
    generateKey(prefix, identifier) {
        return `chatwave:${prefix}:${identifier}`;
    }

    /**
     * Set a value with TTL
     */
    _setWithTTL(key, value, ttl) {
        this.cache.set(key, value);
        
        // Clear existing timer if any
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
        }
        
        // Set new timer
        if (ttl > 0) {
            const timer = setTimeout(() => {
                this.cache.delete(key);
                this.timers.delete(key);
            }, ttl * 1000);
            this.timers.set(key, timer);
        }
    }

    // ==================== User Caching ====================

    /**
     * Cache user profile
     * @param {string} userId - User ID
     * @param {object} userData - User data object
     * @param {number} ttl - Time to live in seconds (default: 300)
     */
    async cacheUser(userId, userData, ttl = this.defaultTTL) {
        const key = this.generateKey('user', userId);
        this._setWithTTL(key, userData, ttl);
        return true;
    }

    /**
     * Get cached user profile
     * @param {string} userId - User ID
     */
    async getUser(userId) {
        const key = this.generateKey('user', userId);
        return this.cache.get(key) || null;
    }

    /**
     * Invalidate user cache
     * @param {string} userId - User ID
     */
    async invalidateUser(userId) {
        const key = this.generateKey('user', userId);
        this.cache.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        return true;
    }

    // ==================== Chat Caching ====================

    /**
     * Cache user's chat list
     * @param {string} userId - User ID
     * @param {array} chats - Array of chat objects
     * @param {number} ttl - Time to live in seconds (default: 300)
     */
    async cacheUserChats(userId, chats, ttl = this.defaultTTL) {
        const key = this.generateKey('chats', userId);
        this._setWithTTL(key, chats, ttl);
        return true;
    }

    /**
     * Get cached user's chat list
     * @param {string} userId - User ID
     */
    async getUserChats(userId) {
        const key = this.generateKey('chats', userId);
        return this.cache.get(key) || null;
    }

    /**
     * Invalidate user's chat list cache
     * @param {string} userId - User ID
     */
    async invalidateUserChats(userId) {
        const key = this.generateKey('chats', userId);
        this.cache.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        return true;
    }

    /**
     * Cache single chat details
     * @param {string} chatId - Chat ID
     * @param {object} chatData - Chat data object
     * @param {number} ttl - Time to live in seconds (default: 600)
     */
    async cacheChat(chatId, chatData, ttl = 600) {
        const key = this.generateKey('chat', chatId);
        this._setWithTTL(key, chatData, ttl);
        return true;
    }

    /**
     * Get cached chat details
     * @param {string} chatId - Chat ID
     */
    async getChat(chatId) {
        const key = this.generateKey('chat', chatId);
        return this.cache.get(key) || null;
    }

    /**
     * Invalidate chat cache
     * @param {string} chatId - Chat ID
     */
    async invalidateChat(chatId) {
        const key = this.generateKey('chat', chatId);
        this.cache.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        return true;
    }

    // ==================== Message Caching ====================

    /**
     * Cache messages for a chat
     * @param {string} chatId - Chat ID
     * @param {number} page - Page number
     * @param {array} messages - Array of message objects
     * @param {number} ttl - Time to live in seconds (default: 300)
     */
    async cacheMessages(chatId, page, messages, ttl = this.defaultTTL) {
        const key = this.generateKey('messages', `${chatId}:page:${page}`);
        this._setWithTTL(key, messages, ttl);
        return true;
    }

    /**
     * Get cached messages for a chat
     * @param {string} chatId - Chat ID
     * @param {number} page - Page number
     */
    async getMessages(chatId, page) {
        const key = this.generateKey('messages', `${chatId}:page:${page}`);
        return this.cache.get(key) || null;
    }

    /**
     * Invalidate all message caches for a chat
     * @param {string} chatId - Chat ID
     */
    async invalidateChatMessages(chatId) {
        const pattern = this.generateKey('messages', `${chatId}:page:`);
        for (const key of this.cache.keys()) {
            if (key.startsWith(pattern)) {
                this.cache.delete(key);
                if (this.timers.has(key)) {
                    clearTimeout(this.timers.get(key));
                    this.timers.delete(key);
                }
            }
        }
        return true;
    }

    /**
     * Cache unread message count
     * @param {string} userId - User ID
     * @param {number} count - Unread count
     * @param {number} ttl - Time to live in seconds (default: 60)
     */
    async cacheUnreadCount(userId, count, ttl = 60) {
        const key = this.generateKey('unread', userId);
        this._setWithTTL(key, count, ttl);
        return true;
    }

    /**
     * Get cached unread message count
     * @param {string} userId - User ID
     */
    async getUnreadCount(userId) {
        const key = this.generateKey('unread', userId);
        return this.cache.get(key) || null;
    }

    /**
     * Invalidate unread count cache
     * @param {string} userId - User ID
     */
    async invalidateUnreadCount(userId) {
        const key = this.generateKey('unread', userId);
        this.cache.delete(key);
        if (this.timers.has(key)) {
            clearTimeout(this.timers.get(key));
            this.timers.delete(key);
        }
        return true;
    }

    // ==================== Online Users ====================

    /**
     * Add user to online users set
     * @param {string} userId - User ID
     */
    async addOnlineUser(userId) {
        this.onlineUsers.add(userId);
        return true;
    }

    /**
     * Remove user from online users set
     * @param {string} userId - User ID
     */
    async removeOnlineUser(userId) {
        this.onlineUsers.delete(userId);
        return true;
    }

    /**
     * Get all online users
     */
    async getOnlineUsers() {
        return Array.from(this.onlineUsers);
    }

    /**
     * Check if user is online
     * @param {string} userId - User ID
     */
    async isUserOnline(userId) {
        return this.onlineUsers.has(userId);
    }

    /**
     * Get online users count
     */
    async getOnlineUsersCount() {
        return this.onlineUsers.size;
    }

    // ==================== User Socket Mapping ====================

    /**
     * Map user to socket ID
     * @param {string} userId - User ID
     * @param {string} socketId - Socket ID
     * @param {number} ttl - Time to live in seconds (default: 86400 = 24 hours)
     */
    async mapUserSocket(userId, socketId, ttl = 86400) {
        this.userSocketMap.set(userId, socketId);
        // Note: Socket mappings don't expire automatically in single-server mode
        return true;
    }

    /**
     * Get socket ID for user
     * @param {string} userId - User ID
     */
    async getUserSocket(userId) {
        return this.userSocketMap.get(userId) || null;
    }

    /**
     * Remove user socket mapping
     * @param {string} userId - User ID
     */
    async removeUserSocket(userId) {
        this.userSocketMap.delete(userId);
        return true;
    }

    // ==================== Bulk Invalidation ====================

    /**
     * Invalidate all caches for a user
     * @param {string} userId - User ID
     */
    async invalidateUserCaches(userId) {
        await this.invalidateUser(userId);
        await this.invalidateUserChats(userId);
        await this.invalidateUnreadCount(userId);
    }

    /**
     * Invalidate all caches related to a chat
     * @param {string} chatId - Chat ID
     * @param {array} userIds - Array of user IDs in the chat
     */
    async invalidateChatCaches(chatId, userIds = []) {
        await this.invalidateChat(chatId);
        await this.invalidateChatMessages(chatId);

        // Invalidate chat lists for all users in the chat
        for (const userId of userIds) {
            await this.invalidateUserChats(userId);
            await this.invalidateUnreadCount(userId);
        }
    }

    // ==================== Rate Limiting Helpers ====================

    /**
     * Increment rate limit counter
     * @param {string} identifier - Unique identifier (IP, userId, etc.)
     * @param {string} action - Action type (e.g., 'message', 'api')
     * @param {number} windowSeconds - Time window in seconds
     */
    async incrementRateLimit(identifier, action, windowSeconds = 60) {
        const key = this.generateKey('ratelimit', `${action}:${identifier}`);
        const current = this.cache.get(key) || 0;
        const count = current + 1;
        this._setWithTTL(key, count, windowSeconds);
        return count;
    }

    /**
     * Get current rate limit count
     * @param {string} identifier - Unique identifier
     * @param {string} action - Action type
     */
    async getRateLimitCount(identifier, action) {
        const key = this.generateKey('ratelimit', `${action}:${identifier}`);
        const count = this.cache.get(key);
        return count ? parseInt(count) : 0;
    }
}

// Export singleton instance
const cacheService = new CacheService();
module.exports = cacheService;
