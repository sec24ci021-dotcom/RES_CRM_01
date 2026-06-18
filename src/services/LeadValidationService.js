/**
 * Lead Validation Service
 * Handles all lead data validation with comprehensive rules
 * Follows Single Responsibility Principle
 */

const { ValidationException } = require('../exceptions');
const { LEAD_STATUS, LEAD_PRIORITY, LEAD_SOURCE } = require('../constants');
const logger = require('../utils/logger');

class LeadValidationService {
    /**
     * Email regex pattern for validation
     */
    static EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    /**
     * Phone regex pattern for validation (international format)
     */
    static PHONE_PATTERN = /^(\+\d{1,3})?[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

    /**
     * Validate complete lead data for creation
     * @param {Object} leadData - Lead data to validate
     * @throws {ValidationException} If validation fails
     */
    static validateLeadForCreation(leadData) {
        logger.info('Validating lead data for creation');

        const errors = {};

        // Validate required fields
        if (!leadData.firstName || leadData.firstName.trim() === '') {
            errors.firstName = 'First name is required and cannot be empty';
        }

        if (!leadData.lastName || leadData.lastName.trim() === '') {
            errors.lastName = 'Last name is required and cannot be empty';
        }

        if (!leadData.email || leadData.email.trim() === '') {
            errors.email = 'Email is required';
        } else if (!this.EMAIL_PATTERN.test(leadData.email)) {
            errors.email = 'Email format is invalid';
        }

        if (!leadData.phone || leadData.phone.trim() === '') {
            errors.phone = 'Phone number is required';
        } else if (!this.PHONE_PATTERN.test(leadData.phone)) {
            errors.phone = 'Phone format is invalid';
        }

        if (!leadData.source || leadData.source.trim() === '') {
            errors.source = 'Lead source is required';
        } else if (!Object.values(LEAD_SOURCE).includes(leadData.source)) {
            errors.source = `Invalid source. Allowed: ${Object.values(LEAD_SOURCE).join(', ')}`;
        }

        // Validate optional fields if provided
        if (leadData.priority && !Object.values(LEAD_PRIORITY).includes(leadData.priority)) {
            errors.priority = `Invalid priority. Allowed: ${Object.values(LEAD_PRIORITY).join(', ')}`;
        }

        if (leadData.status && !Object.values(LEAD_STATUS).includes(leadData.status)) {
            errors.status = `Invalid status. Allowed: ${Object.values(LEAD_STATUS).join(', ')}`;
        }

        // Validate budget if provided
        if (leadData.budgetMin !== undefined && leadData.budgetMax !== undefined) {
            if (leadData.budgetMin < 0) {
                errors.budgetMin = 'Budget minimum cannot be negative';
            }
            if (leadData.budgetMax < 0) {
                errors.budgetMax = 'Budget maximum cannot be negative';
            }
            if (leadData.budgetMin > leadData.budgetMax) {
                errors.budget = 'Budget minimum cannot exceed maximum';
            }
        }

        // Validate location if provided
        if (leadData.location) {
            this._validateLocation(leadData.location, errors);
        }

        // If there are errors, throw exception
        if (Object.keys(errors).length > 0) {
            logger.warn('Lead validation failed', { errors });
            throw new ValidationException('Lead data validation failed', errors);
        }

        logger.info('Lead data validation passed');
    }

    /**
     * Validate lead data for update (partial validation)
     * @param {Object} updateData - Data to update
     * @throws {ValidationException} If validation fails
     */
    static validateLeadForUpdate(updateData) {
        logger.info('Validating lead data for update');

        const errors = {};

        // Validate status if provided
        if (updateData.status && !Object.values(LEAD_STATUS).includes(updateData.status)) {
            errors.status = `Invalid status. Allowed: ${Object.values(LEAD_STATUS).join(', ')}`;
        }

        // Validate priority if provided
        if (updateData.priority && !Object.values(LEAD_PRIORITY).includes(updateData.priority)) {
            errors.priority = `Invalid priority. Allowed: ${Object.values(LEAD_PRIORITY).join(', ')}`;
        }

        // Validate email if provided
        if (updateData.email && !this.EMAIL_PATTERN.test(updateData.email)) {
            errors.email = 'Email format is invalid';
        }

        // Validate phone if provided
        if (updateData.phone && !this.PHONE_PATTERN.test(updateData.phone)) {
            errors.phone = 'Phone format is invalid';
        }

        // Prevent updating protected fields
        const protectedFields = ['_id', 'createdAt', 'createdBy', 'isDeleted', 'deletedAt'];
        const attemptedUpdates = protectedFields.filter(field => field in updateData);

        if (attemptedUpdates.length > 0) {
            errors.protectedFields = `Cannot update protected fields: ${attemptedUpdates.join(', ')}`;
        }

        if (Object.keys(errors).length > 0) {
            logger.warn('Lead update validation failed', { errors });
            throw new ValidationException('Lead update validation failed', errors);
        }

        logger.info('Lead update validation passed');
    }

    /**
     * Validate location data
     * @private
     */
    static _validateLocation(location, errors) {
        if (location.coordinates) {
            const { latitude, longitude } = location.coordinates;

            if (latitude !== undefined && (latitude < -90 || latitude > 90)) {
                errors.latitude = 'Latitude must be between -90 and 90';
            }

            if (longitude !== undefined && (longitude < -180 || longitude > 180)) {
                errors.longitude = 'Longitude must be between -180 and 180';
            }
        }

        if (location.zipCode && !/^\d{5}(-\d{4})?$/.test(location.zipCode)) {
            errors.zipCode = 'Zip code format is invalid';
        }
    }

    /**
     * Validate lead status transition
     * @param {string} currentStatus - Current lead status
     * @param {string} newStatus - Desired new status
     * @throws {ValidationException} If transition is invalid
     */
    static validateStatusTransition(currentStatus, newStatus) {
        logger.info('Validating status transition', { from: currentStatus, to: newStatus });
        // Normalize legacy values: if currentStatus isn't one of the known enums,
        // and it looks like a Mongo ObjectId, treat it as NEW_LEAD to keep
        // transitions working for legacy/seeded records that used references.
        const validStatusValues = Object.values(LEAD_STATUS);
        let normalizedCurrent = currentStatus;
        if (!validStatusValues.includes(currentStatus)) {
            if (/^[0-9a-fA-F]{24}$/.test(String(currentStatus))) {
                logger.warn('Detected legacy ObjectId status; normalizing to NEW_LEAD', { currentStatus });
                normalizedCurrent = LEAD_STATUS.NEW;
            }
        }

        // Define valid status transitions
        const validTransitions = {
            [LEAD_STATUS.NEW]: [
                LEAD_STATUS.ATTEMPTED_CALL,
                LEAD_STATUS.CONTACTED,
                LEAD_STATUS.CONNECTED,
                LEAD_STATUS.INTERESTED,
                LEAD_STATUS.BOOKED,
                LEAD_STATUS.SITE_VISIT_SCHEDULED,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.ATTEMPTED_CALL]: [
                LEAD_STATUS.CONNECTED,
                LEAD_STATUS.INTERESTED,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.CONNECTED]: [
                LEAD_STATUS.INTERESTED,
                LEAD_STATUS.BOOKED,
                LEAD_STATUS.SITE_VISIT_SCHEDULED,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.INTERESTED]: [
                LEAD_STATUS.SITE_VISIT_SCHEDULED,
                LEAD_STATUS.BOOKED,
                LEAD_STATUS.IN_NEGOTIATION,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.SITE_VISIT_SCHEDULED]: [
                LEAD_STATUS.SITE_VISIT_COMPLETED,
                LEAD_STATUS.BOOKED,
                LEAD_STATUS.IN_NEGOTIATION,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.SITE_VISIT_COMPLETED]: [
                LEAD_STATUS.IN_NEGOTIATION,
                LEAD_STATUS.BOOKED,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.QUALIFIED]: [
                LEAD_STATUS.IN_NEGOTIATION,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.IN_NEGOTIATION]: [
                LEAD_STATUS.BOOKED,
                LEAD_STATUS.CONVERTED,
                LEAD_STATUS.LOST,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.BOOKED]: [
                LEAD_STATUS.CONVERTED,
                LEAD_STATUS.SOLD,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.CONVERTED]: [
                LEAD_STATUS.SOLD,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.SOLD]: [
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.LOST]: [
                LEAD_STATUS.NEW,
                LEAD_STATUS.INACTIVE
            ],
            [LEAD_STATUS.INACTIVE]: [
                LEAD_STATUS.NEW,
                LEAD_STATUS.CONTACTED
            ]
        };

        const allowedTransitions = validTransitions[normalizedCurrent] || [];

        if (!allowedTransitions.includes(newStatus)) {
            logger.warn('Invalid status transition', { from: currentStatus, to: newStatus });
            throw new ValidationException(
                `Cannot transition from ${currentStatus} to ${newStatus}`, { validTransitions: allowedTransitions }
            );
        }

        logger.info('Status transition validated');
    }

    /**
     * Validate lead priority
     * @param {string} priority - Priority value
     * @throws {ValidationException} If priority is invalid
     */
    static validatePriority(priority) {
        if (!Object.values(LEAD_PRIORITY).includes(priority)) {
            throw new ValidationException(
                `Invalid priority: ${priority}. Allowed: ${Object.values(LEAD_PRIORITY).join(', ')}`
            );
        }
    }

    /**
     * Validate search term
     * @param {string} searchTerm - Search term
     * @throws {ValidationException} If search term is invalid
     */
    static validateSearchTerm(searchTerm) {
        if (!searchTerm || searchTerm.trim() === '') {
            throw new ValidationException('Search term cannot be empty');
        }

        if (searchTerm.trim().length < 2) {
            throw new ValidationException('Search term must be at least 2 characters');
        }

        if (searchTerm.length > 100) {
            throw new ValidationException('Search term cannot exceed 100 characters');
        }
    }

    /**
     * Validate filter criteria
     * @param {Object} filters - Filter criteria
     * @throws {ValidationException} If filters are invalid
     */
    static validateFilters(filters) {
        const errors = {};

        if (filters.status && !Object.values(LEAD_STATUS).includes(filters.status)) {
            errors.status = 'Invalid status value';
        }

        if (filters.priority && !Object.values(LEAD_PRIORITY).includes(filters.priority)) {
            errors.priority = 'Invalid priority value';
        }

        if (filters.minBudget !== undefined && filters.maxBudget !== undefined) {
            if (filters.minBudget > filters.maxBudget) {
                errors.budget = 'Min budget cannot exceed max budget';
            }
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationException('Filter validation failed', errors);
        }
    }

    /**
     * Validate pagination parameters
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @throws {ValidationException} If parameters are invalid
     */
    static validatePagination(page, limit) {
        const errors = {};

        if (page < 1) {
            errors.page = 'Page must be >= 1';
        }

        if (limit < 1 || limit > 100) {
            errors.limit = 'Limit must be between 1 and 100';
        }

        if (Object.keys(errors).length > 0) {
            throw new ValidationException('Pagination validation failed', errors);
        }
    }

    /**
     * Check if lead data has required conversion fields
     * @param {Object} leadData - Lead data
     * @returns {boolean}
     */
    static hasConversionData(leadData) {
        return (
            leadData.conversionValue !== undefined &&
            leadData.conversionValue !== null &&
            leadData.conversionValue > 0
        );
    }

    /**
     * Validate assignment data
     * @param {string} leadId - Lead ID
     * @param {string} employeeId - Employee ID
     * @throws {ValidationException} If validation fails
     */
    static validateAssignment(leadId, employeeId) {
        if (!leadId) {
            throw new ValidationException('Lead ID is required');
        }

        if (!employeeId) {
            throw new ValidationException('Employee ID is required');
        }
    }
}

module.exports = LeadValidationService;