/**
 * Error Handling Middleware
 * Centralized error handling for the entire application
 */

const logger = require('../utils/logger');
const { sendError } = require('../utils/responseHandler');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * Async Error Wrapper
 * Wraps async route handlers and catches errors
 */
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

/**
 * Global Error Handler Middleware
 */
const errorHandler = (err, req, res, next) => {
    logger.error('Error caught by global handler:', err);

    // Mongoose Validation Error
    if (err.name === 'ValidationError') {
        const errors = Object.keys(err.errors).map(key => ({
            field: key,
            message: err.errors[key].message
        }));
        return sendError(
            res,
            'Validation error',
            HTTP_STATUS.UNPROCESSABLE_ENTITY,
            ERROR_CODES.VALIDATION_ERROR,
            errors
        );
    }

    // Mongoose Cast Error (Invalid Object ID)
    if (err.name === 'CastError') {
        return sendError(
            res,
            'Invalid record ID format',
            HTTP_STATUS.BAD_REQUEST,
            ERROR_CODES.INVALID_REQUEST
        );
    }

    // Mongoose Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyPattern)[0];
        return sendError(
            res,
            `${field} already exists`,
            HTTP_STATUS.CONFLICT,
            ERROR_CODES.DUPLICATE_ENTRY, { field }
        );
    }

    // JWT Errors
    if (err.name === 'JsonWebTokenError') {
        return sendError(
            res,
            'Invalid token',
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.UNAUTHORIZED
        );
    }

    if (err.name === 'TokenExpiredError') {
        return sendError(
            res,
            'Token expired',
            HTTP_STATUS.UNAUTHORIZED,
            ERROR_CODES.UNAUTHORIZED
        );
    }

    // Custom Application Errors
    if (err.statusCode) {
        return sendError(
            res,
            err.message,
            err.statusCode,
            err.errorCode || ERROR_CODES.INTERNAL_ERROR,
            err.details
        );
    }

    // Default Internal Server Error
    return sendError(
        res,
        'Internal server error',
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        ERROR_CODES.INTERNAL_ERROR,
        process.env.NODE_ENV === 'development' ? err.message : undefined
    );
};

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
    const error = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
    error.statusCode = HTTP_STATUS.NOT_FOUND;
    error.errorCode = ERROR_CODES.RESOURCE_NOT_FOUND;
    next(error);
};

module.exports = {
    asyncHandler,
    errorHandler,
    notFoundHandler
};
