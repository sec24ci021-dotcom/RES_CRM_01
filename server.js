/**
 * Lead Management System - Main Server File
 * Express server with layered architecture setup
 */

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

// Import configuration
const config = require('./src/config/environment');
const { connectDB, getDBStatus } = require('./src/config/database');

// Import middleware
const { errorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

// Import routes
const apiRoutes = require('./src/routes');

// Import utilities
const logger = require('./src/utils/logger');

// ============================================
// APP INITIALIZATION
// ============================================
const app = express();

// ============================================
// MIDDLEWARE SETUP
// ============================================

// CORS configuration
app.use(cors(config.cors));

// Request logging
app.use(morgan(config.logging.format));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request timeout
app.use((req, res, next) => {
    req.setTimeout(config.api.timeout);
    next();
});

// ============================================
// DATABASE CONNECTION
// ============================================
connectDB();

// ============================================
// HEALTH CHECK ROUTES (Before API routes)
// ============================================
app.get('/health', (req, res) => {
    res.json({
        success: true,
        status: 'OK',
        database: getDBStatus(),
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv
    });
});

// ============================================
// API ROUTES
// ============================================
app.use(config.api.prefix, apiRoutes);

// ============================================
// ERROR HANDLING MIDDLEWARE
// ============================================

// 404 Not Found Handler
app.use(notFoundHandler);

// Global Error Handler
app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================
const PORT = parseInt(config.port, 10) || 3000;

let server = null;

function startServerOnPort(port, attempts = 5) {
    try {
        const s = app.listen(port);

        s.on('listening', () => {
            server = s;
            const addr = s.address();
            const listeningPort = addr && addr.port ? addr.port : port;
            logger.info('═'.repeat(60));
            logger.info('🚀 LEAD MANAGEMENT SYSTEM');
            logger.info('═'.repeat(60));
            logger.info(`Application Name: ${config.appName}`);
            logger.info(`Version: ${config.version}`);
            logger.info(`Environment: ${config.nodeEnv}`);
            logger.info(`Started at: ${new Date().toLocaleString()}`);
            logger.info(`Server running on: http://localhost:${listeningPort}`);
            logger.info(`API Endpoint: http://localhost:${listeningPort}${config.api.prefix}`);
            logger.info(`Health Check: http://localhost:${listeningPort}/health`);
            logger.info('═'.repeat(60));
            logger.info('📡 API Routes:');
            logger.info(`  • GET  ${config.api.prefix}/              - API Documentation`);
            logger.info(`  • GET  ${config.api.prefix}/status        - API Status`);
            logger.info(`  • GET  ${config.api.prefix}/leads         - List All Leads`);
            logger.info(`  • POST ${config.api.prefix}/leads         - Create Lead`);
            logger.info(`  • GET  ${config.api.prefix}/leads/:id     - Get Lead Details`);
            logger.info(`  • PUT  ${config.api.prefix}/leads/:id     - Update Lead`);
            logger.info(`  • DELETE ${config.api.prefix}/leads/:id   - Delete Lead`);
            logger.info(`  • GET  ${config.api.prefix}/leads/search?q=... - Search Leads`);
            logger.info(`  • POST ${config.api.prefix}/leads/filter  - Filter Leads`);
            logger.info('═'.repeat(60));
            logger.info('Press Ctrl+C to stop the server\n');
        });

        s.on('error', (err) => {
            if (err && err.code === 'EADDRINUSE') {
                logger.warn(`Port ${port} is in use.`);
                if (attempts > 0) {
                    const nextPort = port + 1;
                    logger.info(`Attempting to start on port ${nextPort} (retries left: ${attempts - 1})`);
                    setTimeout(() => startServerOnPort(nextPort, attempts - 1), 500);
                    return;
                }

                // As a last resort, ask the OS for an available ephemeral port (port 0)
                logger.warn('Fallback ports exhausted — attempting to bind to an ephemeral port assigned by the OS');
                setTimeout(() => startServerOnPort(0, 0), 200);
                return;
            } else {
                logger.error('Server error:', err);
                process.exit(1);
            }
        });
    } catch (err) {
        logger.error('Failed to start server:', err);
        process.exit(1);
    }
}

startServerOnPort(PORT, 10);

// ============================================
// GRACEFUL SHUTDOWN
// ============================================

// Handle SIGINT signal
process.on('SIGINT', () => {
    logger.warn('\n⚠️  Received SIGINT, shutting down gracefully...');
    server.close(() => {
        logger.info('✅ Server closed');
        process.exit(0);
    });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection at:', promise);
    logger.error('Reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

module.exports = app;