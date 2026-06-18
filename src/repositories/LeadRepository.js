/**
 * Lead Repository
 * Data access layer for Lead model
 * Implements repository pattern with error handling and clean code principles
 */

const BaseRepository = require('./BaseRepository');
const Lead = require('../models/Lead');
const logger = require('../utils/logger');
const { LEAD_STATUS, LEAD_PRIORITY } = require('../constants');
const { HTTP_STATUS, ERROR_CODES } = require('../constants');

class LeadRepository extends BaseRepository {
    constructor() {
        super(Lead);
        this.defaultPopulate = ['assignedTo', 'createdBy', 'updatedBy'];
        this.defaultSort = { createdAt: -1 };
        this.defaultLimit = 10;
    }

    // =====================================================
    // PRIMARY CRUD OPERATIONS
    // =====================================================

    /**
     * Create a new lead
     * @param {Object} leadData - Lead data to create
     * @param {string} createdBy - User ID creating the lead
     * @returns {Promise<Object>} Created lead document
     * @throws {Error} If creation fails
     */
    async createLead(leadData, createdBy = null) {
        try {
            logger.info('Creating new lead:', { email: leadData.email });

            // Validate required fields
            this._validateLeadData(leadData);

            // Add metadata
            const dataWithMetadata = {
                ...leadData,
                createdBy: createdBy || null,
                status: leadData.status || LEAD_STATUS.NEW_LEAD,
                priority: leadData.priority || LEAD_PRIORITY.MEDIUM
            };

            // Create document
            const lead = await this.create(dataWithMetadata);

            logger.info('Lead created successfully:', { leadId: lead._id, email: lead.email });
            return lead;
        } catch (error) {
            logger.error('Error creating lead:', error);
            this._handleError(error, 'Failed to create lead');
        }
    }

    /**
     * Get lead by ID with relationships
     * @param {string} leadId - Lead ID to retrieve
     * @param {Object} options - Query options (populate, select, etc.)
     * @returns {Promise<Object>} Lead document with populated references
     * @throws {Error} If lead not found or query fails
     */
    async getLeadById(leadId, options = {}) {
        try {
            logger.info('Fetching lead by ID:', { leadId });

            if (!leadId) {
                throw new Error('Lead ID is required');
            }

            const { populate = this.defaultPopulate, select = null } = options;

            let query = this.model.findById(leadId);

            if (populate) {
                populate.forEach(p => {
                    query = query.populate(p);
                });
            }

            if (select) {
                query = query.select(select);
            }

            const lead = await query.exec();

            if (!lead) {
                logger.warn('Lead not found:', { leadId });
                const error = new Error('Lead not found');
                error.statusCode = HTTP_STATUS.NOT_FOUND;
                throw error;
            }

            logger.info('Lead retrieved successfully:', { leadId });
            return lead;
        } catch (error) {
            logger.error('Error fetching lead:', error);
            this._handleError(error, 'Failed to fetch lead');
        }
    }

    /**
     * Get all leads with pagination and filtering
     * @param {Object} options - Pagination and filter options
     * @returns {Promise<Object>} Paginated lead data
     * @throws {Error} If query fails
     */
    async getAllLeads(options = {}) {
        try {
            logger.info('Fetching all leads:', options);

            const {
                page = 1,
                    limit = this.defaultLimit,
                    sort = this.defaultSort,
                    status = null,
                    priority = null,
                    source = null,
                    assignedTo = null
            } = options;

            // Build filter
            const filter = { isDeleted: false };
            if (status) filter.status = status;
            if (priority) filter.priority = priority;
            if (source) filter.source = source;
            if (assignedTo) filter.assignedTo = assignedTo;

            // Paginate with populate
            const result = await this.paginate(filter, {
                page,
                limit,
                sort,
                populate: this.defaultPopulate
            });

            logger.info('Leads retrieved successfully:', {
                total: result.pagination.total,
                page: result.pagination.page
            });

            return result;
        } catch (error) {
            logger.error('Error fetching all leads:', error);
            this._handleError(error, 'Failed to fetch leads');
        }
    }

    /**
     * Update lead by ID
     * @param {string} leadId - Lead ID to update
     * @param {Object} updateData - Data to update
     * @param {string} updatedBy - User ID performing update
     * @returns {Promise<Object>} Updated lead document
     * @throws {Error} If update fails or lead not found
     */
    async updateLead(leadId, updateData, updatedBy = null) {
        try {
            logger.info('Updating lead:', { leadId });

            if (!leadId) {
                throw new Error('Lead ID is required');
            }

            // Add audit metadata
            const dataWithMetadata = {
                ...updateData,
                updatedBy: updatedBy || null
            };

            // Validate update data
            this._validateUpdateData(dataWithMetadata);

            // Update document
            const updatedLead = await this.model.findByIdAndUpdate(
                leadId, { $set: dataWithMetadata }, { new: true, runValidators: true }
            ).populate(this.defaultPopulate);

            if (!updatedLead) {
                logger.warn('Lead not found for update:', { leadId });
                const error = new Error('Lead not found');
                error.statusCode = HTTP_STATUS.NOT_FOUND;
                throw error;
            }

            logger.info('Lead updated successfully:', { leadId });
            return updatedLead;
        } catch (error) {
            logger.error('Error updating lead:', error);
            this._handleError(error, 'Failed to update lead');
        }
    }

    /**
     * Delete lead (soft delete)
     * @param {string} leadId - Lead ID to delete
     * @param {string} deletedBy - User ID performing deletion
     * @returns {Promise<Object>} Deleted lead document
     * @throws {Error} If deletion fails or lead not found
     */
    async deleteLead(leadId, deletedBy = null) {
        try {
            logger.info('Deleting lead:', { leadId });

            if (!leadId) {
                throw new Error('Lead ID is required');
            }

            // Soft delete
            const deletedLead = await this.model.findByIdAndUpdate(
                leadId, {
                    $set: {
                        isDeleted: true,
                        deletedAt: new Date(),
                        updatedBy: deletedBy
                    }
                }, { new: true, runValidators: true }
            ).populate(this.defaultPopulate);

            if (!deletedLead) {
                logger.warn('Lead not found for deletion:', { leadId });
                const error = new Error('Lead not found');
                error.statusCode = HTTP_STATUS.NOT_FOUND;
                throw error;
            }

            logger.info('Lead deleted successfully:', { leadId });
            return deletedLead;
        } catch (error) {
            logger.error('Error deleting lead:', error);
            this._handleError(error, 'Failed to delete lead');
        }
    }

    // =====================================================
    // SEARCH & FILTER OPERATIONS
    // =====================================================

    /**
     * Search leads by text
     * @param {string} searchTerm - Search query
     * @param {Object} options - Search options (pagination, sorting)
     * @returns {Promise<Object>} Search results with pagination
     * @throws {Error} If search fails
     */
    async searchLead(searchTerm, options = {}) {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                throw new Error('Search term is required');
            }

            logger.info('Searching leads:', { searchTerm });

            const {
                page = 1,
                    limit = this.defaultLimit,
                    fields = ['firstName', 'lastName', 'email', 'phone', 'notes']
            } = options;

            const skip = (page - 1) * limit;

            // Execute parallel queries for count and data
            const [data, total] = await Promise.all([
                this.model
                .find({ $text: { $search: searchTerm }, isDeleted: false }, { score: { $meta: 'textScore' } })
                .sort({ score: { $meta: 'textScore' } })
                .skip(skip)
                .limit(limit)
                .populate(this.defaultPopulate)
                .lean(),
                this.count({ $text: { $search: searchTerm }, isDeleted: false })
            ]);

            logger.info('Search completed successfully:', { searchTerm, results: total });

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                query: searchTerm
            };
        } catch (error) {
            logger.error('Error searching leads:', error);
            this._handleError(error, 'Failed to search leads');
        }
    }

    /**
     * Filter leads with multiple criteria
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Pagination and sort options
     * @returns {Promise<Object>} Filtered results with pagination
     * @throws {Error} If filter fails
     */
    async filterLead(filters = {}, options = {}) {
        try {
            logger.info('Filtering leads:', filters);

            const {
                page = 1,
                    limit = this.defaultLimit,
                    sort = this.defaultSort
            } = options;

            // Build filter query
            const filterQuery = this._buildFilterQuery(filters);

            // Add soft-delete filter
            filterQuery.isDeleted = false;

            // Execute paginated query
            const result = await this.paginate(filterQuery, {
                page,
                limit,
                sort,
                populate: this.defaultPopulate
            });

            logger.info('Filter completed successfully:', {
                total: result.pagination.total,
                filters: Object.keys(filters)
            });

            return result;
        } catch (error) {
            logger.error('Error filtering leads:', error);
            this._handleError(error, 'Failed to filter leads');
        }
    }

    // =====================================================
    // ADDITIONAL OPERATIONS
    // =====================================================

    /**
     * Find leads by status
     */
    async findByStatus(status, options = {}) {
        try {
            return await this.paginate({ status, isDeleted: false }, {...options, populate: this.defaultPopulate });
        } catch (error) {
            logger.error('Error finding leads by status:', error);
            this._handleError(error, 'Failed to find leads by status');
        }
    }

    /**
     * Find leads by source
     */
    async findBySource(source, options = {}) {
        try {
            return await this.paginate({ source, isDeleted: false }, {...options, populate: this.defaultPopulate });
        } catch (error) {
            logger.error('Error finding leads by source:', error);
            this._handleError(error, 'Failed to find leads by source');
        }
    }

    /**
     * Find leads by assigned employee
     */
    async findByAssignedEmployee(employeeId, options = {}) {
        try {
            return await this.paginate({ assignedTo: employeeId, isDeleted: false }, {...options, populate: this.defaultPopulate });
        } catch (error) {
            logger.error('Error finding leads by employee:', error);
            this._handleError(error, 'Failed to find leads by employee');
        }
    }

    /**
     * Find unassigned leads
     */
    async getUnassignedLeads(options = {}) {
        try {
            return await this.paginate({ assignedTo: null, isDeleted: false }, {...options, populate: this.defaultPopulate });
        } catch (error) {
            logger.error('Error finding unassigned leads:', error);
            this._handleError(error, 'Failed to find unassigned leads');
        }
    }

    /**
     * Find high-priority leads
     */
    async findHighPriority(options = {}) {
        try {
            return await this.paginate({ priority: LEAD_PRIORITY.HIGH, isDeleted: false }, {...options, sort: { createdAt: -1 }, populate: this.defaultPopulate });
        } catch (error) {
            logger.error('Error finding high-priority leads:', error);
            this._handleError(error, 'Failed to find high-priority leads');
        }
    }

    /**
     * Get lead statistics
     */
    async getLeadStatistics(filters = {}) {
        try {
            logger.info('Generating lead statistics');

            const match = { $match: { isDeleted: false } };

            if (filters.assignedTo) {
                match.$match.assignedTo = filters.assignedTo;
            }
            if (filters.source) {
                match.$match.source = filters.source;
            }

            const pipeline = [
                match,
                {
                    $group: {
                        _id: null,
                        totalLeads: { $sum: 1 },
                        // Count as converted if status is CONVERTED, or conversionStatus === 'CONVERTED', or convertedAt exists, or conversionValue/convertedValue > 0
                        convertedLeads: {
                            $sum: {
                                $cond: [{
                                        $or: [
                                            { $eq: ['$status', LEAD_STATUS.CONVERTED] },
                                            { $eq: ['$conversionStatus', LEAD_STATUS.CONVERTED] },
                                            { $gt: [{ $ifNull: ['$conversionValue', 0] }, 0] },
                                            { $gt: [{ $ifNull: ['$convertedValue', 0] }, 0] },
                                            { $ne: ['$convertedAt', null] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        lostLeads: {
                            $sum: { $cond: [{ $eq: ['$status', LEAD_STATUS.LOST] }, 1, 0] }
                        },
                        conversionRate: {
                            $avg: {
                                $cond: [{
                                        $or: [
                                            { $eq: ['$status', LEAD_STATUS.CONVERTED] },
                                            { $eq: ['$conversionStatus', LEAD_STATUS.CONVERTED] },
                                            { $gt: [{ $ifNull: ['$conversionValue', 0] }, 0] },
                                            { $gt: [{ $ifNull: ['$convertedValue', 0] }, 0] },
                                            { $ne: ['$convertedAt', null] }
                                        ]
                                    },
                                    1,
                                    0
                                ]
                            }
                        },
                        totalConversionValue: {
                            $sum: {
                                $add: [
                                    { $ifNull: ['$conversionValue', 0] },
                                    { $ifNull: ['$convertedValue', 0] }
                                ]
                            }
                        },
                        avgConversionValue: {
                            $avg: {
                                $cond: [
                                    { $gt: [{ $add: [{ $ifNull: ['$conversionValue', 0] }, { $ifNull: ['$convertedValue', 0] }] }, 0] },
                                    { $add: [{ $ifNull: ['$conversionValue', 0] }, { $ifNull: ['$convertedValue', 0] }] },
                                    null
                                ]
                            }
                        }
                    }
                }
            ];

            const stats = await this.aggregate(pipeline);
            return stats.length > 0 ? stats[0] : null;
        } catch (error) {
            logger.error('Error generating statistics:', error);
            this._handleError(error, 'Failed to generate statistics');
        }
    }

    /**
     * Bulk update leads
     */
    async bulkUpdate(ids, updateData) {
        try {
            logger.info('Bulk updating leads:', { count: ids.length });

            const result = await this.model.updateMany({ _id: { $in: ids }, isDeleted: false }, { $set: updateData }, { runValidators: true });

            logger.info('Bulk update completed:', { modifiedCount: result.modifiedCount });
            return result;
        } catch (error) {
            logger.error('Error bulk updating leads:', error);
            this._handleError(error, 'Failed to bulk update leads');
        }
    }

    /**
     * Restore soft-deleted lead
     */
    async restore(leadId) {
        try {
            logger.info('Restoring deleted lead:', { leadId });

            const restoredLead = await this.updateById(leadId, {
                isDeleted: false,
                deletedAt: null
            });

            if (!restoredLead) {
                throw new Error('Lead not found');
            }

            logger.info('Lead restored successfully:', { leadId });
            return restoredLead;
        } catch (error) {
            logger.error('Error restoring lead:', error);
            this._handleError(error, 'Failed to restore lead');
        }
    }

    /**
     * Get recently created leads
     */
    async getRecentLeads(days = 7, options = {}) {
        try {
            const dateFrom = new Date();
            dateFrom.setDate(dateFrom.getDate() - days);

            return await this.paginate({ createdAt: { $gte: dateFrom }, isDeleted: false }, {...options, sort: { createdAt: -1 }, populate: this.defaultPopulate });
        } catch (error) {
            logger.error('Error finding recent leads:', error);
            this._handleError(error, 'Failed to find recent leads');
        }
    }

    /**
     * Get lead with all populated references
     */
    async findByIdWithReferences(id) {
        try {
            return await this.model
                .findById(id)
                .populate('assignedTo', 'firstName lastName email role')
                .populate('createdBy', 'firstName lastName email')
                .populate('updatedBy', 'firstName lastName email');
        } catch (error) {
            logger.error('Error finding lead with references:', error);
            this._handleError(error, 'Failed to find lead with references');
        }
    }

    // =====================================================
    // HELPER METHODS
    // =====================================================

    /**
     * Validate lead data before creation
     * @private
     */
    _validateLeadData(data) {
        const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'source'];
        const missingFields = requiredFields.filter(field => !data[field]);

        if (missingFields.length > 0) {
            const error = new Error(`Missing required fields: ${missingFields.join(', ')}`);
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            error.errorCode = ERROR_CODES.VALIDATION_ERROR;
            throw error;
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            const error = new Error('Invalid email format');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            error.errorCode = ERROR_CODES.VALIDATION_ERROR;
            throw error;
        }
    }

    /**
     * Validate update data
     * @private
     */
    _validateUpdateData(data) {
        // Prevent updating certain protected fields
        const protectedFields = ['_id', 'createdAt', 'createdBy'];
        const attemptedUpdates = protectedFields.filter(field => field in data);

        if (attemptedUpdates.length > 0) {
            logger.warn('Attempted to update protected fields:', { fields: attemptedUpdates });
        }

        // If status is being updated, validate it
        if (data.status && !Object.values(LEAD_STATUS).includes(data.status)) {
            const error = new Error('Invalid lead status');
            error.statusCode = HTTP_STATUS.BAD_REQUEST;
            error.errorCode = ERROR_CODES.VALIDATION_ERROR;
            throw error;
        }
    }

    /**
     * Build filter query from criteria
     * @private
     */
    _buildFilterQuery(filters) {
        const query = {};

        if (filters.status) query.status = filters.status;
        if (filters.priority) query.priority = filters.priority;
        if (filters.source) query.source = filters.source;
        if (filters.assignedTo) query.assignedTo = filters.assignedTo;
        if (filters.conversionStatus) query.conversionStatus = filters.conversionStatus;

        // Budget range filter
        if (filters.minBudget || filters.maxBudget) {
            query.budgetMax = {};
            if (filters.minBudget) query.budgetMax.$gte = filters.minBudget;
            if (filters.maxBudget) query.budgetMax.$lte = filters.maxBudget;
        }

        // City filter (case-insensitive)
        if (filters.city) {
            query['location.city'] = { $regex: filters.city, $options: 'i' };
        }

        // Campaign filter
        if (filters.campaign) {
            query.campaign = { $regex: filters.campaign, $options: 'i' };
        }

        // Property ID filter
        if (filters.propertyId) {
            query.propertyId = filters.propertyId;
        }

        return query;
    }

    /**
     * Handle and throw formatted errors
     * @private
     */
    _handleError(error, message) {
        if (error.statusCode) {
            throw error;
        }

        const formattedError = new Error(message);
        formattedError.statusCode = error.statusCode || HTTP_STATUS.INTERNAL_SERVER_ERROR;
        formattedError.errorCode = ERROR_CODES.INTERNAL_ERROR;
        formattedError.originalError = error.message;

        throw formattedError;
    }
}

module.exports = new LeadRepository();