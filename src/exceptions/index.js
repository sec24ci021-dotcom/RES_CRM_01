/**
 * Custom Exception Classes
 * Application-specific exceptions following SOLID principles
 */

/**
 * Base Custom Exception
 */
class AppException extends Error {
    constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
        super(message);
        this.name = this.constructor.name;
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            error: {
                name: this.name,
                message: this.message,
                statusCode: this.statusCode,
                errorCode: this.errorCode,
                timestamp: this.timestamp
            }
        };
    }
}

/**
 * Validation Exception
 * Thrown when input validation fails
 */
class ValidationException extends AppException {
    constructor(message, details = null) {
        super(message, 400, 'VALIDATION_ERROR');
        this.details = details;
    }

    toJSON() {
        const json = super.toJSON();
        if (this.details) {
            json.error.details = this.details;
        }
        return json;
    }
}

/**
 * Duplicate Entry Exception
 * Thrown when attempting to create duplicate resource
 */
class DuplicateException extends AppException {
    constructor(message, existingResource = null) {
        super(message, 409, 'DUPLICATE_ENTRY');
        this.existingResource = existingResource;
    }

    toJSON() {
        const json = super.toJSON();
        if (this.existingResource) {
            json.error.existingResource = this.existingResource;
        }
        return json;
    }
}

/**
 * Not Found Exception
 * Thrown when resource doesn't exist
 */
class NotFoundException extends AppException {
    constructor(message) {
        super(message, 404, 'RESOURCE_NOT_FOUND');
    }
}

/**
 * Business Logic Exception
 * Thrown when business rule is violated
 */
class BusinessLogicException extends AppException {
    constructor(message, violatedRule = null) {
        super(message, 422, 'BUSINESS_RULE_VIOLATION');
        this.violatedRule = violatedRule;
    }

    toJSON() {
        const json = super.toJSON();
        if (this.violatedRule) {
            json.error.violatedRule = this.violatedRule;
        }
        return json;
    }
}

/**
 * Authorization Exception
 * Thrown when user lacks permissions
 */
class AuthorizationException extends AppException {
    constructor(message = 'Unauthorized access') {
        super(message, 403, 'FORBIDDEN');
    }
}

/**
 * Auto Assignment Exception
 * Thrown when automatic assignment fails
 */
class AutoAssignmentException extends AppException {
    constructor(message, reason = null) {
        super(message, 503, 'AUTO_ASSIGNMENT_FAILED');
        this.reason = reason;
    }

    toJSON() {
        const json = super.toJSON();
        if (this.reason) {
            json.error.reason = this.reason;
        }
        return json;
    }
}

module.exports = {
    AppException,
    ValidationException,
    DuplicateException,
    NotFoundException,
    BusinessLogicException,
    AuthorizationException,
    AutoAssignmentException
};
