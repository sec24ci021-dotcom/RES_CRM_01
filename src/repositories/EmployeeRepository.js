/**
 * Employee Repository
 * Data access layer for Employee operations
 * Extends BaseRepository for CRUD operations
 */

const BaseRepository = require('./BaseRepository');
const Employee = require('../models/Employee');
const logger = require('../utils/logger');
const { EMPLOYEE_ROLE } = require('../constants');

class EmployeeRepository extends BaseRepository {
    constructor() {
        super(Employee);
        this.model = Employee;
    }

    /**
     * Find employees by role
     * @param {string} role - Employee role
     * @returns {Promise<Array>} Employees with role
     */
    async findByRole(role) {
        try {
            logger.info('Finding employees by role', { role });

            const employees = await this.model
                .find({ role, isDeleted: false })
                .select('-password')
                .lean();

            return employees;
        } catch (error) {
            logger.error('Error finding employees by role:', error);
            throw error;
        }
    }

    /**
     * Find employees by department
     * @param {string} department - Department name
     * @returns {Promise<Array>} Employees in department
     */
    async findByDepartment(department) {
        try {
            logger.info('Finding employees by department', { department });

            const employees = await this.model
                .find({ department, isDeleted: false })
                .select('-password')
                .lean();

            return employees;
        } catch (error) {
            logger.error('Error finding employees by department:', error);
            throw error;
        }
    }

    /**
     * Find employees by team
     * @param {string} team - Team name
     * @returns {Promise<Array>} Employees in team
     */
    async findByTeam(team) {
        try {
            logger.info('Finding employees by team', { team });

            const employees = await this.model
                .find({ team, isDeleted: false })
                .select('-password')
                .lean();

            return employees;
        } catch (error) {
            logger.error('Error finding employees by team:', error);
            throw error;
        }
    }

    /**
     * Get top performing employees
     * @param {number} limit - Number of employees to return
     * @returns {Promise<Array>} Top performers
     */
    async getTopPerformers(limit = 10) {
        try {
            logger.info('Fetching top performers', { limit });

            const employees = await this.model
                .find({ isDeleted: false })
                .sort({ 'performance.conversionRate': -1 })
                .limit(limit)
                .select('-password')
                .lean();

            return employees;
        } catch (error) {
            logger.error('Error fetching top performers:', error);
            throw error;
        }
    }

    /**
     * Update employee performance metrics
     * @param {string} employeeId - Employee ID
     * @returns {Promise<Object>} Updated employee
     */
    async updateMetrics(employeeId) {
        try {
            logger.info('Updating employee metrics', { employeeId });

            // Calculate metrics from lead conversions
            const Lead = require('../models/Lead');

            const metrics = await Lead.aggregate([{
                    $match: {
                        assignedTo: employeeId,
                        isDeleted: false
                    }
                },
                {
                    $group: {
                        _id: '$assignedTo',
                        totalLeads: { $sum: 1 },
                        convertedLeads: {
                            $sum: {
                                $cond: [
                                    { $eq: ['$status', 'CONVERTED'] },
                                    1,
                                    0
                                ]
                            }
                        },
                        totalConversionValue: {
                            $sum: { $cond: ['$conversionValue', '$conversionValue', 0] }
                        }
                    }
                }
            ]);

            if (metrics.length === 0) {
                return;
            }

            const metric = metrics[0];
            const conversionRate = metric.totalLeads > 0 ?
                (metric.convertedLeads / metric.totalLeads * 100).toFixed(2) :
                0;

            const averageDealValue = metric.convertedLeads > 0 ?
                (metric.totalConversionValue / metric.convertedLeads).toFixed(2) :
                0;

            const updated = await this.model.findByIdAndUpdate(
                employeeId, {
                    $set: {
                        'performance.totalLeadsAssigned': metric.totalLeads,
                        'performance.convertedLeads': metric.convertedLeads,
                        'performance.conversionRate': conversionRate,
                        'performance.averageDealValue': averageDealValue,
                        updatedAt: new Date()
                    }
                }, { new: true }
            ).select('-password');

            logger.info('Metrics updated successfully', { employeeId, metrics: { conversionRate, averageDealValue } });
            return updated;
        } catch (error) {
            logger.error('Error updating metrics:', error);
            throw error;
        }
    }

    /**
     * Get employee with performance summary
     * @param {string} employeeId - Employee ID
     * @returns {Promise<Object>} Employee with performance
     */
    async getById(employeeId) {
        try {
            logger.info('Fetching employee', { employeeId });

            const employee = await this.model
                .findById(employeeId)
                .select('-password')
                .lean();

            if (!employee) {
                return null;
            }

            return employee;
        } catch (error) {
            logger.error('Error fetching employee:', error);
            throw error;
        }
    }

    /**
     * Get employees reporting to manager
     * @param {string} managerId - Manager ID
     * @returns {Promise<Array>} Subordinate employees
     */
    async getDirectReports(managerId) {
        try {
            logger.info('Fetching direct reports', { managerId });

            const employees = await this.model
                .find({ reportingTo: managerId, isDeleted: false })
                .select('-password')
                .lean();

            return employees;
        } catch (error) {
            logger.error('Error fetching direct reports:', error);
            throw error;
        }
    }

    /**
     * Get employee hierarchy (manager and their reports)
     * @param {string} managerId - Manager ID
     * @returns {Promise<Object>} Manager with team structure
     */
    async getTeamHierarchy(managerId) {
        try {
            logger.info('Fetching team hierarchy', { managerId });

            const manager = await this.getById(managerId);
            if (!manager) {
                return null;
            }

            const directReports = await this.getDirectReports(managerId);

            return {
                manager,
                team: directReports,
                totalTeamSize: directReports.length
            };
        } catch (error) {
            logger.error('Error fetching team hierarchy:', error);
            throw error;
        }
    }

    /**
     * Create employee with password hashing
     * @param {Object} employeeData - Employee data
     * @returns {Promise<Object>} Created employee
     */
    async createEmployee(employeeData) {
        try {
            logger.info('Creating employee', { email: employeeData.email });

            const employee = new this.model(employeeData);
            await employee.save();

            return employee.toObject({ virtuals: true, getters: true, versionKey: false });
        } catch (error) {
            logger.error('Error creating employee:', error);
            throw error;
        }
    }

    /**
     * Find employee by email
     * @param {string} email - Email address
     * @returns {Promise<Object>} Employee or null
     */
    async findByEmail(email) {
        try {
            const employee = await this.model
                .findOne({ email: email.toLowerCase(), isDeleted: false })
                .select('-password')
                .lean();

            return employee;
        } catch (error) {
            logger.error('Error finding employee by email:', error);
            throw error;
        }
    }
}

module.exports = new EmployeeRepository();
