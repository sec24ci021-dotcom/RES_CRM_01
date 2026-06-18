/**
 * Lead Management API Service
 * Centralized service layer for all API calls
 * This provides a clean interface for frontend components to interact with the backend
 */

import axiosClient from './axiosClient'

// ========================================
// LEAD ENDPOINTS
// ========================================

/**
 * Get all leads with pagination and filtering
 * @param {number} page - Page number (default: 1)
 * @param {number} limit - Items per page (default: 10)
 * @param {object} filters - Additional filters (status, source, priority, assignedTo, etc.)
 * @returns {Promise} Response with leads array and pagination
 */
export const getLeads = (page = 1, limit = 10, filters = {}) => {
    const params = { page, limit, ...filters }
    return axiosClient.get('/leads', { params })
}

/**
 * Get single lead by ID
 * @param {string} leadId - Lead ID
 * @returns {Promise} Lead object
 */
export const getLeadById = (leadId) => {
    return axiosClient.get(`/leads/${leadId}`)
}

/**
 * Create a new lead
 * @param {object} leadData - Lead information
 * @returns {Promise} Created lead object
 */
export const createLead = (leadData) => {
    return axiosClient.post('/leads', leadData)
}

/**
 * Update an existing lead
 * @param {string} leadId - Lead ID
 * @param {object} leadData - Fields to update
 * @returns {Promise} Updated lead object
 */
export const updateLead = (leadId, leadData) => {
    return axiosClient.put(`/leads/${leadId}`, leadData)
}

/**
 * Delete a lead (soft delete)
 * @param {string} leadId - Lead ID
 * @returns {Promise} Deleted lead object
 */
export const deleteLead = (leadId) => {
    return axiosClient.delete(`/leads/${leadId}`)
}

/**
 * Search leads
 * @param {string} query - Search query
 * @param {number} page - Page number (optional)
 * @param {number} limit - Items per page (optional)
 * @returns {Promise} Search results
 */
export const searchLeads = (query, page = 1, limit = 10) => {
    const params = { q: query, page, limit }
    return axiosClient.get('/leads/search', { params })
}

/**
 * Advanced filter for leads
 * @param {object} filters - Filter criteria (status, source, priority, assignedTo, page, limit, etc.)
 * @returns {Promise} Filtered leads
 */
export const filterLeads = (filters = {}) => {
    return axiosClient.post('/leads/advanced-filter', filters)
}

/**
 * Get lead statistics
 * @param {object} params - Query parameters (status, source, assignedTo, etc.)
 * @returns {Promise} Statistics data
 */
export const getLeadStats = (params = {}) => {
    return axiosClient.get('/leads/stats', { params })
}

/**
 * Get advanced statistics with filters
 * @param {object} filters - Filter criteria
 * @returns {Promise} Advanced statistics
 */
export const getAdvancedStats = (filters = {}) => {
    return axiosClient.get('/leads/advanced-stats', { params: filters })
}

// ========================================
// LEAD ACTIONS
// ========================================

/**
 * Update lead status
 * @param {string} leadId - Lead ID
 * @param {string} status - New status
 * @returns {Promise} Updated lead
 */
export const updateLeadStatus = (leadId, status) => {
    return axiosClient.put(`/leads/${leadId}/status`, { status })
}

/**
 * Assign lead to an agent
 * @param {string} leadId - Lead ID
 * @param {string} agentId - Agent ID
 * @returns {Promise} Updated lead
 */
export const assignLead = (leadId, agentId) => {
    return axiosClient.put(`/leads/${leadId}/assign`, { agentId })
}

/**
 * Convert lead to customer
 * @param {string} leadId - Lead ID
 * @param {number} value - Deal value
 * @returns {Promise} Converted lead
 */
export const convertLead = (leadId, value) => {
    return axiosClient.post(`/leads/${leadId}/convert`, { value })
}

// ========================================
// ACTIVITY ENDPOINTS
// ========================================

/**
 * Get activity statistics
 * @param {object} params - Query parameters
 * @returns {Promise} Activity stats
 */
export const getActivityStats = (params = {}) => {
    return axiosClient.get('/activities/stats', { params })
}

/**
 * Get activities for a lead
 * @param {string} leadId - Lead ID
 * @param {number} page - Page number
 * @param {number} limit - Items per page
 * @returns {Promise} Activities
 */
export const getLeadActivities = (leadId, page = 1, limit = 10) => {
    const params = { leadId, page, limit }
    return axiosClient.get('/activities', { params })
}

// ========================================
// USER/AGENT ENDPOINTS
// ========================================

/**
 * Get all users/agents
 * @returns {Promise} Users list
 */
export const getUsers = () => {
    return axiosClient.get('/employees')
}

/**
 * Get single user
 * @param {string} userId - User ID
 * @returns {Promise} User object
 */
export const getUser = (userId) => {
    return axiosClient.get(`/employees/${userId}`)
}

// ========================================
// HEALTH CHECK
// ========================================

/**
 * Check API health
 * @returns {Promise} Health status
 */
export const checkHealth = () => {
    return axiosClient.get('/health')
}

/**
 * Get API status
 * @returns {Promise} API status info
 */
export const getAPIStatus = () => {
    return axiosClient.get('/status')
}

export default {
    // Lead CRUD
    getLeads,
    getLeadById,
    createLead,
    updateLead,
    deleteLead,

    // Lead actions
    searchLeads,
    filterLeads,
    getLeadStats,
    getAdvancedStats,
    updateLeadStatus,
    assignLead,
    convertLead,

    // Activities
    getActivityStats,
    getLeadActivities,

    // Users
    getUsers,
    getUser,

    // Health
    checkHealth,
    getAPIStatus
}