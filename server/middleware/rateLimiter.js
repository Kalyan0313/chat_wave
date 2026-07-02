const rateLimit = require('express-rate-limit');

/**
 * General API rate limiter
 * 100 requests per 15 minutes per IP
 */
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        status: false,
        message: 'Too many requests from this IP, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health check endpoints
        return req.path === '/health' || req.path === '/metrics';
    }
});

/**
 * Strict rate limiter for authentication endpoints
 * 5 requests per 15 minutes per IP
 */
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: {
        status: false,
        message: 'Too many authentication attempts, please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
});

/**
 * Message sending rate limiter
 * 30 messages per minute per user
 */
const messageLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30,
    message: {
        status: false,
        message: 'You are sending messages too quickly. Please slow down.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        // Use user ID instead of IP for authenticated requests
        return req.user?.userId || req.ip;
    }
});

/**
 * File upload rate limiter
 * 10 uploads per hour per user
 */
const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    message: {
        status: false,
        message: 'Too many file uploads. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.userId || req.ip;
    }
});

/**
 * Chat creation rate limiter
 * 20 chats per hour per user
 */
const chatCreationLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: {
        status: false,
        message: 'Too many chats created. Please try again later.'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.user?.userId || req.ip;
    }
});

module.exports = {
    apiLimiter,
    authLimiter,
    messageLimiter,
    uploadLimiter,
    chatCreationLimiter
};
