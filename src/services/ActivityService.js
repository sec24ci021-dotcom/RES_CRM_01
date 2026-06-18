/**
 * Activity Service
 * Business logic for activity tracking and management
 */

const ActivityRepository = require('../repositories/ActivityRepository');
const logger = require('../utils/logger');

class ActivityService {
    /**
     * Track lead creation
     * @param {string} leadId - Lead ID
     * @param {Object} leadData - Lead data
     * @param {string} userId - User ID (optional)
     * @returns {Promise<Object>} Created activity
     */
    async trackLeadCreated(leadId, leadData, userId = null) {
        try {
            const activity = {
                type: 'LEAD_CREATED',
                leadId,
                userId,
                subject: 'Lead Created',
                severity: 'INFO',
                leadSnapshot: {
                    firstName: leadData.firstName,
                    lastName: leadData.lastName,
                    email: leadData.email,
                    phone: leadData.phone,
                    status: leadData.status,
                    priority: leadData.priority,
                    source: leadData.source,
                    assignedTo: leadData.assignedTo
                },
                changeDetails: {
                    changeType: 'CREATED',
                    field: 'lead',
                    newValue: `${leadData.firstName} ${leadData.lastName}`
                },
                description: `Lead created: ${leadData.firstName} ${leadData.lastName} (${leadData.email})`,
                metadata: {
                    source: 'API'
                }
            };

            const result = await ActivityRepository.createActivity(activity);
            logger.info('Activity tracked: Lead created', { leadId, userId });
            return result;
        } catch (error) {
            logger.error('Error tracking lead creation:', error);
            throw error;
        }
    }

    /**
     * Track lead update
     * @param {string} leadId - Lead ID
     * @param {Object} changes - Changed fields
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Created activity
     */
    async trackLeadUpdated(leadId, changes, userId) {
        try {
            const changedFields = Object.keys(changes).map(key => `${key}`).join(', ');

            const activity = {
                type: 'LEAD_UPDATED',
                leadId,
                userId,
                subject: 'Lead Updated',
                severity: 'INFO',
                changeDetails: {
                    changeType: 'UPDATED',
                    field: changedFields,
                    newValue: JSON.stringify(changes)
                },
                description: `Lead updated: ${changedFields}`,
                metadata: {
                    source: 'API'
                }
            };

            const result = await ActivityRepository.createActivity(activity);
            logger.info('Activity tracked: Lead updated', { leadId, userId, changes: changedFields });
            return result;
        } catch (error) {
            logger.error('Error tracking lead update:', error);
            throw error;
        }
    }

    /**
     * Track lead deletion
     * @param {string} leadId - Lead ID
     * @param {Object} leadData - Lead data before deletion
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Created activity
     */
    async trackLeadDeleted(leadId, leadData, userId) {
        try {
            const activity = {
                type: 'LEAD_DELETED',
                leadId,
                userId,
                subject: 'Lead Deleted',
                severity: 'WARNING',
                leadSnapshot: leadData,
                changeDetails: {
                    changeType: 'DELETED',
                    field: 'lead',
                    oldValue: `${leadData.firstName} ${leadData.lastName}`
                },
                description: `Lead deleted: ${leadData.firstName} ${leadData.lastName}`,
                metadata: {
                    source: 'API'
                }
            };

            const result = await ActivityRepository.createActivity(activity);
            logger.info('Activity tracked: Lead deleted', { leadId, userId });
            return result;
        } catch (error) {
            logger.error('Error tracking lead deletion:', error);
            throw error;
        }
    }

    /**
     * Track lead assignment
     * @param {string} leadId - Lead ID
     * @param {string} previousAssignee - Previous assignee ID
     * @param {string} newAssignee - New assignee ID
     * @param {string} userId - User ID performing the action
     * @returns {Promise<Object>} Created activity
     */
    async trackLeadAssigned(leadId, previousAssignee, newAssignee, userId) {
        try {
            const activity = {
                type: 'LEAD_ASSIGNED',
                leadId,
                userId,
                subject: 'Lead Assigned',
                severity: 'INFO',
                changeDetails: {
                    changeType: 'ASSIGNED',
                    field: 'assignedTo',
                    oldValue: previousAssignee || 'Unassigned',
                    newValue: newAssignee
                },
                description: `Lead reassigned from ${previousAssignee ? 'agent' : 'unassigned'} to new agent`,
                relatedRecords: [
                    { entityType: 'Agent', entityId: newAssignee }
                ],
                metadata: {
                    source: 'API'
                }
            };

            const result = await ActivityRepository.createActivity(activity);
            logger.info('Activity tracked: Lead assigned', { leadId, userId, newAssignee });
            return result;
        } catch (error) {
            logger.error('Error tracking lead assignment:', error);
            throw error;
        }
    }

    /**
     * Track status change
     * @param {string} leadId - Lead ID
     * @param {string} previousStatus - Previous status
     * @param {string} newStatus - New status
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Created activity
     */
    async trackStatusChanged(leadId, previousStatus, newStatus, userId) {
        try {
            const activity = {
                type: 'STATUS_CHANGED',
                leadId,
                userId,
                subject: 'Lead Status Changed',
                severity: 'INFO',
                changeDetails: {
                    changeType: 'STATUS',
                    field: 'status',
                    oldValue: previousStatus,
                    newValue: newStatus
                },
                description: `Lead status changed from ${previousStatus} to ${newStatus}`,
                metadata: {
                    source: 'API'
                }
            };

            const result = await ActivityRepository.createActivity(activity);
            logger.info('Activity tracked: Status changed', { leadId, userId, previousStatus, newStatus });
            return result;
        } catch (error) {
            logger.error('Error tracking status change:', error);
            throw error;
        }
    }

    /**
     * Track lead conversion
     * @param {string} leadId - Lead ID
     * @param {number} value - Conversion value
     * @param {string} userId - User ID
     * @returns {Promise<Object>} Created activity
     */
    async trackLeadConverted(leadId, value, userId) {
        try {
            const activity = {
                type: 'LEAD_CONVERTED',
                leadId,
                userId,
                subject: 'Lead Converted',
                severity: 'CRITICAL',
                changeDetails: {
                    changeType: 'CONVERTED',
                    field: 'conversionValue',
                    newValue: value
                },
                description: `Lead converted with value: ${value}`,
                metadata: {
                    source: 'API'
                }
            };

            const result = await ActivityRepository.createActivity(activity);
            logger.info('Activity tracked: Lead converted', { leadId, userId, value });
            return result;
        } catch (error) {
            logger.error('Error tracking lead conversion:', error);
            throw error;
        }
    }

    /**
     * Get activity history for a lead
     * @param {string} leadId - Lead ID
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Paginated activities
     */
    async getActivityById(activityId) {
        try {
            return await ActivityRepository.findById(activityId, {
                populate: ['lead', 'employee']
            });
        } catch (error) {
            logger.error('Error getting activity by ID:', error);
            throw error;
        }
    }

    async getLeadActivityHistory(leadId, page = 1, limit = 20) {
        try {
            return await ActivityRepository.getActivityHistory(leadId, page, limit);
        } catch (error) {
            logger.error('Error getting lead activity history:', error);
            throw error;
        }
    }

    /**
     * Get user activity history
     * @param {string} userId - User ID
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Paginated activities
     */
    async getUserActivityHistory(userId, page = 1, limit = 20) {
        try {
            return await ActivityRepository.findByEmployee(userId, { page, limit });
        } catch (error) {
            logger.error('Error getting user activity history:', error);
            throw error;
        }
    }

    /**
     * Get activities by type
     * @param {string} activityType - Activity type
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Paginated activities
     */
    async getActivitiesByType(activityType, page = 1, limit = 20) {
        try {
            return await ActivityRepository.findByType(activityType, { page, limit });
        } catch (error) {
            logger.error('Error getting activities by type:', error);
            throw error;
        }
    }

    /**
     * Get activities by date range
     * @param {Date} startDate - Start date
     * @param {Date} endDate - End date
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Paginated activities
     */
    async getActivitiesByDateRange(startDate, endDate, page = 1, limit = 20) {
        try {
            return await ActivityRepository.getByDateRange(startDate, endDate, { page, limit });
        } catch (error) {
            logger.error('Error getting activities by date range:', error);
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
            return await ActivityRepository.getLeadTimeline(leadId);
        } catch (error) {
            logger.error('Error getting lead timeline:', error);
            throw error;
        }
    }

    /**
     * Get activity statistics
     * @returns {Promise<Object>} Statistics
     */
    async getActivityStatistics() {
        try {
            return await ActivityRepository.getStatistics();
        } catch (error) {
            logger.error('Error getting activity statistics:', error);
            throw error;
        }
    }

    /**
     * Search activities with filters
     * @param {Object} filters - Filter criteria
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Paginated activities
     */
    async searchActivities(filters = {}, page = 1, limit = 20) {
        try {
            return await ActivityRepository.findWithFilters(filters, page, limit);
        } catch (error) {
            logger.error('Error searching activities:', error);
            throw error;
        }
    }
}

module.exports = new ActivityService();