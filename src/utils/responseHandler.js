/**
 * Response Handler Utility
 * Standardized response format for all API endpoints
 */

const { HTTP_STATUS, ERROR_CODES } = require('../constants');

/**
 * Success Response Format
 */
const sendSuccess = (res, data = null, message = 'Request successful', statusCode = HTTP_STATUS.OK) => {
    return res.status(statusCode).json({
        success: true,
        message,
        data,
        timestamp: new Date().toISOString()
    });
};

/**
 * Created Response Format
 */
const sendCreated = (res, data = null, message = 'Resource created successfully') => {
    return sendSuccess(res, data, message, HTTP_STATUS.CREATED);
};

/**
 * Error Response Format
 */
const sendError = (res, message = 'An error occurred', statusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR, errorCode = ERROR_CODES.INTERNAL_ERROR, details = null) => {
    return res.status(statusCode).json({
        success: false,
        message,
        errorCode,
        details,
        timestamp: new Date().toISOString()
    });
};

/**
 * Validation Error Response
 */
const sendValidationError = (res, errors = [], message = 'Validation failed') => {
    return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
        success: false,
        message,
        errorCode: ERROR_CODES.VALIDATION_ERROR,
        errors: Array.isArray(errors) ? errors : [errors],
        timestamp: new Date().toISOString()
    });
};

/**
 * Not Found Response
 */
const sendNotFound = (res, message = 'Resource not found') => {
    return sendError(res, message, HTTP_STATUS.NOT_FOUND, ERROR_CODES.RESOURCE_NOT_FOUND);
};

/**
 * Unauthorized Response
 */
const sendUnauthorized = (res, message = 'Unauthorized access') => {
    return sendError(res, message, HTTP_STATUS.UNAUTHORIZED, ERROR_CODES.UNAUTHORIZED);
};

/**
 * Forbidden Response
 */
const sendForbidden = (res, message = 'Forbidden access') => {
    return sendError(res, message, HTTP_STATUS.FORBIDDEN, ERROR_CODES.FORBIDDEN);
};

/**
 * Paginated Response
 */
const sendPaginated = (res, data, totalCount, page, limit, message = 'Request successful') => {
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(HTTP_STATUS.OK).json({
        success: true,
        message,
        data,
        pagination: {
            currentPage: page,
            totalPages,
            pageSize: limit,
            totalCount,
            hasNextPage: page < totalPages,
            hasPrevPage: page > 1
        },
        timestamp: new Date().toISOString()
    });
};

module.exports = {
    sendSuccess,
    sendCreated,
    sendError,
    sendValidationError,
    sendNotFound,
    sendUnauthorized,
    sendForbidden,
    sendPaginated
};
