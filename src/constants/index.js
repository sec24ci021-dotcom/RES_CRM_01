/**
 * Application Constants
 * Centralized constants for the entire application
 */

// =====================================================
// HTTP STATUS CODES
// =====================================================
const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    ACCEPTED: 202,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    SERVICE_UNAVAILABLE: 503
};

// =====================================================
// LEAD STATUS
// =====================================================
const LEAD_STATUS = {
    NEW: 'NEW_LEAD',
    ATTEMPTED_CALL: 'ATTEMPTED_CALL',
    CONTACTED: 'CONTACTED',
    CONNECTED: 'CONNECTED',
    INTERESTED: 'INTERESTED',
    SITE_VISIT_SCHEDULED: 'SITE_VISIT_SCHEDULED',
    SITE_VISIT_COMPLETED: 'SITE_VISIT_COMPLETED',
    QUALIFIED: 'QUALIFIED',
    IN_NEGOTIATION: 'IN_NEGOTIATION',
    BOOKED: 'BOOKED',
    CONVERTED: 'CONVERTED',
    SOLD: 'SOLD',
    LOST: 'LOST',
    INACTIVE: 'INACTIVE'
};

// Backwards-compatible aliases (some modules expect LEAD_STATUS.NEW_LEAD etc.)
LEAD_STATUS.NEW_LEAD = LEAD_STATUS.NEW;
LEAD_STATUS.ATTEMPTED_CALL = LEAD_STATUS.ATTEMPTED_CALL;
LEAD_STATUS.CONTACTED = LEAD_STATUS.CONTACTED;
LEAD_STATUS.CONNECTED = LEAD_STATUS.CONNECTED;
LEAD_STATUS.INTERESTED = LEAD_STATUS.INTERESTED;
LEAD_STATUS.SITE_VISIT_SCHEDULED = LEAD_STATUS.SITE_VISIT_SCHEDULED;
LEAD_STATUS.SITE_VISIT_COMPLETED = LEAD_STATUS.SITE_VISIT_COMPLETED;
LEAD_STATUS.QUALIFIED = LEAD_STATUS.QUALIFIED;
LEAD_STATUS.IN_NEGOTIATION = LEAD_STATUS.IN_NEGOTIATION;
LEAD_STATUS.BOOKED = LEAD_STATUS.BOOKED;
LEAD_STATUS.CONVERTED = LEAD_STATUS.CONVERTED;
LEAD_STATUS.SOLD = LEAD_STATUS.SOLD;
LEAD_STATUS.LOST = LEAD_STATUS.LOST;
LEAD_STATUS.INACTIVE = LEAD_STATUS.INACTIVE;

const LEAD_STATUS_CODES = {
    'NEW_LEAD': 'new',
    'ATTEMPTED_CALL': 'attempted_call',
    'CONTACTED': 'contacted',
    'CONNECTED': 'connected',
    'INTERESTED': 'interested',
    'SITE_VISIT_SCHEDULED': 'site_visit_scheduled',
    'SITE_VISIT_COMPLETED': 'site_visit_completed',
    'QUALIFIED': 'qualified',
    'IN_NEGOTIATION': 'in_negotiation',
    'BOOKED': 'booked',
    'CONVERTED': 'converted',
    'SOLD': 'sold',
    'LOST': 'lost',
    'INACTIVE': 'inactive'
};

// =====================================================
// LEAD STAGES
// =====================================================
const LEAD_STAGE = {
    DISCOVERY: 'DISCOVERY',
    QUALIFICATION: 'QUALIFICATION',
    NEGOTIATION: 'NEGOTIATION',
    CLOSURE: 'CLOSURE',
    POST_SALE: 'POST_SALE'
};

// =====================================================
// LEAD SOURCES
// =====================================================
const LEAD_SOURCE = {
    WEBSITE: 'WEBSITE',
    FACEBOOK: 'FACEBOOK',
    GOOGLE_ADS: 'GOOGLE_ADS',
    REFERRAL: 'REFERRAL',
    WALK_IN: 'WALK_IN',
    CALL: 'CALL',
    EMAIL: 'EMAIL'
};

// =====================================================
// LEAD PRIORITY
// =====================================================
const LEAD_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
};

// =====================================================
// EMPLOYEE ROLES
// =====================================================
const EMPLOYEE_ROLE = {
    JUNIOR_AGENT: 'JUNIOR_AGENT',
    SENIOR_AGENT: 'SENIOR_AGENT',
    MANAGER: 'MANAGER',
    DIRECTOR: 'DIRECTOR',
    ADMIN: 'ADMIN'
};

// =====================================================
// ACTIVITY TYPES
// =====================================================
const ACTIVITY_TYPE = {
    CALL: 'CALL',
    EMAIL: 'EMAIL',
    MEETING: 'MEETING',
    SITE_VISIT: 'SITE_VISIT',
    PROPOSAL: 'PROPOSAL',
    FOLLOW_UP: 'FOLLOW_UP',
    NOTE: 'NOTE',
    STATUS_CHANGE: 'STATUS_CHANGE',
    LEAD_CREATED: 'LEAD_CREATED',
    LEAD_UPDATED: 'LEAD_UPDATED',
    LEAD_DELETED: 'LEAD_DELETED',
    LEAD_ASSIGNED: 'LEAD_ASSIGNED',
    LEAD_CONVERTED: 'LEAD_CONVERTED',
    LEAD_REOPENED: 'LEAD_REOPENED',
    NOTE_ADDED: 'NOTE_ADDED',
    CONTACT_ATTEMPTED: 'CONTACT_ATTEMPTED'
};

// =====================================================
// ACTIVITY STATUS
// =====================================================
const ACTIVITY_STATUS = {
    SCHEDULED: 'SCHEDULED',
    COMPLETED: 'COMPLETED',
    MISSED: 'MISSED',
    CANCELLED: 'CANCELLED'
};

// =====================================================
// FOLLOW-UP STATUS
// =====================================================
const FOLLOW_UP_STATUS = {
    PENDING: 'PENDING',
    COMPLETED: 'COMPLETED',
    RESCHEDULED: 'RESCHEDULED',
    CANCELLED: 'CANCELLED',
    MISSED: 'MISSED'
};

// =====================================================
// ASSIGNMENT STATUS
// =====================================================
const ASSIGNMENT_STATUS = {
    ACTIVE: 'ACTIVE',
    COMPLETED: 'COMPLETED',
    TRANSFERRED: 'TRANSFERRED',
    REASSIGNED: 'REASSIGNED'
};

// =====================================================
// ERROR CODES
// =====================================================
const ERROR_CODES = {
    INVALID_REQUEST: 'INVALID_REQUEST',
    UNAUTHORIZED: 'UNAUTHORIZED',
    FORBIDDEN: 'FORBIDDEN',
    RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
    DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    DATABASE_ERROR: 'DATABASE_ERROR',
    INTERNAL_ERROR: 'INTERNAL_ERROR'
};

// =====================================================
// PAGINATION LIMITS
// =====================================================
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 10,
    MAX_LIMIT: 100
};

// =====================================================
// CACHE KEYS
// =====================================================
const CACHE_KEYS = {
    LEADS: 'leads',
    LEAD_STATUS: 'lead_status',
    EMPLOYEES: 'employees',
    LEAD_SOURCES: 'lead_sources'
};

// =====================================================
// CACHE DURATION (in seconds)
// =====================================================
const CACHE_DURATION = {
    SHORT: 300, // 5 minutes
    MEDIUM: 900, // 15 minutes
    LONG: 3600, // 1 hour
    VERY_LONG: 86400 // 24 hours
};

module.exports = {
    HTTP_STATUS,
    LEAD_STATUS,
    LEAD_STATUS_CODES,
    LEAD_STAGE,
    LEAD_SOURCE,
    LEAD_PRIORITY,
    EMPLOYEE_ROLE,
    ACTIVITY_TYPE,
    ACTIVITY_STATUS,
    FOLLOW_UP_STATUS,
    ASSIGNMENT_STATUS,
    ERROR_CODES,
    PAGINATION,
    CACHE_KEYS,
    CACHE_DURATION
};