/**
 * Lead Routes
 * Production-ready API routes for lead management
 * 
 * Endpoints:
 * POST   /api/leads              - Create lead
 * GET    /api/leads              - List leads (paginated, filterable)
 * GET    /api/leads/:id          - Get single lead
 * PUT    /api/leads/:id          - Update lead
 * DELETE /api/leads/:id          - Delete lead (soft delete)
 * PATCH  /api/leads/:id/status   - Update lead status
 * POST   /api/leads/:id/assign   - Assign lead to agent
 * POST   /api/leads/:id/convert  - Convert lead to customer
 * GET    /api/leads/search       - Search leads
 * GET    /api/leads/stats        - Get statistics
 */

const express = require('express');
const router = express.Router();
const LeadController = require('../controllers/LeadController');
const logger = require('../utils/logger');

// =====================================================
// ROUTE ORDERING: SPECIFIC ROUTES BEFORE PARAMETERIZED
// =====================================================
// This ensures /search, /stats routes match before /:id routes

/**
 * Search leads
 * GET /api/leads?q=searchTerm
 */
router.get('/search', (req, res, next) => {
    LeadController.searchLeads(req, res, next);
});

/**
 * Filter leads (alias for advanced filtering)
 * GET /api/leads/filter?page=1&limit=10&status=QUALIFIED&source=WEBSITE
 */
router.get('/filter', (req, res, next) => {
    LeadController.getAllLeads(req, res, next);
});

/**
 * Get lead statistics
 * GET /api/leads/stats?source=WEBSITE&status=QUALIFIED
 */
router.get('/stats', (req, res, next) => {
    LeadController.getLeadStatistics(req, res, next);
});

/**
 * Advanced search by customer info (regex-based)
 * GET /api/leads/advanced-search?q=searchTerm&page=1&limit=10&sortBy=createdAt&sortOrder=-1
 *
 * Query Parameters:
 * - q: string (search term - searches firstName, lastName, email, phone) [REQUIRED]
 * - page: number (default: 1)
 * - limit: number (default: 10, max: 100)
 * - sortBy: string (default: createdAt, options: createdAt, updatedAt, priority, status)
 * - sortOrder: number (default: -1 for descending, 1 for ascending)
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Search completed successfully",
 *   "data": [ lead objects ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 50,
 *     "pages": 5
 *   },
 *   "statusCode": 200
 * }
 */
router.get('/advanced-search', (req, res, next) => {
    LeadController.advancedSearch(req, res, next);
});

/**
 * Advanced statistics with filters
 * GET /api/leads/advanced-stats?status=QUALIFIED&assignedTo=agentId&source=WEBSITE
 *
 * Query Parameters:
 * - status: string or comma-separated (optional, filter by status)
 * - assignedTo: string (optional, agent ID)
 * - source: string or comma-separated (optional, filter by source)
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Advanced statistics retrieved successfully",
 *   "data": {
 *     "total": 150,
 *     "byStatus": { "QUALIFIED": 50, "NEW_LEAD": 100 },
 *     "bySource": { "WEBSITE": 80, "REFERRAL": 70 },
 *     "byPriority": { "HIGH": 40, "MEDIUM": 110 },
 *     "budgetStats": { "min": 50000, "max": 500000, "avg": 250000 },
 *     "topAssignments": [ { "agentId": "...", "count": 25 } ]
 *   },
 *   "appliedFilters": { ... },
 *   "statusCode": 200
 * }
 */
router.get('/advanced-stats', (req, res, next) => {
    LeadController.getAdvancedStatistics(req, res, next);
});

// =====================================================
// CRUD ROUTES
// =====================================================

/**
 * Create lead
 * POST /api/leads
 *
 * Request Body:
 * {
 *   "firstName": "string (required)",
 *   "lastName": "string (required)",
 *   "email": "string (required, valid email)",
 *   "phone": "string (required, valid format)",
 *   "source": "WEBSITE|FACEBOOK|GOOGLE_ADS|REFERRAL|WALK_IN|CALL|EMAIL (required)",
 *   "priority": "LOW|MEDIUM|HIGH|CRITICAL (default: MEDIUM)",
 *   "status": "NEW_LEAD|CONTACTED|QUALIFIED|IN_NEGOTIATION|CONVERTED|LOST|INACTIVE (default: NEW_LEAD)",
 *   "campaign": "string (optional)",
 *   "propertyId": "string (optional)",
 *   "location": { "city": "string", "coordinates": { "lat": number, "lon": number } } (optional),
 *   "budgetMin": number (optional),
 *   "budgetMax": number (optional),
 *   "autoAssign": boolean (default: true)",
 *   "assignmentStrategy": "LOAD_BALANCED|PERFORMANCE_BASED|SKILL_BASED|ROUND_ROBIN|AVAILABILITY_BASED"
 * }
 *
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Lead created successfully",
 *   "data": { lead object },
 *   "statusCode": 201
 * }
 */
router.post('/', (req, res, next) => {
    LeadController.createLead(req, res, next);
});

/**
 * Get all leads with filtering and pagination
 * GET /api/leads?page=1&limit=10&status=QUALIFIED&priority=HIGH&source=WEBSITE&assignedTo=agentId&minBudget=100000&maxBudget=500000
 *
 * Query Parameters:
 * - page: number (default: 1, min: 1)
 * - limit: number (default: 10, max: 100)
 * - status: string or comma-separated values (e.g., "QUALIFIED,IN_NEGOTIATION")
 * - source: string (WEBSITE, FACEBOOK, GOOGLE_ADS, REFERRAL, WALK_IN, CALL, EMAIL)
 * - priority: string (LOW, MEDIUM, HIGH, CRITICAL)
 * - assignedTo: string (agent ID)
 * - minBudget: number
 * - maxBudget: number
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Leads retrieved successfully",
 *   "data": [ lead objects ],
 *   "pagination": {
 *     "page": 1,
 *     "limit": 10,
 *     "total": 150,
 *     "pages": 15
 *   },
 *   "statusCode": 200
 * }
 */
router.get('/', (req, res, next) => {
    LeadController.getAllLeads(req, res, next);
});

/**
 * Get single lead by ID
 * GET /api/leads/:id
 *
 * Path Parameters:
 * - id: string (lead ID)
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Lead retrieved successfully",
 *   "data": { lead object with relationships },
 *   "statusCode": 200
 * }
 */
router.get('/:id', (req, res, next) => {
    LeadController.getLeadById(req, res, next);
});

/**
 * Update lead
 * PUT /api/leads/:id
 *
 * Path Parameters:
 * - id: string (lead ID)
 *
 * Request Body (any combination of allowed fields):
 * {
 *   "firstName": "string",
 *   "lastName": "string",
 *   "email": "string",
 *   "phone": "string",
 *   "status": "string",
 *   "priority": "string",
 *   "source": "string",
 *   "campaign": "string",
 *   "propertyId": "string",
 *   "location": object,
 *   "budgetMin": number,
 *   "budgetMax": number,
 *   "conversionStatus": "string",
 *   "conversionValue": number
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Lead updated successfully",
 *   "data": { updated lead object },
 *   "statusCode": 200
 * }
 */
router.put('/:id', (req, res, next) => {
    LeadController.updateLead(req, res, next);
});

/**
 * Delete lead (soft delete)
 * DELETE /api/leads/:id
 *
 * Path Parameters:
 * - id: string (lead ID)
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Lead deleted successfully",
 *   "data": { deleted lead object },
 *   "statusCode": 200
 * }
 */
router.delete('/:id', (req, res, next) => {
    LeadController.deleteLead(req, res, next);
});

// =====================================================
// LEAD ACTION ROUTES (must be after DELETE)
// =====================================================

/**
 * Update lead status with validation
 * PUT /api/leads/:id/status
 *
 * Request Body:
 * {
 *   "status": "NEW_LEAD|CONTACTED|QUALIFIED|IN_NEGOTIATION|CONVERTED|LOST|INACTIVE (required)"
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Lead status updated successfully",
 *   "data": { updated lead object },
 *   "statusCode": 200
 * }
 */
router.put('/:id/status', (req, res, next) => {
    LeadController.updateLeadStatus(req, res, next);
});

/**
 * Assign lead to agent
 * PUT /api/leads/:id/assign
 *
 * Request Body:
 * {
 *   "agentId": "string (required, valid agent ID)"
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Lead assigned successfully",
 *   "data": { updated lead with assigned agent },
 *   "statusCode": 200
 * }
 */
router.put('/:id/assign', (req, res, next) => {
    LeadController.assignLead(req, res, next);
});

/**
 * Convert lead to customer
 * POST /api/leads/:id/convert
 *
 * Request Body:
 * {
 *   "value": number (required, > 0, deal value in dollars)
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Lead converted successfully",
 *   "data": { converted lead with value recorded },
 *   "statusCode": 200
 * }
 */
router.post('/:id/convert', (req, res, next) => {
    LeadController.convertLead(req, res, next);
});

// =====================================================
// ADVANCED SEARCH & FILTER ROUTES (POST endpoints)
// =====================================================

/**
 * Advanced filter by criteria
 * POST /api/leads/advanced-filter
 *
 * Request Body:
 * {
 *   "status": "string or array" (optional, e.g., "QUALIFIED" or ["QUALIFIED", "IN_NEGOTIATION"]),
 *   "assignedTo": "string" (optional, agent ID),
 *   "source": "string or array" (optional, e.g., "WEBSITE" or ["WEBSITE", "REFERRAL"]),
 *   "priority": "string or array" (optional, e.g., "HIGH" or ["HIGH", "CRITICAL"]),
 *   "page": number (default: 1),
 *   "limit": number (default: 10, max: 100),
 *   "sortBy": "string" (default: createdAt),
 *   "sortOrder": number (default: -1)
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Filter completed successfully",
 *   "data": [ lead objects ],
 *   "pagination": { ... },
 *   "appliedFilters": { ... },
 *   "statusCode": 200
 * }
 */
router.post('/advanced-filter', (req, res, next) => {
    LeadController.advancedFilter(req, res, next);
});

/**
 * Combined search with filter
 * POST /api/leads/search-with-filter
 *
 * Request Body:
 * {
 *   "q": "string" (search term - required),
 *   "status": "string or array" (optional),
 *   "assignedTo": "string" (optional),
 *   "source": "string or array" (optional),
 *   "priority": "string or array" (optional),
 *   "page": number (default: 1),
 *   "limit": number (default: 10, max: 100),
 *   "sortBy": "string" (default: createdAt),
 *   "sortOrder": number (default: -1)
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Search with filter completed successfully",
 *   "data": [ lead objects ],
 *   "pagination": { ... },
 *   "searchTerm": "...",
 *   "appliedFilters": { ... },
 *   "statusCode": 200
 * }
 */
router.post('/search-with-filter', (req, res, next) => {
    LeadController.searchWithFilter(req, res, next);
});

// =====================================================
// ERROR HANDLING
// =====================================================

/**
 * 404 handler for /api/leads routes
 */
router.use((req, res) => {
    logger.warn('Route not found', { method: req.method, path: req.path });
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

module.exports = router;