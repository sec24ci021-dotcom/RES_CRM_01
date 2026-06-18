const express = require('express');
const router = express.Router();
const EmployeeController = require('../controllers/EmployeeController');

/**
 * GET /api/employees
 */
router.get('/', (req, res, next) => {
    EmployeeController.getAllEmployees(req, res, next);
});

/**
 * GET /api/employees/:id
 */
router.get('/:id', (req, res, next) => {
    EmployeeController.getEmployeeById(req, res, next);
});

module.exports = router;