/**
 * Lead Service
 * Business logic layer for lead operations
 */

const leadRepository = require('../repositories/LeadRepository');
const logger = require('../utils/logger');
const { LEAD_STATUS, HTTP_STATUS, ERROR_CODES } = require('../constants');

class LeadService {
    /**
     * Create a new lead
     */
    async createLead(leadData, createdBy) {
        try {
            logger.info('Creating new lead:', leadData.email);

            const lead = await leadRepository.create({
                ...leadData,
                createdBy
            });

            logger.info(`Lead created successfully: ${lead._id}`);
            return lead;
        } catch (error) {
            logger.error('Error creating lead:', error.message);
            throw {
                statusCode: HTTP_STATUS.BAD_REQUEST,
                message: error.message,
                errorCode: ERROR_CODES.VALIDATION_ERROR
            };
        }
    }

    /**
     * Get lead by ID
     */
    async getLeadById(leadId) {
        try {
            const lead = await leadRepository.findByIdWithReferences(leadId);

            if (!lead) {
                logger.warn(`Lead not found: ${leadId}`);
                throw {
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    message: 'Lead not found',
                    errorCode: ERROR_CODES.RESOURCE_NOT_FOUND
                };
            }

            return lead;
        } catch (error) {
            logger.error('Error fetching lead:', error.message);
            throw error;
        }
    }

    /**
     * Update lead
     */
    async updateLead(leadId, updateData, updatedBy) {
        try {
            const lead = await leadRepository.updateById(leadId, {
                ...updateData,
                updatedBy
            });

            if (!lead) {
                logger.warn(`Lead not found for update: ${leadId}`);
                throw {
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    message: 'Lead not found',
                    errorCode: ERROR_CODES.RESOURCE_NOT_FOUND
                };
            }

            logger.info(`Lead updated: ${leadId}`);
            return lead;
        } catch (error) {
            logger.error('Error updating lead:', error.message);
            throw error;
        }
    }

    /**
     * Delete lead (soft delete)
     */
    async deleteLead(leadId) {
        try {
            const lead = await leadRepository.softDelete(leadId);

            if (!lead) {
                logger.warn(`Lead not found for deletion: ${leadId}`);
                throw {
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    message: 'Lead not found',
                    errorCode: ERROR_CODES.RESOURCE_NOT_FOUND
                };
            }

            logger.info(`Lead soft deleted: ${leadId}`);
            return lead;
        } catch (error) {
            logger.error('Error deleting lead:', error.message);
            throw error;
        }
    }

    /**
     * Get leads by status
     */
    async getLeadsByStatus(status, options = {}) {
        try {
            return await leadRepository.findByStatus(status, options);
        } catch (error) {
            logger.error('Error fetching leads by status:', error.message);
            throw error;
        }
    }

    /**
     * Get unassigned leads
     */
    async getUnassignedLeads(options = {}) {
        try {
            return await leadRepository.getUnassignedLeads(options);
        } catch (error) {
            logger.error('Error fetching unassigned leads:', error.message);
            throw error;
        }
    }

    /**
     * Assign lead to employee
     */
    async assignLead(leadId, employeeId, assignedBy) {
        try {
            const lead = await leadRepository.updateById(leadId, {
                assignedTo: employeeId
            });

            if (!lead) {
                logger.warn(`Lead not found for assignment: ${leadId}`);
                throw {
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    message: 'Lead not found',
                    errorCode: ERROR_CODES.RESOURCE_NOT_FOUND
                };
            }

            logger.info(`Lead assigned to employee ${employeeId}: ${leadId}`);
            return lead;
        } catch (error) {
            logger.error('Error assigning lead:', error.message);
            throw error;
        }
    }

    /**
     * Search leads
     */
    async searchLeads(searchTerm, options = {}) {
        try {
            if (!searchTerm || searchTerm.trim() === '') {
                throw {
                    statusCode: HTTP_STATUS.BAD_REQUEST,
                    message: 'Search term is required',
                    errorCode: ERROR_CODES.INVALID_REQUEST
                };
            }

            return await leadRepository.searchLeads(searchTerm, options);
        } catch (error) {
            logger.error('Error searching leads:', error.message);
            throw error;
        }
    }

    /**
     * Filter leads
     */
    async filterLeads(filters = {}, options = {}) {
        try {
            return await leadRepository.filterLeads(filters, options);
        } catch (error) {
            logger.error('Error filtering leads:', error.message);
            throw error;
        }
    }

    /**
     * Get lead statistics
     */
    async getLeadStatistics(filters = {}) {
        try {
            return await leadRepository.getLeadStatistics(filters);
        } catch (error) {
            logger.error('Error getting lead statistics:', error.message);
            throw error;
        }
    }

    /**
     * Get leads by status distribution
     */
    async getLeadsByStatusDistribution() {
        try {
            return await leadRepository.getLeadsByStatus();
        } catch (error) {
            logger.error('Error getting status distribution:', error.message);
            throw error;
        }
    }

    /**
     * Convert lead
     */
    async convertLead(leadId, conversionValue = 0) {
        try {
            const lead = await leadRepository.updateById(leadId, {
                status: LEAD_STATUS.CONVERTED,
                conversionStatus: 'Converted',
                conversionValue
            });

            if (!lead) {
                throw {
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    message: 'Lead not found',
                    errorCode: ERROR_CODES.RESOURCE_NOT_FOUND
                };
            }

            logger.info(`Lead converted: ${leadId}, value: ${conversionValue}`);
            return lead;
        } catch (error) {
            logger.error('Error converting lead:', error.message);
            throw error;
        }
    }

    /**
     * Mark lead as lost
     */
    async markLeadAsLost(leadId) {
        try {
            const lead = await leadRepository.updateById(leadId, {
                status: LEAD_STATUS.LOST,
                conversionStatus: 'Abandoned'
            });

            if (!lead) {
                throw {
                    statusCode: HTTP_STATUS.NOT_FOUND,
                    message: 'Lead not found',
                    errorCode: ERROR_CODES.RESOURCE_NOT_FOUND
                };
            }

            logger.info(`Lead marked as lost: ${leadId}`);
            return lead;
        } catch (error) {
            logger.error('Error marking lead as lost:', error.message);
            throw error;
        }
    }

    /**
     * Get all leads with pagination
     */
    async getAllLeads(options = {}) {
        try {
            return await leadRepository.paginate({}, options);
        } catch (error) {
            logger.error('Error fetching all leads:', error.message);
            throw error;
        }
    }
}

module.exports = new LeadService();
