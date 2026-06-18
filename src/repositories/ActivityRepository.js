/**
 * Activity Repository
 * Data access layer for Activity/Log operations
 * Extends BaseRepository for CRUD operations
 */

const BaseRepository = require('./BaseRepository');
const ActivityLog = require('../models/ActivityLog');
const logger = require('../utils/logger');
const { ACTIVITY_TYPE, FOLLOW_UP_STATUS } = require('../constants');

class ActivityRepository extends BaseRepository {
    constructor() {
        super(ActivityLog);
        this.model = ActivityLog;
    }

    /**
     * Create activity log
     * @param {Object} activityData - Activity data
     * @returns {Promise<Object>} Created activity
     */
    async createActivity(activityData) {
        try {
            logger.info('Creating activity', { type: activityData.type, leadId: activityData.leadId });

            const activity = await this.create({
                lead: activityData.leadId,
                employee: activityData.userId || activityData.agentId || null,
                type: activityData.type,
                subject: activityData.subject,
                description: activityData.description,
                severity: activityData.severity || 'INFO',
                leadSnapshot: activityData.leadSnapshot,
                changeDetails: activityData.changeDetails,
                relatedRecords: activityData.relatedRecords,
                metadata: activityData.metadata,
                status: activityData.status || 'Completed',
                leadStatusBefore: activityData.leadStatusBefore,
                leadStatusAfter: activityData.leadStatusAfter
            });

            return activity;
        } catch (error) {
            logger.error('Error creating activity:', error);
            throw error;
        }
    }

    /**
     * Find activities by lead
     * @param {string} leadId - Lead ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Lead activities
     */
    async findByLead(leadId, options = {}) {
        try {
            logger.info('Fetching activities for lead', { leadId });

            const query = { lead: leadId, isDeleted: false };

            const activities = await this.model
                .find(query)
                .populate('employee', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .limit(options.limit || 100)
                .lean();

            return activities;
        } catch (error) {
            logger.error('Error finding activities by lead:', error);
            throw error;
        }
    }

    /**
     * Find activities by employee
     * @param {string} employeeId - Employee ID
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Employee activities
     */
    async findByEmployee(employeeId, options = {}) {
        try {
            logger.info('Fetching activities for employee', { employeeId });

            const page = parseInt(options.page, 10) || 1;
            const limit = parseInt(options.limit, 10) || 20;
            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                this.model
                .find({ employee: employeeId, isDeleted: false })
                .populate('lead', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
                this.model.countDocuments({ employee: employeeId, isDeleted: false })
            ]);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error finding activities by employee:', error);
            throw error;
        }
    }

    /**
     * Find activities by type
     * @param {string} type - Activity type
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Paginated activities of type
     */
    async findByType(type, options = {}) {
        try {
            logger.info('Fetching activities by type', { type });

            const page = parseInt(options.page, 10) || 1;
            const limit = parseInt(options.limit, 10) || 20;
            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                this.model
                .find({ type, isDeleted: false })
                .populate('lead', 'firstName lastName')
                .populate('employee', 'firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
                this.model.countDocuments({ type, isDeleted: false })
            ]);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error finding activities by type:', error);
            throw error;
        }
    }

    /**
     * Find pending follow-ups
     * @returns {Promise<Array>} Pending follow-ups
     */
    async findPending() {
        try {
            logger.info('Fetching pending follow-ups');

            const pending = await this.model
                .find({
                    type: ACTIVITY_TYPE.FOLLOW_UP,
                    'followUp.status': FOLLOW_UP_STATUS.PENDING,
                    isDeleted: false
                })
                .populate('lead', 'firstName lastName')
                .populate('employee', 'firstName lastName')
                .sort({ 'followUp.scheduledDate': 1 })
                .lean();

            return pending;
        } catch (error) {
            logger.error('Error finding pending follow-ups:', error);
            throw error;
        }
    }

    /**
     * Find overdue follow-ups
     * @returns {Promise<Array>} Overdue follow-ups
     */
    async findOverdue() {
        try {
            logger.info('Fetching overdue follow-ups');

            const now = new Date();
            const overdue = await this.model
                .find({
                    type: ACTIVITY_TYPE.FOLLOW_UP,
                    'followUp.status': FOLLOW_UP_STATUS.PENDING,
                    'followUp.scheduledDate': { $lt: now },
                    isDeleted: false
                })
                .populate('lead', 'firstName lastName')
                .populate('employee', 'firstName lastName')
                .sort({ 'followUp.scheduledDate': 1 })
                .lean();

            return overdue;
        } catch (error) {
            logger.error('Error finding overdue follow-ups:', error);
            throw error;
        }
    }

    /**
     * Get activity statistics by type
     * @param {string} leadId - Lead ID (optional)
     * @returns {Promise<Object>} Activity statistics
     */
    async getStatistics(leadId = null) {
        try {
            logger.info('Getting activity statistics', { leadId });

            const matchStage = { $match: { isDeleted: false } };

            if (leadId) {
                matchStage.$match.lead = leadId;
            }

            const stats = await this.model.aggregate([
                matchStage,
                {
                    $group: {
                        _id: '$type',
                        count: { $sum: 1 },
                        averageEngagementScore: { $avg: '$engagementScore' },
                        sentiment: {
                            $push: '$sentiment'
                        }
                    }
                },
                { $sort: { count: -1 } }
            ]);

            return stats;
        } catch (error) {
            logger.error('Error getting activity statistics:', error);
            throw error;
        }
    }

    /**
     * Mark activity as completed
     * @param {string} activityId - Activity ID
     * @returns {Promise<Object>} Updated activity
     */
    async markCompleted(activityId) {
        try {
            logger.info('Marking activity as completed', { activityId });

            const updated = await this.model.findByIdAndUpdate(
                activityId, {
                    $set: {
                        actualDate: new Date(),
                        status: 'COMPLETED'
                    }
                }, { new: true }
            );

            return updated;
        } catch (error) {
            logger.error('Error marking activity as completed:', error);
            throw error;
        }
    }

    /**
     * Schedule follow-up for activity
     * @param {string} activityId - Activity ID
     * @param {Object} followUpData - Follow-up details
     * @returns {Promise<Object>} Updated activity
     */
    async scheduleFollowUp(activityId, followUpData) {
        try {
            logger.info('Scheduling follow-up', { activityId });

            const updated = await this.model.findByIdAndUpdate(
                activityId, {
                    $set: {
                        requiresFollowUp: true,
                        followUpDate: followUpData.date,
                        followUpType: followUpData.type,
                        'followUp.status': FOLLOW_UP_STATUS.PENDING,
                        'followUp.scheduledDate': followUpData.date,
                        'followUp.type': followUpData.type,
                        'followUp.notes': followUpData.notes
                    }
                }, { new: true }
            ).populate('lead', 'firstName lastName').populate('employee', 'firstName lastName');

            return updated;
        } catch (error) {
            logger.error('Error scheduling follow-up:', error);
            throw error;
        }
    }

    /**
     * Get activity history for lead with pagination
     * @param {string} leadId - Lead ID
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Paginated history
     */
    async getActivityHistory(leadId, page = 1, limit = 20) {
        try {
            logger.info('Fetching activity history', { leadId, page, limit });

            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                this.model
                .find({ lead: leadId, isDeleted: false })
                .populate('employee', 'firstName lastName email role')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
                this.model.countDocuments({ lead: leadId, isDeleted: false })
            ]);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error fetching activity history:', error);
            throw error;
        }
    }

    /**
     * Get lead timeline
     * @param {string} leadId - Lead ID
     * @returns {Promise<Array>} Timeline of activities
     */
    async getLeadTimeline(leadId) {
        try {
            logger.info('Fetching lead timeline', { leadId });
            return await this.model.getLeadTimeline(leadId);
        } catch (error) {
            logger.error('Error fetching lead timeline:', error);
            throw error;
        }
    }

    /**
     * Get engagement summary for lead
     * @param {string} leadId - Lead ID
     * @returns {Promise<Object>} Engagement summary
     */
    async getEngagementSummary(leadId) {
        try {
            logger.info('Getting engagement summary', { leadId });

            const summary = await this.model.aggregate([
                { $match: { lead: leadId, isDeleted: false } },
                {
                    $group: {
                        _id: null,
                        totalActivities: { $sum: 1 },
                        averageEngagementScore: { $avg: '$engagementScore' },
                        lastActivity: { $max: '$createdAt' },
                        firstActivity: { $min: '$createdAt' },
                        activityTypes: { $push: '$type' }
                    }
                }
            ]);

            return summary.length > 0 ? summary[0] : null;
        } catch (error) {
            logger.error('Error getting engagement summary:', error);
            throw error;
        }
    }

    /**
     * Get activities by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {Object} options - Query options
     * @returns {Promise<Array>} Activities in range
     */
    async getByDateRange(startDate, endDate, options = {}) {
        try {
            logger.info('Fetching activities by date range', { startDate, endDate });

            const page = parseInt(options.page, 10) || 1;
            const limit = parseInt(options.limit, 10) || 20;
            const skip = (page - 1) * limit;
            const filter = {
                createdAt: { $gte: startDate, $lte: endDate },
                isDeleted: false
            };

            const [data, total] = await Promise.all([
                this.model
                .find(filter)
                .populate('lead', 'firstName lastName')
                .populate('employee', 'firstName lastName')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
                this.model.countDocuments(filter)
            ]);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error fetching activities by date range:', error);
            throw error;
        }
    }

    /**
     * Search activities by filter criteria
     * @param {Object} filters - Filter criteria
     * @param {number} page - Page number
     * @param {number} limit - Limit per page
     * @returns {Promise<Object>} Paginated activities
     */
    async findWithFilters(filters = {}, page = 1, limit = 20) {
        try {
            logger.info('Searching activities with filters', { filters });

            const query = { isDeleted: false };

            if (filters.leadId) {
                query.lead = filters.leadId;
            }

            if (filters.userId) {
                query.employee = filters.userId;
            }

            if (filters.activityType) {
                query.type = filters.activityType;
            }

            if (filters.severity) {
                query.severity = filters.severity;
            }

            if (filters.startDate || filters.endDate) {
                query.createdAt = {};
                if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate);
                if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate);
            }

            const skip = (page - 1) * limit;

            const [data, total] = await Promise.all([
                this.model
                .find(query)
                .populate('lead', 'firstName lastName email')
                .populate('employee', 'firstName lastName email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
                this.model.countDocuments(query)
            ]);

            return {
                data,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit)
                }
            };
        } catch (error) {
            logger.error('Error searching activities with filters:', error);
            throw error;
        }
    }
}

module.exports = new ActivityRepository();