/**
 * Lead Service
 * Comprehensive business logic for lead management
 * Integrates validation, duplicate checking, auto-assignment, and activity logging
 * Follows SOLID principles and orchestrates domain services
 */

const leadRepository = require('../repositories/LeadRepository');
const employeeRepository = require('../repositories/EmployeeRepository');
const activityRepository = require('../repositories/ActivityRepository');

const LeadValidationService = require('./LeadValidationService');
const DuplicateCheckService = require('./DuplicateCheckService');
const AutoAssignmentService = require('./AutoAssignmentService');

const {
    ValidationException,
    DuplicateException,
    NotFoundException,
    BusinessLogicException,
    AutoAssignmentException
} = require('../exceptions');

const { LEAD_STATUS, ACTIVITY_TYPE } = require('../constants');
const logger = require('../utils/logger');

class LeadService {
    /**
     * Create a new lead with all business rules
     * - Validates lead data
     * - Prevents duplicate leads
     * - Auto-assigns lead
     * - Logs creation activity
     * 
     * @param {Object} leadData - Lead data
     * @param {string} userId - User creating the lead
     * @param {Object} options - Additional options
     * @returns {Promise<Object>} Created lead
     */
    async createLead(leadData, userId, options = {}) {
            try {
                logger.info('Creating lead via service', { email: leadData.email });

                // 1. Validate lead data
                LeadValidationService.validateLeadForCreation(leadData);

                // 2. Check for duplicates
                await DuplicateCheckService.checkForDuplicate(
                    leadData.email,
                    leadData.phone
                );

                // 3. Check for near duplicates and warn
                if (leadData.location && leadData.location.city) {
                    const nearDuplicates = await DuplicateCheckService.checkForNearDuplicates(
                        leadData.firstName,
                        leadData.lastName,
                        leadData.location.city
                    );

                    if (nearDuplicates.length > 0) {
                        logger.warn('Near duplicates found for new lead', {
                            count: nearDuplicates.length
                        });
                    }
                }

                // 4. Create lead in repository
                const lead = await leadRepository.createLead(leadData, userId);

                // 5. Auto-assign if enabled
                let assignedAgent = null;
                if (options.autoAssign !== false) {
                    try {
                        assignedAgent = await AutoAssignmentService.autoAssignLead(
                            lead,
                            options.assignmentStrategy
                        );

                        // Update lead with assignment
                        const assignedLead = await leadRepository.updateLead(
                            lead._id, { assignedTo: assignedAgent._id },
                            userId
                        );

                        // Update assignedAgent reference
                        lead.assignedTo = assignedAgent;

                        logger.info('Lead auto-assigned', { agentId: assignedAgent._id });
                    } catch (error) {
                        logger.warn('Auto-assignment failed, continuing without assignment', {
                            error: error.message
                        });
                    }
                }

                // 6. Log creation activity
                await this._logActivity({
                            leadId: lead._id,
                            userId,
                            type: ACTIVITY_TYPE.STATUS_CHANGE,
                            subject: 'Lead Created',
                            description: `Lead ${lead.firstName} ${lead.lastName} created from ${leadData.source}${assignedAgent ? ` and assigned to ${assignedAgent.firstName} ${assignedAgent.lastName}` : ''}`
            });

            logger.info('Lead created successfully', { leadId: lead._id });
            return lead;
        } catch (error) {
            logger.error('Error creating lead:', error);
            throw error;
        }
    }

    /**
     * Get lead by ID with full details
     * @param {string} leadId - Lead ID
     * @returns {Promise<Object>} Lead with relationships
     * @throws {NotFoundException} If lead not found
     */
    async getLeadById(leadId) {
        try {
            logger.info('Fetching lead', { leadId });

            const lead = await leadRepository.getLeadById(leadId);

            if (!lead) {
                throw new NotFoundException(`Lead ${leadId} not found`);
            }

            return lead;
        } catch (error) {
            logger.error('Error fetching lead:', error);
            throw error;
        }
    }

    /**
     * Get all leads with filtering and pagination
     * @param {Object} filters - Filter criteria
     * @param {number} page - Page number
     * @param {number} limit - Records per page
     * @returns {Promise<Object>} Paginated leads
     */
    async getAllLeads(filters = {}, page = 1, limit = 10) {
        try {
            logger.info('Fetching all leads', { page, limit, filters });

            // Validate pagination
            LeadValidationService.validatePagination(page, limit);

            // Validate filters
            LeadValidationService.validateFilters(filters);

            const results = await leadRepository.getAllLeads({
                ...filters,
                page,
                limit
            });

            return results;
        } catch (error) {
            logger.error('Error fetching leads:', error);
            throw error;
        }
    }

    /**
     * Update lead with business logic
     * - Validates update data
     * - Validates status transition
     * - Logs activity
     * 
     * @param {string} leadId - Lead ID
     * @param {Object} updateData - Data to update
     * @param {string} userId - User performing update
     * @returns {Promise<Object>} Updated lead
     */
    async updateLead(leadId, updateData, userId) {
        try {
            logger.info('Updating lead', { leadId, fields: Object.keys(updateData) });

            // Get existing lead
            const existingLead = await this.getLeadById(leadId);

            // Validate update data
            LeadValidationService.validateLeadForUpdate(updateData);

            // Validate status transition if status is being updated
            if (updateData.status && updateData.status !== existingLead.status) {
                LeadValidationService.validateStatusTransition(
                    existingLead.status,
                    updateData.status
                );
            }

            // Check for email duplicate if email is being updated
            if (updateData.email && updateData.email !== existingLead.email) {
                const emailDuplicate = await DuplicateCheckService.checkDuplicateEmail(
                    updateData.email,
                    leadId
                );

                if (emailDuplicate) {
                    throw new DuplicateException(
                        `Email ${updateData.email} already in use`,
                        emailDuplicate
                    );
                }
            }

            // Update lead
            const updatedLead = await leadRepository.updateLead(
                leadId,
                updateData,
                userId
            );

            // Log activity
            const changes = this._getChangedFields(existingLead, updateData);
            await this._logActivity({
                leadId,
                userId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: 'Lead Updated',
                description: `Lead updated: ${Object.keys(changes).join(', ')}`,
                metadata: { changes }
            });

            logger.info('Lead updated successfully', { leadId });
            return updatedLead;
        } catch (error) {
            logger.error('Error updating lead:', error);
            throw error;
        }
    }

    /**
     * Update lead status with validation
     * @param {string} leadId - Lead ID
     * @param {string} newStatus - New status
     * @param {string} userId - User performing update
     * @returns {Promise<Object>} Updated lead
     */
    async updateLeadStatus(leadId, newStatus, userId) {
        try {
            logger.info('Updating lead status', { leadId, newStatus });

            const lead = await this.getLeadById(leadId);

            // Validate status transition
            LeadValidationService.validateStatusTransition(lead.status, newStatus);

            // Update status
            const updated = await this.updateLead(leadId, { status: newStatus }, userId);

            // Log status change
            await this._logActivity({
                leadId,
                userId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: `Status Changed to ${newStatus}`,
                description: `Lead status changed from ${lead.status} to ${newStatus}`,
                metadata: { oldStatus: lead.status, newStatus }
            });

            return updated;
        } catch (error) {
            logger.error('Error updating lead status:', error);
            throw error;
        }
    }

    /**
     * Assign lead to agent with logging
     * @param {string} leadId - Lead ID
     * @param {string} agentId - Agent ID
     * @param {string} userId - User performing assignment
     * @returns {Promise<Object>} Updated lead
     */
    async assignLead(leadId, agentId, userId) {
        try {
            logger.info('Assigning lead to agent', { leadId, agentId });

            // Validate assignment
            LeadValidationService.validateAssignment(leadId, agentId);

            // Get lead and agent
            const lead = await this.getLeadById(leadId);
            const agent = await employeeRepository.getById(agentId);

            if (!agent) {
                throw new NotFoundException(`Agent ${agentId} not found`);
            }

            // Update assignment
            const updated = await leadRepository.updateLead(
                leadId,
                { assignedTo: agentId, assignmentDate: new Date() },
                userId
            );

            // Log assignment activity
            await this._logActivity({
                leadId,
                userId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: 'Lead Assigned',
                description: `Lead assigned to ${agent.firstName} ${agent.lastName}`,
                metadata: { agentId, previousAgent: lead.assignedTo?._id }
            });

            logger.info('Lead assigned successfully', { leadId, agentId });
            return updated;
        } catch (error) {
            logger.error('Error assigning lead:', error);
            throw error;
        }
    }

    /**
     * Delete lead (soft delete)
     * @param {string} leadId - Lead ID
     * @param {string} userId - User deleting lead
     * @returns {Promise<Object>} Deleted lead
     */
    async deleteLead(leadId, userId) {
        try {
            logger.info('Deleting lead', { leadId });

            const lead = await this.getLeadById(leadId);

            // Delete lead
            const deleted = await leadRepository.deleteLead(leadId, userId);

            // Log deletion activity
            await this._logActivity({
                leadId,
                userId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: 'Lead Deleted',
                description: `Lead ${lead.firstName} ${lead.lastName} soft deleted`
            });

            logger.info('Lead deleted successfully', { leadId });
            return deleted;
        } catch (error) {
            logger.error('Error deleting lead:', error);
            throw error;
        }
    }

    /**
     * Convert lead to customer
     * @param {string} leadId - Lead ID
     * @param {number} conversionValue - Deal value
     * @param {string} userId - User converting lead
     * @returns {Promise<Object>} Converted lead
     */
    async convertLead(leadId, conversionValue, userId) {
        try {
            logger.info('Converting lead to customer', { leadId, conversionValue });

            const lead = await this.getLeadById(leadId);

            // Validate conversion data
            if (!conversionValue || conversionValue <= 0) {
                throw new ValidationException('Conversion value must be greater than 0');
            }

            // Update to converted
            const converted = await this.updateLead(
                leadId,
                {
                    status: LEAD_STATUS.CONVERTED,
                    conversionValue,
                    conversionDate: new Date()
                },
                userId
            );

            // Log conversion
            await this._logActivity({
                leadId,
                userId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: 'Lead Converted',
                description: `Lead converted to customer with value $${conversionValue}`,
                metadata: { conversionValue }
            });

            // Update agent performance metrics
            if (lead.assignedTo) {
                await employeeRepository.updateMetrics(lead.assignedTo._id || lead.assignedTo);
            }

            logger.info('Lead converted successfully', { leadId, conversionValue });
            return converted;
        } catch (error) {
            logger.error('Error converting lead:', error);
            throw error;
        }
    }

    /**
     * Mark lead as lost
     * @param {string} leadId - Lead ID
     * @param {string} reason - Reason for loss
     * @param {string} userId - User marking as lost
     * @returns {Promise<Object>} Updated lead
     */
    async markLeadAsLost(leadId, reason, userId) {
        try {
            logger.info('Marking lead as lost', { leadId, reason });

            const lead = await this.getLeadById(leadId);

            // Update status
            const updated = await this.updateLead(
                leadId,
                {
                    status: LEAD_STATUS.LOST,
                    lostReason: reason,
                    lostDate: new Date()
                },
                userId
            );

            // Log lost activity
            await this._logActivity({
                leadId,
                userId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: 'Lead Lost',
                description: `Lead marked as lost: ${reason}`,
                metadata: { reason }
            });

            logger.info('Lead marked as lost', { leadId });
            return updated;
        } catch (error) {
            logger.error('Error marking lead as lost:', error);
            throw error;
        }
    }

    /**
     * Search leads
     * @param {string} searchTerm - Search query
     * @param {Object} options - Search options
     * @returns {Promise<Object>} Search results
     */
    async searchLeads(searchTerm, options = {}) {
        try {
            logger.info('Searching leads', { searchTerm });

            // Validate search term
            LeadValidationService.validateSearchTerm(searchTerm);

            const results = await leadRepository.searchLead(searchTerm, options);

            return results;
        } catch (error) {
            logger.error('Error searching leads:', error);
            throw error;
        }
    }

    /**
     * Filter leads with advanced criteria
     * @param {Object} filters - Filter criteria
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Filtered results
     */
    async filterLeads(filters = {}, options = {}) {
        try {
            logger.info('Filtering leads', { filters });

            // Validate filters
            LeadValidationService.validateFilters(filters);

            const results = await leadRepository.filterLead(filters, options);

            return results;
        } catch (error) {
            logger.error('Error filtering leads:', error);
            throw error;
        }
    }

    /**
     * Get lead statistics
     * @param {Object} filters - Filter criteria
     * @returns {Promise<Object>} Statistics
     */
    async getLeadStatistics(filters = {}) {
        try {
            logger.info('Getting lead statistics', { filters });

            const stats = await leadRepository.getLeadStatistics(filters);

            return stats;
        } catch (error) {
            logger.error('Error getting statistics:', error);
            throw error;
        }
    }

    /**
     * Bulk assign leads to agent
     * @param {Array} leadIds - Lead IDs
     * @param {string} agentId - Agent ID
     * @param {string} userId - User performing action
     * @returns {Promise<Object>} Assignment result
     */
    async bulkAssignLeads(leadIds, agentId, userId) {
        try {
            logger.info('Bulk assigning leads', { count: leadIds.length, agentId });

            const result = await AutoAssignmentService.bulkAssignLeads(leadIds, agentId);

            logger.info('Bulk assignment completed', { modifiedCount: result.modifiedCount });
            return result;
        } catch (error) {
            logger.error('Error bulk assigning leads:', error);
            throw error;
        }
    }

    /**
     * Find and report duplicate leads
     * @returns {Promise<Object>} Duplicate report
     */
    async getDuplicateReport() {
        try {
            logger.info('Generating duplicate report');

            const report = await DuplicateCheckService.getDuplicateReport();

            return report;
        } catch (error) {
            logger.error('Error generating duplicate report:', error);
            throw error;
        }
    }

    /**
     * Merge duplicate leads
     * @param {string} primaryLeadId - Lead to keep
     * @param {string} duplicateLeadId - Lead to merge
     * @param {string} userId - User merging
     * @returns {Promise<Object>} Merged lead
     */
    async mergeDuplicateLeads(primaryLeadId, duplicateLeadId, userId) {
        try {
            logger.info('Merging duplicate leads', { primaryLeadId, duplicateLeadId });

            const merged = await DuplicateCheckService.mergeDuplicateLeads(
                primaryLeadId,
                duplicateLeadId,
                {}
            );

            // Log merge activity
            await this._logActivity({
                leadId: primaryLeadId,
                userId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: 'Duplicate Merged',
                description: `Duplicate lead ${duplicateLeadId} merged into this lead`
            });

            logger.info('Leads merged successfully');
            return merged;
        } catch (error) {
            logger.error('Error merging leads:', error);
            throw error;
        }
    }

    /**
     * Get unassigned leads
     * @param {Object} options - Query options
     * @returns {Promise<Object>} Unassigned leads
     */
    async getUnassignedLeads(options = {}) {
        try {
            logger.info('Fetching unassigned leads');

            const results = await leadRepository.getUnassignedLeads(options);

            return results;
        } catch (error) {
            logger.error('Error fetching unassigned leads:', error);
            throw error;
        }
    }

    /**
     * Rebalance lead assignments
     * @returns {Promise<Object>} Rebalancing result
     */
    async rebalanceAssignments() {
        try {
            logger.info('Rebalancing lead assignments');

            const result = await AutoAssignmentService.rebalanceAssignments();

            return result;
        } catch (error) {
            logger.error('Error rebalancing assignments:', error);
            throw error;
        }
    }

    // =====================================================
    // PRIVATE HELPER METHODS
    // =====================================================

    /**
     * Log activity for lead
     * @private
     */
    async _logActivity(activityData) {
        try {
            return await activityRepository.createActivity(activityData);
        } catch (error) {
            logger.warn('Failed to log activity:', error.message);
            // Don't throw - activity logging shouldn't break main operations
        }
    }

    /**
     * Get changed fields between old and new data
     * @private
     */
    _getChangedFields(oldData, newData) {
        const changes = {};

        Object.keys(newData).forEach(key => {
            if (oldData[key] !== newData[key]) {
                changes[key] = {
                    oldValue: oldData[key],
                    newValue: newData[key]
                };
            }
        });

        return changes;
    }
}

module.exports = new LeadService();
