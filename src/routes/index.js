/**
 * Main API Router
 * Combines all route modules
 */

const express = require('express');
const router = express.Router();

// Import route modules
const leadRoutes = require('./leadRoutes');
const activityRoutes = require('./activityRoutes');
const authRoutes = require('./authRoutes');
const employeeRoutes = require('./employeeRoutes');

// =====================================================
// HEALTH CHECK
// =====================================================
router.get('/health', (req, res) => {
    const mongoose = require('mongoose');
    const dbStatus = mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected';

    res.json({
        success: true,
        status: 'OK',
        database: dbStatus,
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// =====================================================
// API STATUS
// =====================================================
router.get('/status', (req, res) => {
    res.json({
        success: true,
        message: 'Lead Management API is running',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        timestamp: new Date().toISOString()
    });
});

// =====================================================
// API DOCUMENTATION
// =====================================================
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Lead Management System API',
        version: '1.0.0',
        endpoints: {
            leads: '/api/v1/leads',
            leadSearch: '/api/v1/leads/search?q=searchterm',
            leadStatistics: '/api/v1/leads/statistics/summary',
            unassignedLeads: '/api/v1/leads/unassigned',
            activities: '/api/v1/activities',
            activitySearch: '/api/v1/activities/search',
            activityStats: '/api/v1/activities/stats',
            health: '/api/v1/health',
            status: '/api/v1/status'
        },
        documentation: 'See /docs folder for complete API documentation'
    });
});

// =====================================================
// ROUTE MODULES
// =====================================================

// Lead routes
router.use('/leads', leadRoutes);

// Activity routes
router.use('/activities', activityRoutes);

// Auth routes
router.use('/auth', authRoutes);

// Employee routes (agents)
router.use('/employees', employeeRoutes);

module.exports = router;