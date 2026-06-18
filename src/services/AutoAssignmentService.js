/**
 * Auto Assignment Service
 * Automatically assigns leads to agents based on business rules
 * Follows Single Responsibility Principle
 */

const employeeRepository = require('../repositories/EmployeeRepository');
const activityRepository = require('../repositories/ActivityRepository');
const leadRepository = require('../repositories/LeadRepository');
const { AutoAssignmentException, BusinessLogicException } = require('../exceptions');
const { EMPLOYEE_ROLE, ACTIVITY_TYPE } = require('../constants');
const logger = require('../utils/logger');

class AutoAssignmentService {
    /**
     * Assignment strategies
     */
    static STRATEGIES = {
        ROUND_ROBIN: 'ROUND_ROBIN',
        LOAD_BALANCED: 'LOAD_BALANCED',
        SKILL_BASED: 'SKILL_BASED',
        PERFORMANCE_BASED: 'PERFORMANCE_BASED',
        AVAILABILITY_BASED: 'AVAILABILITY_BASED'
    };

    /**
     * Auto assign lead using specified strategy
     * @param {Object} lead - Lead to assign
     * @param {string} strategy - Assignment strategy
     * @returns {Promise<Object>} Assigned employee
     */
    static async autoAssignLead(lead, strategy = this.STRATEGIES.LOAD_BALANCED) {
        try {
            logger.info('Auto-assigning lead', { leadId: lead._id, strategy });

            // Get available agents
            const availableAgents = await this._getAvailableAgents();

            if (availableAgents.length === 0) {
                throw new AutoAssignmentException(
                    'No available agents for assignment',
                    'NO_AVAILABLE_AGENTS'
                );
            }

            let assignedAgent;

            switch (strategy) {
                case this.STRATEGIES.ROUND_ROBIN:
                    assignedAgent = await this._roundRobinAssignment(availableAgents);
                    break;

                case this.STRATEGIES.LOAD_BALANCED:
                    assignedAgent = await this._loadBalancedAssignment(availableAgents);
                    break;

                case this.STRATEGIES.SKILL_BASED:
                    assignedAgent = await this._skillBasedAssignment(availableAgents, lead);
                    break;

                case this.STRATEGIES.PERFORMANCE_BASED:
                    assignedAgent = await this._performanceBasedAssignment(availableAgents);
                    break;

                case this.STRATEGIES.AVAILABILITY_BASED:
                    assignedAgent = await this._availabilityBasedAssignment(availableAgents);
                    break;

                default:
                    assignedAgent = availableAgents[0];
            }

            if (!assignedAgent) {
                throw new AutoAssignmentException(
                    'Could not determine assignment',
                    'ASSIGNMENT_FAILED'
                );
            }

            logger.info('Lead auto-assigned', { leadId: lead._id, agentId: assignedAgent._id });
            return assignedAgent;
        } catch (error) {
            logger.error('Auto-assignment failed:', error);
            throw error;
        }
    }

    /**
     * Get available agents
     * @private
     * @returns {Promise<Array>} Array of available agents
     */
    static async _getAvailableAgents() {
        try {
            const agents = await employeeRepository.findByRole(EMPLOYEE_ROLE.SENIOR_AGENT);

            // Filter for active agents only
            const activeAgents = agents.filter(
                agent => agent.status === 'ACTIVE'
            );

            if (activeAgents.length === 0) {
                // Fallback to junior agents if no seniors available
                const juniorAgents = await employeeRepository.findByRole(EMPLOYEE_ROLE.JUNIOR_AGENT);
                return juniorAgents.filter(agent => agent.status === 'ACTIVE');
            }

            return activeAgents;
        } catch (error) {
            logger.error('Error getting available agents:', error);
            return [];
        }
    }

    /**
     * Round-robin assignment strategy
     * Assigns to next agent in rotation
     * @private
     */
    static async _roundRobinAssignment(agents) {
        try {
            // Get the agent with least recent assignment
            const agentWithLeastRecent = agents.reduce((prev, current) => {
                const prevTime = prev.lastAssignmentAt || new Date(0);
                const currentTime = current.lastAssignmentAt || new Date(0);
                return prevTime < currentTime ? prev : current;
            });

            return agentWithLeastRecent;
        } catch (error) {
            logger.error('Error in round-robin assignment:', error);
            return agents[0];
        }
    }

    /**
     * Load-balanced assignment strategy
     * Assigns to agent with fewest active leads
     * @private
     */
    static async _loadBalancedAssignment(agents) {
        try {
            logger.info('Performing load-balanced assignment');

            // Get count of active leads for each agent
            const agentsWithLoadCount = await Promise.all(
                agents.map(async(agent) => {
                    const leadCount = await leadRepository.count({
                        assignedTo: agent._id,
                        status: { $in: ['NEW_LEAD', 'CONTACTED', 'QUALIFIED', 'IN_NEGOTIATION'] },
                        isDeleted: false
                    });

                    return {
                        ...agent.toObject ? agent.toObject() : agent,
                        activeLeadCount: leadCount
                    };
                })
            );

            // Sort by lead count and return agent with least leads
            const sortedAgents = agentsWithLoadCount.sort(
                (a, b) => a.activeLeadCount - b.activeLeadCount
            );

            logger.info('Load-balanced assignment determined', {
                selectedAgent: sortedAgents[0]._id,
                activeLeads: sortedAgents[0].activeLeadCount
            });

            return sortedAgents[0];
        } catch (error) {
            logger.error('Error in load-balanced assignment:', error);
            return agents[0];
        }
    }

    /**
     * Skill-based assignment strategy
     * Assigns to agent with best skills for lead type
     * @private
     */
    static async _skillBasedAssignment(agents, lead) {
        try {
            logger.info('Performing skill-based assignment');

            // Score agents based on lead characteristics
            const scoredAgents = agents.map(agent => {
                let score = 0;

                // Match property type skills
                if (lead.propertyType && agent.skills) {
                    if (agent.skills.includes(lead.propertyType)) {
                        score += 5;
                    }
                }

                // Match location skills
                if (lead.location && lead.location.city && agent.territories) {
                    if (agent.territories.includes(lead.location.city)) {
                        score += 3;
                    }
                }

                // Match budget range
                if (agent.budgetRange) {
                    if (lead.budgetMax >= agent.budgetRange.min &&
                        lead.budgetMin <= agent.budgetRange.max) {
                        score += 2;
                    }
                }

                return {...agent, skillScore: score };
            });

            // Sort by score and return highest
            const sortedBySkill = scoredAgents.sort((a, b) => b.skillScore - a.skillScore);

            logger.info('Skill-based assignment determined', {
                selectedAgent: sortedBySkill[0]._id,
                skillScore: sortedBySkill[0].skillScore
            });

            return sortedBySkill[0];
        } catch (error) {
            logger.error('Error in skill-based assignment:', error);
            return agents[0];
        }
    }

    /**
     * Performance-based assignment strategy
     * Assigns to agent with highest conversion rate
     * @private
     */
    static async _performanceBasedAssignment(agents) {
        try {
            logger.info('Performing performance-based assignment');

            const agentsWithPerformance = agents.map(agent => ({
                ...agent,
                performanceScore: agent.performance?.conversionRate || 0
            }));

            const sortedByPerformance = agentsWithPerformance.sort(
                (a, b) => b.performanceScore - a.performanceScore
            );

            logger.info('Performance-based assignment determined', {
                selectedAgent: sortedByPerformance[0]._id,
                performanceScore: sortedByPerformance[0].performanceScore
            });

            return sortedByPerformance[0];
        } catch (error) {
            logger.error('Error in performance-based assignment:', error);
            return agents[0];
        }
    }

    /**
     * Availability-based assignment strategy
     * Assigns to most available agent
     * @private
     */
    static async _availabilityBasedAssignment(agents) {
        try {
            logger.info('Performing availability-based assignment');

            const now = new Date();
            const agentsWithAvailability = agents.map(agent => {
                // Calculate availability based on working hours and assignments
                let availability = 100;

                if (agent.workingHours) {
                    const isWorkingHours = this._isWithinWorkingHours(now, agent.workingHours);
                    if (!isWorkingHours) {
                        availability -= 50;
                    }
                }

                return {...agent, availability };
            });

            const sortedByAvailability = agentsWithAvailability.sort(
                (a, b) => b.availability - a.availability
            );

            logger.info('Availability-based assignment determined', {
                selectedAgent: sortedByAvailability[0]._id,
                availability: sortedByAvailability[0].availability
            });

            return sortedByAvailability[0];
        } catch (error) {
            logger.error('Error in availability-based assignment:', error);
            return agents[0];
        }
    }

    /**
     * Check if current time is within working hours
     * @private
     */
    static _isWithinWorkingHours(date, workingHours) {
        const dayOfWeek = date.getDay();
        const hour = date.getHours();

        const dayHours = workingHours[dayOfWeek];
        if (!dayHours) {
            return false;
        }

        return hour >= dayHours.start && hour < dayHours.end;
    }

    /**
     * Bulk assign leads to agent
     * @param {Array} leadIds - Array of lead IDs
     * @param {string} agentId - Agent ID to assign to
     * @returns {Promise<Object>} Assignment result
     */
    static async bulkAssignLeads(leadIds, agentId) {
        try {
            logger.info('Bulk assigning leads', { count: leadIds.length, agentId });

            // Verify agent exists
            const agent = await employeeRepository.getById(agentId);
            if (!agent) {
                throw new BusinessLogicException('Agent not found');
            }

            // Update all leads
            const result = await leadRepository.bulkUpdate(leadIds, {
                assignedTo: agentId,
                assignmentDate: new Date()
            });

            // Create activity logs
            const activities = leadIds.map(leadId => ({
                lead: leadId,
                employee: agentId,
                type: ACTIVITY_TYPE.STATUS_CHANGE,
                subject: 'Lead Assigned',
                description: `Bulk assigned to ${agent.firstName} ${agent.lastName}`
            }));

            await Promise.all(activities.map(activity =>
                activityRepository.create(activity)
            ));

            logger.info('Bulk assignment completed', { modifiedCount: result.modifiedCount });
            return result;
        } catch (error) {
            logger.error('Error bulk assigning leads:', error);
            throw error;
        }
    }

    /**
     * Rebalance assignments across agents
     * Redistributes leads for better load balancing
     * @returns {Promise<Object>} Rebalancing result
     */
    static async rebalanceAssignments() {
        try {
            logger.info('Rebalancing lead assignments');

            const agents = await this._getAvailableAgents();
            if (agents.length === 0) {
                throw new AutoAssignmentException('No available agents');
            }

            // Get all assigned leads
            const assignedLeads = await leadRepository.getAllLeads({
                limit: 1000,
                status: 'QUALIFIED'
            });

            let reassignmentCount = 0;

            // Reassign each lead for better balance
            for (const lead of assignedLeads.data) {
                const betterAgent = await this._loadBalancedAssignment(agents);

                if (lead.assignedTo._id.toString() !== betterAgent._id.toString()) {
                    await leadRepository.updateLead(
                        lead._id, { assignedTo: betterAgent._id },
                        'system'
                    );
                    reassignmentCount++;
                }
            }

            logger.info('Rebalancing completed', { reassignmentCount });
            return { reassignmentCount, totalLeads: assignedLeads.data.length };
        } catch (error) {
            logger.error('Error rebalancing assignments:', error);
            throw error;
        }
    }
}

module.exports = AutoAssignmentService;