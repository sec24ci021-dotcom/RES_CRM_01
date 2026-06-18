/**
 * Lead Controller
 * Handles HTTP requests for lead management
 * Integrates with LeadService for business logic
 * Manages request validation and response formatting
 */

const leadService = require('../services/LeadService_Complete');
const LeadValidationService = require('../services/LeadValidationService');

const {
    ValidationException,
    DuplicateException,
    NotFoundException,
    BusinessLogicException,
    AutoAssignmentException
} = require('../exceptions');

const { HTTP_STATUS } = require('../constants');
const logger = require('../utils/logger');

// Helper to safely extract user id from request (avoids optional chaining pitfalls)
const getUserId = (req) => {
    try {
        return req && req.user && req.user.id ? req.user.id : null;
    } catch (e) {
        return null;
    }
};

class LeadController {
    /**
     * Create new lead
     * POST /api/leads
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async createLead(req, res, next) {
        try {
            logger.info('POST /api/leads', { body: req.body });

            // Validate request body
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'EMPTY_BODY',
                        message: 'Request body is empty',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Extract lead data
            const leadData = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                email: req.body.email,
                phone: req.body.phone,
                source: req.body.source,
                priority: req.body.priority || 'MEDIUM',
                status: req.body.status || 'NEW_LEAD',
                campaign: req.body.campaign,
                propertyId: req.body.propertyId,
                location: req.body.location,
                budgetMin: req.body.budgetMin,
                budgetMax: req.body.budgetMax,
                conversionStatus: req.body.conversionStatus || 'In Progress'
            };

            // Get user ID from request (from auth middleware)
            // If there is no authenticated user, leave createdBy null so Mongoose can store it correctly.
            const userId = getUserId(req);

            // Call service with options
            const options = {
                autoAssign: req.body.autoAssign !== false,
                assignmentStrategy: req.body.assignmentStrategy || 'LOAD_BALANCED'
            };

            const lead = await leadService.createLead(leadData, userId, options);

            logger.info('Lead created successfully', { leadId: lead._id });

            return res.status(HTTP_STATUS.CREATED).json({
                success: true,
                message: 'Lead created successfully',
                data: lead,
                statusCode: HTTP_STATUS.CREATED
            });
        } catch (error) {
            logger.error('Error creating lead:', error);

            // Handle specific exceptions
            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST,
                        details: error.details
                    }
                });
            }

            if (error instanceof DuplicateException) {
                return res.status(HTTP_STATUS.CONFLICT).json({
                    success: false,
                    error: {
                        code: 'DUPLICATE_ENTRY',
                        message: error.message,
                        statusCode: HTTP_STATUS.CONFLICT,
                        existingResource: error.existingResource
                    }
                });
            }

            if (error instanceof AutoAssignmentException) {
                return res.status(HTTP_STATUS.SERVICE_UNAVAILABLE).json({
                    success: false,
                    error: {
                        code: 'AUTO_ASSIGNMENT_FAILED',
                        message: error.message,
                        statusCode: HTTP_STATUS.SERVICE_UNAVAILABLE,
                        reason: error.reason
                    }
                });
            }

            // Pass to error handler middleware
            next(error);
        }
    }

    /**
     * Get all leads with filtering and pagination
     * GET /api/leads
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async getAllLeads(req, res, next) {
        try {
            logger.info('GET /api/leads', { query: req.query });

            // Extract pagination parameters
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Extract filter parameters
            const filters = {};

            if (req.query.status) {
                filters.status = req.query.status.split(',').filter(s => s);
            }

            if (req.query.source) {
                filters.source = req.query.source;
            }

            if (req.query.priority) {
                filters.priority = req.query.priority;
            }

            if (req.query.assignedTo) {
                filters.assignedTo = req.query.assignedTo;
            }

            if (req.query.minBudget) {
                filters.minBudget = parseInt(req.query.minBudget);
            }

            if (req.query.maxBudget) {
                filters.maxBudget = parseInt(req.query.maxBudget);
            }

            // Call service
            const results = await leadService.getAllLeads(filters, page, limit);

            logger.info('Leads retrieved successfully', { total: results.pagination.total });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Leads retrieved successfully',
                data: results.data,
                pagination: results.pagination,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error retrieving leads:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Get single lead by ID
     * GET /api/leads/:id
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async getLeadById(req, res, next) {
        try {
            const leadId = req.params.id;
            logger.info('GET /api/leads/:id', { leadId });

            // Validate ID format
            if (!leadId || leadId.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Lead ID is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            const lead = await leadService.getLeadById(leadId);

            logger.info('Lead retrieved successfully', { leadId });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead retrieved successfully',
                data: lead,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error retrieving lead:', error);

            if (error instanceof NotFoundException) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: error.message,
                        statusCode: HTTP_STATUS.NOT_FOUND
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Update lead
     * PUT /api/leads/:id
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async updateLead(req, res, next) {
        try {
            const leadId = req.params.id;
            logger.info('PUT /api/leads/:id', { leadId, body: req.body });

            // Validate ID
            if (!leadId || leadId.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Lead ID is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Validate request body
            if (!req.body || Object.keys(req.body).length === 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'EMPTY_BODY',
                        message: 'Request body is empty',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Extract update data
            const updateData = {};

            // Allowed fields for update
            const allowedFields = [
                'firstName', 'lastName', 'email', 'phone', 'status', 'priority',
                'source', 'campaign', 'propertyId', 'location', 'budgetMin',
                'budgetMax', 'conversionStatus', 'conversionValue'
            ];

            allowedFields.forEach(field => {
                if (req.body.hasOwnProperty(field)) {
                    updateData[field] = req.body[field];
                }
            });

            // Get user ID from auth middleware
            const userId = getUserId(req);

            const updated = await leadService.updateLead(leadId, updateData, userId);

            logger.info('Lead updated successfully', { leadId });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead updated successfully',
                data: updated,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error updating lead:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST,
                        details: error.details
                    }
                });
            }

            if (error instanceof NotFoundException) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: error.message,
                        statusCode: HTTP_STATUS.NOT_FOUND
                    }
                });
            }

            if (error instanceof DuplicateException) {
                return res.status(HTTP_STATUS.CONFLICT).json({
                    success: false,
                    error: {
                        code: 'DUPLICATE_ENTRY',
                        message: error.message,
                        statusCode: HTTP_STATUS.CONFLICT,
                        existingResource: error.existingResource
                    }
                });
            }

            if (error instanceof BusinessLogicException) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
                    success: false,
                    error: {
                        code: 'BUSINESS_RULE_VIOLATION',
                        message: error.message,
                        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Delete lead (soft delete)
     * DELETE /api/leads/:id
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async deleteLead(req, res, next) {
        try {
            const leadId = req.params.id;
            logger.info('DELETE /api/leads/:id', { leadId });

            // Validate ID
            if (!leadId || leadId.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Lead ID is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Get user ID from auth middleware
            const userId = getUserId(req);

            const deleted = await leadService.deleteLead(leadId, userId);

            logger.info('Lead deleted successfully', { leadId });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead deleted successfully',
                data: deleted,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error deleting lead:', error);

            if (error instanceof NotFoundException) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: error.message,
                        statusCode: HTTP_STATUS.NOT_FOUND
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Update lead status
     * PATCH /api/leads/:id/status
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async updateLeadStatus(req, res, next) {
        try {
            const leadId = req.params.id;
            const { status } = req.body;

            logger.info('PATCH /api/leads/:id/status', { leadId, status });

            // Validate ID
            if (!leadId || leadId.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Lead ID is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Validate status
            if (!status) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'MISSING_STATUS',
                        message: 'Status is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Get user ID from auth middleware
            const userId = getUserId(req);

            const updated = await leadService.updateLeadStatus(leadId, status, userId);

            logger.info('Lead status updated successfully', { leadId, status });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead status updated successfully',
                data: updated,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error updating lead status:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            if (error instanceof NotFoundException) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: error.message,
                        statusCode: HTTP_STATUS.NOT_FOUND
                    }
                });
            }

            if (error instanceof BusinessLogicException) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
                    success: false,
                    error: {
                        code: 'BUSINESS_RULE_VIOLATION',
                        message: error.message,
                        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Assign lead to agent
     * POST /api/leads/:id/assign
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async assignLead(req, res, next) {
        try {
            const leadId = req.params.id;
            const { agentId } = req.body;

            logger.info('POST /api/leads/:id/assign', { leadId, agentId });

            // Validate ID
            if (!leadId || leadId.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Lead ID is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Validate agent ID
            if (!agentId || agentId.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_AGENT_ID',
                        message: 'Agent ID is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Get user ID from auth middleware
            const userId = getUserId(req);

            const assigned = await leadService.assignLead(leadId, agentId, userId);

            logger.info('Lead assigned successfully', { leadId, agentId });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead assigned successfully',
                data: assigned,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error assigning lead:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            if (error instanceof NotFoundException) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: error.message,
                        statusCode: HTTP_STATUS.NOT_FOUND
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Convert lead to customer
     * POST /api/leads/:id/convert
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async convertLead(req, res, next) {
        try {
            const leadId = req.params.id;
            const { value } = req.body;

            logger.info('POST /api/leads/:id/convert', { leadId, value });

            // Validate ID
            if (!leadId || leadId.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_ID',
                        message: 'Lead ID is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Validate value
            if (!value || value <= 0) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_VALUE',
                        message: 'Conversion value must be greater than 0',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            // Get user ID from auth middleware
            const userId = getUserId(req);

            const converted = await leadService.convertLead(leadId, value, userId);

            logger.info('Lead converted successfully', { leadId, value });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead converted successfully',
                data: converted,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error converting lead:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            if (error instanceof NotFoundException) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: {
                        code: 'RESOURCE_NOT_FOUND',
                        message: error.message,
                        statusCode: HTTP_STATUS.NOT_FOUND
                    }
                });
            }

            if (error instanceof BusinessLogicException) {
                return res.status(HTTP_STATUS.UNPROCESSABLE_ENTITY).json({
                    success: false,
                    error: {
                        code: 'BUSINESS_RULE_VIOLATION',
                        message: error.message,
                        statusCode: HTTP_STATUS.UNPROCESSABLE_ENTITY
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Search leads
     * GET /api/leads/search/query
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async searchLeads(req, res, next) {
        try {
            const { q } = req.query;
            logger.info('GET /api/leads/search', { query: q });

            // Validate search term
            if (!q || q.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'MISSING_QUERY',
                        message: 'Search query is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            const results = await leadService.searchLeads(q);

            logger.info('Leads searched successfully', { found: results.length });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Search completed successfully',
                data: results,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error searching leads:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Get lead statistics
     * GET /api/leads/stats
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async getLeadStatistics(req, res, next) {
        try {
            logger.info('GET /api/leads/stats', { query: req.query });

            // Extract filters
            const filters = {};

            if (req.query.source) {
                filters.source = req.query.source;
            }

            if (req.query.status) {
                filters.status = req.query.status;
            }

            const stats = await leadService.getLeadStatistics(filters);

            logger.info('Lead statistics retrieved successfully');

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Statistics retrieved successfully',
                data: stats,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting statistics:', error);
            next(error);
        }
    }

    /**
     * Advanced search by customer info with regex
     * GET /api/leads/advanced-search
     * Query params: q, page, limit, sortBy, sortOrder
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async advancedSearch(req, res, next) {
        try {
            const { q, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = -1 } = req.query;

            logger.info('GET /api/leads/advanced-search', { q, page, limit, sortBy });

            if (!q || q.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'EMPTY_SEARCH',
                        message: 'Search query is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            const SearchService = require('../services/SearchService');
            const results = await SearchService.searchByCustomerInfo(q, {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder: parseInt(sortOrder)
            });

            logger.info('Advanced search completed', { found: results.data.length });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Search completed successfully',
                data: results.data,
                pagination: results.pagination,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error in advanced search:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Advanced filter by status, assignedTo, source
     * POST /api/leads/advanced-filter
     * Body: { status, assignedTo, source, priority, page, limit, sortBy, sortOrder }
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async advancedFilter(req, res, next) {
        try {
            const {
                status,
                assignedTo,
                source,
                priority,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = -1
            } = req.body;

            logger.info('POST /api/leads/advanced-filter', { status, assignedTo, source });

            const SearchService = require('../services/SearchService');
            const results = await SearchService.filterLeads({ status, assignedTo, source, priority }, {
                page: parseInt(page),
                limit: parseInt(limit),
                sortBy,
                sortOrder: parseInt(sortOrder)
            });

            logger.info('Advanced filter completed', { found: results.data.length });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Filter completed successfully',
                data: results.data,
                pagination: results.pagination,
                appliedFilters: results.appliedFilters,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error in advanced filter:', error);
            next(error);
        }
    }

    /**
     * Combined search with filter
     * POST /api/leads/search-with-filter
     * Body: { q, status, assignedTo, source, priority, page, limit, sortBy, sortOrder }
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async searchWithFilter(req, res, next) {
        try {
            const {
                q,
                status,
                assignedTo,
                source,
                priority,
                page = 1,
                limit = 10,
                sortBy = 'createdAt',
                sortOrder = -1
            } = req.body;

            logger.info('POST /api/leads/search-with-filter', { q, status, source });

            if (!q || q.trim() === '') {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'EMPTY_SEARCH',
                        message: 'Search query is required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            const SearchService = require('../services/SearchService');
            const results = await SearchService.searchWithFilter(
                q, { status, assignedTo, source, priority }, {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    sortBy,
                    sortOrder: parseInt(sortOrder)
                }
            );

            logger.info('Combined search completed', { found: results.data.length });

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Search with filter completed successfully',
                data: results.data,
                pagination: results.pagination,
                searchTerm: results.searchTerm,
                appliedFilters: results.appliedFilters,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error in search with filter:', error);

            if (error instanceof ValidationException) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'VALIDATION_ERROR',
                        message: error.message,
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            next(error);
        }
    }

    /**
     * Get advanced statistics with filters
     * GET /api/leads/advanced-stats
     * Query params: status, assignedTo, source
     *
     * @param {Object} req - Express request
     * @param {Object} res - Express response
     * @param {Function} next - Express next middleware
     * @returns {Promise<void>}
     */
    async getAdvancedStatistics(req, res, next) {
        try {
            const { status, assignedTo, source } = req.query;

            logger.info('GET /api/leads/advanced-stats', { status, source });

            const SearchService = require('../services/SearchService');
            const stats = await SearchService.getStatisticsWithFilters({
                status,
                assignedTo,
                source
            });

            logger.info('Advanced statistics retrieved successfully');

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Advanced statistics retrieved successfully',
                data: stats.data,
                appliedFilters: stats.appliedFilters,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting advanced statistics:', error);
            next(error);
        }
    }
}

module.exports = new LeadController();