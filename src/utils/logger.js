/**
 * Logger Utility
 * Centralized logging for the application
 */

const config = require('../config/environment');

const LogLevel = {
    ERROR: 'ERROR',
    WARN: 'WARN',
    INFO: 'INFO',
    DEBUG: 'DEBUG'
};

const colors = {
    ERROR: '\x1b[31m', // Red
    WARN: '\x1b[33m', // Yellow
    INFO: '\x1b[36m', // Cyan
    DEBUG: '\x1b[35m', // Magenta
    RESET: '\x1b[0m'
};

const levelPriority = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3
};

const getCurrentLevel = () => {
    return levelPriority[config.logging.level] || levelPriority.INFO;
};

const log = (level, message, data = null) => {
    if (levelPriority[level] > getCurrentLevel()) return;

    const timestamp = new Date().toISOString();
    const color = colors[level];
    const prefix = `${color}[${timestamp}] [${level}]${colors.RESET}`;

    if (data) {
        console.log(`${prefix} ${message}`, data);
        try {
            const fs = require('fs');
            if (data instanceof Error) {
                const dir = 'logs';
                if (!fs.existsSync(dir)) fs.mkdirSync(dir);
                fs.appendFileSync(`${dir}/error.log`, `[${new Date().toISOString()}] ${message}\n${data.stack}\n\n`);
            }
        } catch (e) {
            // ignore logging errors
        }
    } else {
        console.log(`${prefix} ${message}`);
    }
};

const logger = {
    error: (message, data) => log(LogLevel.ERROR, message, data),
    warn: (message, data) => log(LogLevel.WARN, message, data),
    info: (message, data) => log(LogLevel.INFO, message, data),
    debug: (message, data) => log(LogLevel.DEBUG, message, data)
};

module.exports = logger;