/**
 * Environment Configuration
 * Central location for all environment variables with defaults
 */

require('dotenv').config();

const config = {
    // Application
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 3000,
    appName: 'Lead Management System',
    version: '1.0.0',

    // Database
    mongodb: {
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/lead-crm',
        maxRetries: 5,
        retryDelay: 5000
    },

    // JWT
    jwt: {
        secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
        refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
    },

    // CORS
    cors: {
        // Allow a comma-separated list in CORS_ORIGIN (e.g. "http://localhost:3000,http://localhost:5173")
        origin: process.env.CORS_ORIGIN ?
            process.env.CORS_ORIGIN.split(',').map((s) => s.trim()) :
            ['http://localhost:3000', 'http://localhost:3001'],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    },

    // Logging
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined'
    },

    // Pagination
    pagination: {
        defaultLimit: 10,
        maxLimit: 100,
        defaultPage: 1
    },

    // Rate Limiting
    rateLimit: {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 100,
        message: 'Too many requests, please try again later'
    },

    // Email (optional)
    email: {
        enabled: process.env.EMAIL_ENABLED === 'true',
        service: process.env.EMAIL_SERVICE || 'gmail',
        from: process.env.EMAIL_FROM || 'noreply@leadmanagement.com'
    },

    // File Upload
    fileUpload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        allowedMimes: ['image/jpeg', 'image/png', 'application/pdf', 'application/msword']
    },

    // API
    api: {
        prefix: '/api/v1',
        timeout: 30000 // 30 seconds
    }
};

// Validate critical config
if (config.nodeEnv === 'production' && config.jwt.secret === 'your-super-secret-jwt-key-change-in-production') {
    throw new Error('⚠️ CRITICAL: JWT_SECRET must be changed in production!');
}

module.exports = config;