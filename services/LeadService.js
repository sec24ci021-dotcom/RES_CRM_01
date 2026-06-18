/**
 * Lead Service - Business Logic Layer
 * Contains all lead management operations
 */

const Lead = require('../models/Lead');
const LeadActivity = require('../models/LeadActivity');
const LeadAssignment = require('../models/LeadAssignment');
const LeadFollowUp = require('../models/LeadFollowUp');
const Employee = require('../models/Employee');

class LeadService {
    /**
     * Create a new lead
     */
    static async createLead(leadData, createdBy) {
        try {
            const lead = new Lead({
                ...leadData,
                createdBy
            });
            return await lead.save();
        } catch (error) {
            throw new Error(`Failed to create lead: ${error.message}`);
        }
    }

    /**
     * Get lead by ID with populated references
     */
    static async getLeadById(leadId) {
        try {
            const lead = await Lead.findById(leadId)
                .populate('status')
                .populate('source')
                .populate('assignedTo', 'firstName lastName email phone')
                .populate('company')
                .populate('createdBy', 'firstName lastName email');

            if (!lead || lead.isDeleted) {
                throw new Error('Lead not found');
            }
            return lead;
        } catch (error) {
            throw new Error(`Failed to retrieve lead: ${error.message}`);
        }
    }

    /**
     * Update lead information
     */
    static async updateLead(leadId, updateData) {
        try {
            const lead = await Lead.findByIdAndUpdate(
                    leadId, {...updateData, updatedAt: new Date() }, { new: true, runValidators: true }
                )
                .populate('status')
                .populate('source')
                .populate('assignedTo');

            if (!lead || lead.isDeleted) {
                throw new Error('Lead not found');
            }
            return lead;
        } catch (error) {
            throw new Error(`Failed to update lead: ${error.message}`);
        }
    }

    /**
     * Delete lead (soft delete)
     */
    static async deleteLead(leadId) {
        try {
            const lead = await Lead.findById(leadId);
            if (!lead) {
                throw new Error('Lead not found');
            }
            return await lead.softDelete();
        } catch (error) {
            throw new Error(`Failed to delete lead: ${error.message}`);
        }
    }

    /**
     * Search leads by name, email, or phone
     */
    static async searchLeads(searchTerm, options = {}) {
        try {
            const { page = 1, limit = 10, isDeleted = false } = options;
            const skip = (page - 1) * limit;

            // Use text search for multiple fields
            const leads = await Lead.searchLeads(searchTerm)
                .find({ isDeleted })
                .skip(skip)
                .limit(limit)
                .populate('status')
                .populate('source')
                .populate('assignedTo', 'firstName lastName email');

            const total = await Lead.countDocuments({
                $text: { $search: searchTerm },
                isDeleted
            });

            return {
                leads,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                }
            };
        } catch (error) {
            throw new Error(`Search failed: ${error.message}`);
        }
    }

    /**
     * Filter leads by status, employee, source
     */
    static async filterLeads(filters = {}, options = {}) {
        try {
            const { page = 1, limit = 10 } = options;
            const skip = (page - 1) * limit;

            const query = {
                isDeleted: false,
                ...filters
            };

            const leads = await Lead.find(query)
                .skip(skip)
                .limit(limit)
                .populate('status')
                .populate('source')
                .populate('assignedTo', 'firstName lastName email')
                .sort({ createdAt: -1 });

            const total = await Lead.countDocuments(query);

            return {
                leads,
                pagination: {
                    total,
                    page,
                    pages: Math.ceil(total / limit),
                    limit
                }
            };
        } catch (error) {
            throw new Error(`Filter failed: ${error.message}`);
        }
    }

    /**
     * Assign lead to employee
     */
    static async assignLead(leadId, assignedTo, assignedBy, reason = '') {
        try {
            const lead = await Lead.findById(leadId);
            if (!lead || lead.isDeleted) {
                throw new Error('Lead not found');
            }

            // Deactivate previous assignment if exists
            if (lead.assignedTo) {
                await LeadAssignment.updateMany({ lead: leadId, isActive: true }, { isActive: false, assignmentStatus: 'TRANSFERRED' });
            }

            // Create new assignment
            const assignment = await LeadAssignment.create({
                lead: leadId,
                assignedBy,
                assignedTo,
                reassignmentReason: reason
            });

            // Update lead
            lead.assignedTo = assignedTo;
            lead.assignedAt = new Date();
            await lead.save();

            // Create activity log
            await LeadActivity.create({
                lead: leadId,
                activityType: 'STATUS_CHANGE',
                title: 'Lead Assigned',
                description: `Lead assigned to ${assignedTo}. Reason: ${reason || 'New assignment'}`,
                createdBy: assignedBy,
                status: 'COMPLETED'
            });

            return assignment;
        } catch (error) {
            throw new Error(`Failed to assign lead: ${error.message}`);
        }
    }

    /**
     * Add activity to lead
     */
    static async addActivity(leadId, activityData, createdBy) {
        try {
            const lead = await Lead.findById(leadId);
            if (!lead || lead.isDeleted) {
                throw new Error('Lead not found');
            }

            const activity = await LeadActivity.create({
                ...activityData,
                lead: leadId,
                createdBy
            });

            return activity;
        } catch (error) {
            throw new Error(`Failed to add activity: ${error.message}`);
        }
    }

    /**
     * Get lead activities
     */
    static async getLeadActivities(leadId, limit = 20) {
        try {
            const activities = await LeadActivity.getRecentActivities(leadId, limit);
            return activities;
        } catch (error) {
            throw new Error(`Failed to retrieve activities: ${error.message}`);
        }
    }

    /**
     * Get assignment history
     */
    static async getAssignmentHistory(leadId) {
        try {
            const history = await LeadAssignment.getAssignmentHistory(leadId);
            return history;
        } catch (error) {
            throw new Error(`Failed to retrieve assignment history: ${error.message}`);
        }
    }

    /**
     * Create follow-up task
     */
    static async createFollowUp(leadId, followUpData, createdBy) {
        try {
            const lead = await Lead.findById(leadId);
            if (!lead || lead.isDeleted) {
                throw new Error('Lead not found');
            }

            const followUp = await LeadFollowUp.create({
                ...followUpData,
                lead: leadId,
                createdBy
            });

            return followUp;
        } catch (error) {
            throw new Error(`Failed to create follow-up: ${error.message}`);
        }
    }

    /**
     * Get pending follow-ups for employee
     */
    static async getPendingFollowUps(employeeId) {
        try {
            const followUps = await LeadFollowUp.getPendingFollowUps(employeeId);
            return followUps;
        } catch (error) {
            throw new Error(`Failed to retrieve follow-ups: ${error.message}`);
        }
    }

    /**
     * Get overdue follow-ups
     */
    static async getOverdueFollowUps(employeeId) {
        try {
            const followUps = await LeadFollowUp.getOverdueFollowUps(employeeId);
            return followUps;
        } catch (error) {
            throw new Error(`Failed to retrieve overdue follow-ups: ${error.message}`);
        }
    }

    /**
     * Get lead statistics
     */
    static async getLeadStatistics(filters = {}) {
        try {
            const query = { isDeleted: false, ...filters };

            const totalLeads = await Lead.countDocuments(query);
            const convertedLeads = await Lead.countDocuments({
                ...query,
                conversionStatus: 'CONVERTED'
            });
            const lostLeads = await Lead.countDocuments({
                ...query,
                conversionStatus: 'LOST'
            });
            const newLeads = await Lead.countDocuments({
                ...query,
                conversionStatus: 'NEW'
            });

            const conversionRate = totalLeads > 0 ?
                ((convertedLeads / totalLeads) * 100).toFixed(2) :
                0;

            return {
                totalLeads,
                convertedLeads,
                lostLeads,
                newLeads,
                conversionRate
            };
        } catch (error) {
            throw new Error(`Failed to get statistics: ${error.message}`);
        }
    }

    /**
     * Get lead by status breakdown
     */
    static async getLeadsByStatus() {
        try {
            const breakdown = await Lead.aggregate([
                { $match: { isDeleted: false } },
                { $group: { _id: '$status', count: { $sum: 1 } } },
                {
                    $lookup: {
                        from: 'lead_statuses',
                        localField: '_id',
                        foreignField: '_id',
                        as: 'statusInfo'
                    }
                }
            ]);

            return breakdown;
        } catch (error) {
            throw new Error(`Failed to get status breakdown: ${error.message}`);
        }
    }
}

module.exports = LeadService;