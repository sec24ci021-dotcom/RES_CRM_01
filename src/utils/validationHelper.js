/**
 * Validation Utility
 * Common validation functions for requests
 */

const { sendValidationError } = require('./responseHandler');

/**
 * Validate Required Fields
 */
const validateRequired = (data, requiredFields) => {
    const errors = [];

    requiredFields.forEach(field => {
        if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
            errors.push(`${field} is required`);
        }
    });

    return errors;
};

/**
 * Validate Email Format
 */
const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

/**
 * Validate Phone Format
 */
const validatePhone = (phone) => {
    const phoneRegex = /^\+?[0-9\s\-()]{10,}$/;
    return phoneRegex.test(phone);
};

/**
 * Validate Object ID
 */
const validateObjectId = (id) => {
    return /^[0-9a-fA-F]{24}$/.test(id);
};

/**
 * Validate Pagination Parameters
 */
const validatePagination = (page, limit) => {
    const errors = [];

    if (page && (isNaN(page) || parseInt(page) < 1)) {
        errors.push('Page must be a positive number');
    }

    if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
        errors.push('Limit must be between 1 and 100');
    }

    return errors;
};

/**
 * Validate Date Format
 */
const validateDate = (dateString) => {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date);
};

/**
 * Validate Enum Value
 */
const validateEnum = (value, enumValues) => {
    return Object.values(enumValues).includes(value);
};

/**
 * Validate Budget Range
 */
const validateBudgetRange = (minBudget, maxBudget) => {
    const errors = [];

    if (minBudget && maxBudget && minBudget > maxBudget) {
        errors.push('Minimum budget cannot be greater than maximum budget');
    }

    return errors;
};

/**
 * Request Validation Middleware
 */
const validate = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true
        });

        if (error) {
            const errors = error.details.map(detail => ({
                field: detail.path[0],
                message: detail.message
            }));
            return sendValidationError(res, errors);
        }

        req.validatedBody = value;
        next();
    };
};

module.exports = {
    validateRequired,
    validateEmail,
    validatePhone,
    validateObjectId,
    validatePagination,
    validateDate,
    validateEnum,
    validateBudgetRange,
    validate
};
