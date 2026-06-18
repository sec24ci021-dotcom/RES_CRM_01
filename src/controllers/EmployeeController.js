/**
 * Employee Controller
 * Exposes minimal endpoints for employees used by the frontend (list + get)
 */

const employeeRepository = require('../repositories/EmployeeRepository');
const { HTTP_STATUS } = require('../constants');
const logger = require('../utils/logger');

class EmployeeController {
    async getAllEmployees(req, res, next) {
        try {
            // Let the model-level pre-find hook handle excluding deleted records
            const employees = await employeeRepository.findAll();

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Employees retrieved successfully',
                data: employees,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error fetching employees:', error);
            next(error);
        }
    }

    async getEmployeeById(req, res, next) {
        try {
            const id = req.params.id;
            if (!id) {
                return res.status(HTTP_STATUS.BAD_REQUEST).json({
                    success: false,
                    error: { code: 'INVALID_ID', message: 'Employee ID is required', statusCode: HTTP_STATUS.BAD_REQUEST }
                });
            }

            const employee = await employeeRepository.getById(id);
            if (!employee) {
                return res.status(HTTP_STATUS.NOT_FOUND).json({
                    success: false,
                    error: { code: 'RESOURCE_NOT_FOUND', message: 'Employee not found', statusCode: HTTP_STATUS.NOT_FOUND }
                });
            }

            return res.status(HTTP_STATUS.OK).json({
                success: true,
                message: 'Employee retrieved successfully',
                data: employee,
                statusCode: HTTP_STATUS.OK
            });
        } catch (error) {
            logger.error('Error fetching employee by id:', error);
            next(error);
        }
    }
}

module.exports = new EmployeeController();