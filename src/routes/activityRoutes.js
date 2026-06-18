/**
 * Activity Routes
 * API endpoints for activity tracking and management
 */

const express = require('express');
const router = express.Router();
const ActivityController = require('../controllers/ActivityController');
const logger = require('../utils/logger');

// =====================================================
// ACTIVITY ROUTES
// =====================================================

/**
 * Get all activities
 * GET /api/v1/activities
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Activities retrieved successfully",
 *   "data": [ activity objects ],
 *   "pagination": { page, limit, total, pages },
 *   "statusCode": 200
 * }
 */
router.get('/', (req, res, next) => {
    ActivityController.getAllActivities(req, res, next);
});

/**
 * Get activity statistics
 * GET /api/v1/activities/stats
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Activity statistics retrieved successfully",
 *   "data": {
 *     "totalActivities": 1000,
 *     "byType": [...],
 *     "bySource": [...],
 *     "last24Hours": 50
 *   },
 *   "statusCode": 200
 * }
 */
router.get('/stats', (req, res, next) => {
    ActivityController.getActivityStatistics(req, res, next);
});

/**
 * Export activities
 * GET /api/v1/activities/export?format=json&leadId=xxx
 *
 * Query Parameters:
 * - format: 'json' | 'csv' (default: json)
 * - leadId: string (optional)
 * - startDate: ISO date string (optional)
 * - endDate: ISO date string (optional)
 *
 * Response (200 OK):
 * { success: true, data: [...], count: number }
 */
router.get('/export', (req, res, next) => {
    ActivityController.exportActivities(req, res, next);
});

/**
 * Search activities with filters
 * POST /api/v1/activities/search
 *
 * Request Body:
 * {
 *   "leadId": "string (optional)",
 *   "userId": "string (optional)",
 *   "activityType": "string (optional)",
 *   "severity": "INFO|WARNING|CRITICAL (optional)",
 *   "startDate": "ISO date string (optional)",
 *   "endDate": "ISO date string (optional)",
 *   "page": 1,
 *   "limit": 20
 * }
 *
 * Response (200 OK):
 * { success: true, data: [...], pagination: {...}, appliedFilters: {...} }
 */
router.post('/search', (req, res, next) => {
    ActivityController.searchActivities(req, res, next);
});

/**
 * Get activities by date range
 * POST /api/v1/activities/search/date-range
 *
 * Request Body:
 * {
 *   "startDate": "ISO date string (required)",
 *   "endDate": "ISO date string (required)",
 *   "page": 1,
 *   "limit": 20
 * }
 *
 * Response (200 OK):
 * { success: true, data: [...], pagination: {...} }
 */
router.post('/search/date-range', (req, res, next) => {
    ActivityController.getActivitiesByDateRange(req, res, next);
});

/**
 * Get activities by type
 * GET /api/v1/activities/type/:activityType
 *
 * Path Parameters:
 * - activityType: LEAD_CREATED | LEAD_UPDATED | LEAD_DELETED | LEAD_ASSIGNED | STATUS_CHANGED | etc.
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 *
 * Response (200 OK):
 * { success: true, data: [...], pagination: {...} }
 */
router.get('/type/:activityType', (req, res, next) => {
    ActivityController.getActivitiesByType(req, res, next);
});

/**
 * Get user activity history
 * GET /api/v1/activities/users/:userId
 *
 * Path Parameters:
 * - userId: string (user/agent ID)
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 *
 * Response (200 OK):
 * { success: true, data: [...], pagination: {...} }
 */
router.get('/users/:userId', (req, res, next) => {
    ActivityController.getUserActivityHistory(req, res, next);
});

/**
 * Get lead timeline (all activities)
 * GET /api/v1/activities/leads/:leadId/timeline
 *
 * Path Parameters:
 * - leadId: string (lead ID)
 *
 * Response (200 OK):
 * { success: true, data: [ activity objects ], count: number }
 */
router.get('/leads/:leadId/timeline', (req, res, next) => {
    ActivityController.getLeadTimeline(req, res, next);
});

/**
 * Get lead activity history
 * GET /api/v1/activities/leads/:leadId
 *
 * Path Parameters:
 * - leadId: string (lead ID)
 *
 * Query Parameters:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 *
 * Response (200 OK):
 * { success: true, data: [...], pagination: {...} }
 */
router.get('/leads/:leadId', (req, res, next) => {
    ActivityController.getLeadActivityHistory(req, res, next);
});

/**
 * Get activity by ID
 * GET /api/v1/activities/:id
 *
 * Path Parameters:
 * - id: string (activity ID)
 *
 * Response (200 OK):
 * { success: true, data: activity object }
 */
router.get('/:id', (req, res, next) => {
    ActivityController.getActivityById(req, res, next);
});

// =====================================================
// ERROR HANDLING
// =====================================================

/**
 * 404 handler for /api/v1/activities routes
 */
router.use((req, res) => {
    logger.warn('Activity route not found', { method: req.method, path: req.path });
    res.status(404).json({
        success: false,
        error: {
            code: 'ROUTE_NOT_FOUND',
            message: `${req.method} ${req.path} not found`,
            statusCode: 404
        }
    });
});

module.exports = router;