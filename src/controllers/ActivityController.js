/**
 * Activity Controller
 * Handles activity tracking API endpoints
 */

const ActivityService = require('../services/ActivityService');
const logger = require('../utils/logger');
const { HTTP_STATUS } = require('../constants');

class ActivityController {
    /**
     * Get all activities
     * GET /api/v1/activities
     */
    async getAllActivities(req, res, next) {
        try {
            const { page = 1, limit = 20 } = req.query;

            logger.info('GET /api/v1/activities', { page, limit });

            const result = await ActivityService.searchActivities({}, parseInt(page), parseInt(limit));

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Activities retrieved successfully',
                data: result.data,
                pagination: result.pagination,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting activities:', error);
            next(error);
        }
    }

    /**
     * Get activity by ID
     * GET /api/v1/activities/:id
     */
    async getActivityById(req, res, next) {
        try {
            const { id } = req.params;

            logger.info('GET /api/v1/activities/:id', { id });

            const activity = await ActivityService.getActivityById(id);

            if (!activity) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: {
                        code: 'ACTIVITY_NOT_FOUND',
                        message: 'Activity not found',
                        statusCode: HTTP_STATUS.NOT_FOUND
                    }
                });
            }

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Activity retrieved successfully',
                data: activity,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting activity by ID:', error);
            next(error);
        }
    }

    /**
     * Get lead activity history
     * GET /api/v1/activities/leads/:leadId
     */
    async getLeadActivityHistory(req, res, next) {
        try {
            const { leadId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            logger.info('GET /api/v1/activities/leads/:leadId', { leadId, page, limit });

            const result = await ActivityService.getLeadActivityHistory(leadId, parseInt(page), parseInt(limit));

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead activity history retrieved successfully',
                data: result.data,
                pagination: result.pagination,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting lead activity history:', error);
            next(error);
        }
    }

    /**
     * Get lead timeline
     * GET /api/v1/activities/leads/:leadId/timeline
     */
    async getLeadTimeline(req, res, next) {
        try {
            const { leadId } = req.params;

            logger.info('GET /api/v1/activities/leads/:leadId/timeline', { leadId });

            const timeline = await ActivityService.getLeadTimeline(leadId);

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Lead timeline retrieved successfully',
                data: timeline,
                count: timeline.length,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting lead timeline:', error);
            next(error);
        }
    }

    /**
     * Get user activity history
     * GET /api/v1/activities/users/:userId
     */
    async getUserActivityHistory(req, res, next) {
        try {
            const { userId } = req.params;
            const { page = 1, limit = 20 } = req.query;

            logger.info('GET /api/v1/activities/users/:userId', { userId, page, limit });

            const result = await ActivityService.getUserActivityHistory(userId, parseInt(page), parseInt(limit));

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'User activity history retrieved successfully',
                data: result.data,
                pagination: result.pagination,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting user activity history:', error);
            next(error);
        }
    }

    /**
     * Get activities by type
     * GET /api/v1/activities/type/:activityType
     */
    async getActivitiesByType(req, res, next) {
        try {
            const { activityType } = req.params;
            const { page = 1, limit = 20 } = req.query;

            logger.info('GET /api/v1/activities/type/:activityType', { activityType, page, limit });

            const result = await ActivityService.getActivitiesByType(activityType, parseInt(page), parseInt(limit));

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Activities retrieved successfully',
                data: result.data,
                pagination: result.pagination,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting activities by type:', error);
            next(error);
        }
    }

    /**
     * Get activities by date range
     * POST /api/v1/activities/search/date-range
     */
    async getActivitiesByDateRange(req, res, next) {
        try {
            const { startDate, endDate, page = 1, limit = 20 } = req.body;

            if (!startDate || !endDate) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: {
                        code: 'INVALID_DATE_RANGE',
                        message: 'startDate and endDate are required',
                        statusCode: HTTP_STATUS.BAD_REQUEST
                    }
                });
            }

            logger.info('POST /api/v1/activities/search/date-range', { startDate, endDate, page, limit });

            const result = await ActivityService.getActivitiesByDateRange(
                new Date(startDate),
                new Date(endDate),
                parseInt(page),
                parseInt(limit)
            );

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Activities retrieved successfully',
                data: result.data,
                pagination: result.pagination,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting activities by date range:', error);
            next(error);
        }
    }

    /**
     * Search activities with filters
     * POST /api/v1/activities/search
     */
    async searchActivities(req, res, next) {
        try {
            const { leadId, userId, activityType, severity, startDate, endDate, page = 1, limit = 20 } = req.body;

            logger.info('POST /api/v1/activities/search', { leadId, activityType, page, limit });

            const filters = {};
            if (leadId) filters.leadId = leadId;
            if (userId) filters.userId = userId;
            if (activityType) filters.activityType = activityType;
            if (severity) filters.severity = severity;
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);

            const result = await ActivityService.searchActivities(filters, parseInt(page), parseInt(limit));

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Activities retrieved successfully',
                data: result.data,
                pagination: result.pagination,
                appliedFilters: filters,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error searching activities:', error);
            next(error);
        }
    }

    /**
     * Get activity statistics
     * GET /api/v1/activities/stats
     */
    async getActivityStatistics(req, res, next) {
        try {
            logger.info('GET /api/v1/activities/stats');

            const stats = await ActivityService.getActivityStatistics();

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Activity statistics retrieved successfully',
                data: stats,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error getting activity statistics:', error);
            next(error);
        }
    }

    /**
     * Export activities
     * GET /api/v1/activities/export
     */
    async exportActivities(req, res, next) {
        try {
            const { format = 'json', leadId, startDate, endDate } = req.query;

            logger.info('GET /api/v1/activities/export', { format, leadId });

            const filters = {};
            if (leadId) filters.leadId = leadId;
            if (startDate) filters.startDate = new Date(startDate);
            if (endDate) filters.endDate = new Date(endDate);

            const result = await ActivityService.searchActivities(filters, 1, 10000);

            if (format === 'csv') {
                return this._exportToCSV(res, result.data);
            }

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Activities exported successfully',
                data: result.data,
                count: result.data.length,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error exporting activities:', error);
            next(error);
        }
    }

    /**
     * Export activities to CSV
     * @private
     */
    _exportToCSV(res, activities) {
        try {
            const headers = [
                'Activity ID',
                'Type',
                'Lead ID',
                'User ID',
                'Description',
                'Severity',
                'Created At'
            ];

            let csv = headers.join(',') + '\n';

            activities.forEach(activity => {
                csv += [
                    `"${activity._id}"`,
                    `"${activity.activityType}"`,
                    `"${activity.leadId}"`,
                    `"${activity.userId || 'N/A'}"`,
                    `"${activity.description.replace(/"/g, '""')}"`,
                    `"${activity.severity}"`,
                    `"${activity.createdAt}"`
                ].join(',') + '\n';
            });

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="activities.csv"');
            res.send(csv);
        } catch (error) {
            logger.error('Error exporting to CSV:', error);
            throw error;
        }
    }
}

module.exports = new ActivityController();