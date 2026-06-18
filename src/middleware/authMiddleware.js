/**
 * Authentication Middleware
 * JWT-based authentication and authorization
 */

const jwt = require('jsonwebtoken');
const config = require('../config/environment');
const { sendUnauthorized, sendForbidden } = require('../utils/responseHandler');
const logger = require('../utils/logger');

/**
 * Verify JWT Token
 */
const verifyToken = (token) => {
    try {
        return jwt.verify(token, config.jwt.secret);
    } catch (error) {
        logger.error('Token verification failed:', error.message);
        return null;
    }
};

/**
 * Generate JWT Token
 */
const generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
    return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

/**
 * Generate Refresh Token
 */
const generateRefreshToken = (payload) => {
    return jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpiresIn });
};

/**
 * Authentication Middleware
 */
const authenticate = (req, res, next) => {
    try {
        // Get token from header
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            logger.warn('Missing or invalid authorization header');
            return sendUnauthorized(res, 'Missing or invalid authorization header');
        }

        const token = authHeader.substring(7); // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token);

        if (!decoded) {
            logger.warn('Token verification failed');
            return sendUnauthorized(res, 'Invalid or expired token');
        }

        // Attach user info to request
        req.user = decoded;
        logger.debug(`User authenticated: ${decoded.userId}`);
        next();
    } catch (error) {
        logger.error('Authentication error:', error.message);
        return sendUnauthorized(res, 'Authentication failed');
    }
};

/**
 * Role-Based Access Control Middleware
 */
const authorize = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            logger.warn('User not authenticated');
            return sendUnauthorized(res, 'User not authenticated');
        }

        if (!allowedRoles.includes(req.user.role)) {
            logger.warn(`Unauthorized access attempt by user: ${req.user.userId}, role: ${req.user.role}`);
            return sendForbidden(res, 'You do not have permission to access this resource');
        }

        next();
    };
};

/**
 * Optional Authentication Middleware
 * Does not throw error if token is missing or invalid
 */
const optionalAuthenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7);
            const decoded = verifyToken(token);

            if (decoded) {
                req.user = decoded;
                logger.debug(`Optional authentication successful for user: ${decoded.userId}`);
            }
        }

        next();
    } catch (error) {
        logger.debug('Optional authentication skipped:', error.message);
        next();
    }
};

module.exports = {
    verifyToken,
    generateToken,
    generateRefreshToken,
    authenticate,
    authorize,
    optionalAuthenticate
};
