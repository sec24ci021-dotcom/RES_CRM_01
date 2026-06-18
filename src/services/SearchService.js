/**
 * Search Service
 * Advanced search with regex, text search, and MongoDB aggregation pipeline
 * Handles complex queries with pagination, sorting, and filtering
 */

const Lead = require('../models/Lead');
const logger = require('../utils/logger');
const { ValidationException, NotFoundException } = require('../exceptions');

class SearchService {
    /**
     * Search leads by customer name, email, or mobile with regex
     * Supports partial matching with case-insensitive search
     * 
     * @param {string} searchTerm - Search query
     * @param {Object} options - Search options (page, limit, sort)
     * @returns {Promise<Object>} Paginated search results
     */
    static async searchByCustomerInfo(searchTerm, options = {}) {
        try {
            const {
                page = 1,
                    limit = 10,
                    sortBy = 'createdAt',
                    sortOrder = -1
            } = options;

            if (!searchTerm || searchTerm.trim() === '') {
                throw new ValidationException('Search term is required');
            }

            logger.info('Searching leads by customer info', { searchTerm, page, limit });

            // Build regex pattern for case-insensitive partial matching
            const regexPattern = new RegExp(searchTerm, 'i');

            // Calculate skip
            const skip = (page - 1) * limit;

            // Build aggregation pipeline
            const pipeline = [{
                    $match: {
                        isDeleted: false,
                        $or: [
                            { firstName: regexPattern },
                            { lastName: regexPattern },
                            { email: regexPattern },
                            { phone: regexPattern }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'assignedTo',
                        foreignField: '_id',
                        as: 'assignedToDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$assignedToDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $facet: {
                        metadata: [
                            { $count: 'total' }
                        ],
                        data: [
                            { $sort: {
                                    [sortBy]: sortOrder } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    firstName: 1,
                                    lastName: 1,
                                    email: 1,
                                    phone: 1,
                                    source: 1,
                                    status: 1,
                                    priority: 1,
                                    location: 1,
                                    budgetMin: 1,
                                    budgetMax: 1,
                                    assignedTo: 1,
                                    assignedToName: {
                                        $concat: ['$assignedToDetails.firstName', ' ', '$assignedToDetails.lastName']
                                    },
                                    createdAt: 1,
                                    updatedAt: 1
                                }
                            }
                        ]
                    }
                }
            ];

            const results = await Lead.aggregate(pipeline);

            const total = results[0].metadata[0]?.total || 0;
            const leads = results[0].data;

            logger.info('Search completed', { found: leads.length, total, page, limit });

            return {
                success: true,
                data: leads,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                searchTerm
            };
        } catch (error) {
            logger.error('Error searching leads:', error);
            throw error;
        }
    }

    /**
     * Advanced filter with status, assignedTo, source
     * Supports multiple values for each filter
     * 
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Pagination and sorting options
     * @returns {Promise<Object>} Filtered results
     */
    static async filterLeads(filters = {}, options = {}) {
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
            } = {...filters, ...options };

            logger.info('Filtering leads', { filters, page, limit });

            // Build match stage
            const matchStage = { isDeleted: false };

            if (status) {
                // Handle both single string and array of statuses
                const statuses = Array.isArray(status) ? status : [status];
                if (statuses.length > 0) {
                    matchStage.status = { $in: statuses };
                }
            }

            if (assignedTo) {
                // Check if it's a valid ObjectId
                try {
                    matchStage.assignedTo = this._convertToObjectId(assignedTo);
                } catch (e) {
                    logger.warn('Invalid assignedTo ID:', assignedTo);
                    return {
                        success: true,
                        data: [],
                        pagination: { page, limit, total: 0, pages: 0 }
                    };
                }
            }

            if (source) {
                const sources = Array.isArray(source) ? source : [source];
                if (sources.length > 0) {
                    matchStage.source = { $in: sources };
                }
            }

            if (priority) {
                const priorities = Array.isArray(priority) ? priority : [priority];
                if (priorities.length > 0) {
                    matchStage.priority = { $in: priorities };
                }
            }

            // Calculate skip
            const skip = (page - 1) * limit;

            // Build aggregation pipeline
            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'assignedTo',
                        foreignField: '_id',
                        as: 'assignedToDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$assignedToDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $facet: {
                        metadata: [
                            { $count: 'total' }
                        ],
                        data: [
                            { $sort: {
                                    [sortBy]: sortOrder } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    firstName: 1,
                                    lastName: 1,
                                    email: 1,
                                    phone: 1,
                                    source: 1,
                                    status: 1,
                                    priority: 1,
                                    location: 1,
                                    budgetMin: 1,
                                    budgetMax: 1,
                                    assignedTo: 1,
                                    assignedToName: {
                                        $cond: [
                                            { $eq: ['$assignedToDetails', null] },
                                            'Unassigned',
                                            { $concat: ['$assignedToDetails.firstName', ' ', '$assignedToDetails.lastName'] }
                                        ]
                                    },
                                    createdAt: 1,
                                    updatedAt: 1
                                }
                            }
                        ]
                    }
                }
            ];

            const results = await Lead.aggregate(pipeline);

            const total = results[0].metadata[0]?.total || 0;
            const leads = results[0].data;

            logger.info('Filter completed', { found: leads.length, total, page, limit });

            return {
                success: true,
                data: leads,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                appliedFilters: filters
            };
        } catch (error) {
            logger.error('Error filtering leads:', error);
            throw error;
        }
    }

    /**
     * Combined search and filter
     * Search within filtered results
     * 
     * @param {string} searchTerm - Search query
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Pagination and sorting
     * @returns {Promise<Object>} Combined results
     */
    static async searchWithFilter(searchTerm, filters = {}, options = {}) {
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
            } = {...filters, ...options };

            logger.info('Search with filter', { searchTerm, filters, page, limit });

            if (!searchTerm || searchTerm.trim() === '') {
                throw new ValidationException('Search term is required');
            }

            // Build regex pattern
            const regexPattern = new RegExp(searchTerm, 'i');

            // Build match stage
            const matchStage = {
                isDeleted: false,
                $or: [
                    { firstName: regexPattern },
                    { lastName: regexPattern },
                    { email: regexPattern },
                    { phone: regexPattern }
                ]
            };

            if (status) {
                const statuses = Array.isArray(status) ? status : [status];
                if (statuses.length > 0) {
                    matchStage.status = { $in: statuses };
                }
            }

            if (assignedTo) {
                try {
                    matchStage.assignedTo = this._convertToObjectId(assignedTo);
                } catch (e) {
                    logger.warn('Invalid assignedTo ID:', assignedTo);
                    return {
                        success: true,
                        data: [],
                        pagination: { page, limit, total: 0, pages: 0 }
                    };
                }
            }

            if (source) {
                const sources = Array.isArray(source) ? source : [source];
                if (sources.length > 0) {
                    matchStage.source = { $in: sources };
                }
            }

            if (priority) {
                const priorities = Array.isArray(priority) ? priority : [priority];
                if (priorities.length > 0) {
                    matchStage.priority = { $in: priorities };
                }
            }

            const skip = (page - 1) * limit;

            const pipeline = [
                { $match: matchStage },
                {
                    $lookup: {
                        from: 'employees',
                        localField: 'assignedTo',
                        foreignField: '_id',
                        as: 'assignedToDetails'
                    }
                },
                {
                    $unwind: {
                        path: '$assignedToDetails',
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $facet: {
                        metadata: [
                            { $count: 'total' }
                        ],
                        data: [
                            { $sort: {
                                    [sortBy]: sortOrder } },
                            { $skip: skip },
                            { $limit: limit },
                            {
                                $project: {
                                    _id: 1,
                                    firstName: 1,
                                    lastName: 1,
                                    email: 1,
                                    phone: 1,
                                    source: 1,
                                    status: 1,
                                    priority: 1,
                                    location: 1,
                                    budgetMin: 1,
                                    budgetMax: 1,
                                    assignedTo: 1,
                                    assignedToName: {
                                        $cond: [
                                            { $eq: ['$assignedToDetails', null] },
                                            'Unassigned',
                                            { $concat: ['$assignedToDetails.firstName', ' ', '$assignedToDetails.lastName'] }
                                        ]
                                    },
                                    createdAt: 1,
                                    updatedAt: 1
                                }
                            }
                        ]
                    }
                }
            ];

            const results = await Lead.aggregate(pipeline);

            const total = results[0].metadata[0]?.total || 0;
            const leads = results[0].data;

            logger.info('Combined search completed', { found: leads.length, total });

            return {
                success: true,
                data: leads,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                },
                searchTerm,
                appliedFilters: filters
            };
        } catch (error) {
            logger.error('Error in combined search:', error);
            throw error;
        }
    }

    /**
     * Get advanced statistics with filtering
     * 
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Statistics
     */
    static async getStatisticsWithFilters(filters = {}) {
        try {
            const { status, assignedTo, source } = filters;

            logger.info('Getting statistics with filters', { filters });

            // Build match stage
            const matchStage = { isDeleted: false };

            if (status) {
                const statuses = Array.isArray(status) ? status : [status];
                if (statuses.length > 0) {
                    matchStage.status = { $in: statuses };
                }
            }

            if (assignedTo) {
                try {
                    matchStage.assignedTo = this._convertToObjectId(assignedTo);
                } catch (e) {
                    logger.warn('Invalid assignedTo ID:', assignedTo);
                }
            }

            if (source) {
                const sources = Array.isArray(source) ? source : [source];
                if (sources.length > 0) {
                    matchStage.source = { $in: sources };
                }
            }

            const pipeline = [
                { $match: matchStage },
                {
                    $facet: {
                        totalCount: [{ $count: 'count' }],
                        byStatus: [
                            { $group: { _id: '$status', count: { $sum: 1 } } },
                            { $sort: { _id: 1 } }
                        ],
                        bySource: [
                            { $group: { _id: '$source', count: { $sum: 1 } } },
                            { $sort: { _id: 1 } }
                        ],
                        byPriority: [
                            { $group: { _id: '$priority', count: { $sum: 1 } } },
                            { $sort: { _id: 1 } }
                        ],
                        budgetStats: [{
                            $group: {
                                _id: null,
                                totalBudgetMin: { $sum: '$budgetMin' },
                                totalBudgetMax: { $sum: '$budgetMax' },
                                avgBudgetMin: { $avg: '$budgetMin' },
                                avgBudgetMax: { $avg: '$budgetMax' }
                            }
                        }],
                        assignmentStats: [{
                                $group: {
                                    _id: '$assignedTo',
                                    count: { $sum: 1 }
                                }
                            },
                            { $sort: { count: -1 } },
                            { $limit: 10 }
                        ]
                    }
                }
            ];

            const results = await Lead.aggregate(pipeline);
            const stats = results[0];

            const formattedStats = {
                total: stats.totalCount[0]?.count || 0,
                byStatus: stats.byStatus.map(s => ({ status: s._id, count: s.count })),
                bySource: stats.bySource.map(s => ({ source: s._id, count: s.count })),
                byPriority: stats.byPriority.map(s => ({ priority: s._id, count: s.count })),
                budget: stats.budgetStats[0] || {
                    totalBudgetMin: 0,
                    totalBudgetMax: 0,
                    avgBudgetMin: 0,
                    avgBudgetMax: 0
                },
                topAssignments: stats.assignmentStats
            };

            logger.info('Statistics retrieved', { total: formattedStats.total });

            return {
                success: true,
                data: formattedStats,
                appliedFilters: filters
            };
        } catch (error) {
            logger.error('Error getting statistics:', error);
            throw error;
        }
    }

    /**
     * Helper to convert string ID to ObjectId
     * @private
     */
    static _convertToObjectId(id) {
        const mongoose = require('mongoose');
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new Error(`Invalid ObjectId: ${id}`);
        }
        return mongoose.Types.ObjectId(id);
    }
}

module.exports = SearchService;
