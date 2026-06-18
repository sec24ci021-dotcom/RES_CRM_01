/**
 * Activity Sample Data Seed
 * Generates sample activity records for testing
 */

const mongoose = require('mongoose');
const Activity = require('../models/Activity');
const logger = require('../utils/logger');

const ACTIVITY_TYPES = [
    'LEAD_CREATED',
    'LEAD_UPDATED',
    'LEAD_ASSIGNED',
    'STATUS_CHANGED',
    'LEAD_CONVERTED',
    'CONTACT_ATTEMPTED',
    'NOTE_ADDED'
];

const STATUSES = [
    'NEW_LEAD',
    'CONTACTED',
    'QUALIFIED',
    'IN_NEGOTIATION',
    'CONVERTED',
    'LOST',
    'INACTIVE'
];

const SOURCES = [
    'WEBSITE',
    'FACEBOOK',
    'GOOGLE_ADS',
    'REFERRAL',
    'WALK_IN',
    'CALL',
    'EMAIL'
];

const SEVERITIES = ['INFO', 'WARNING', 'CRITICAL'];

/**
 * Generate sample activities
 */
async function seedActivities() {
    try {
        logger.info('🌱 Starting activity seed...');

        // Get sample lead and user IDs (create dummy ones if needed)
        const sampleLeadId = new mongoose.Types.ObjectId();
        const sampleUserId = new mongoose.Types.ObjectId();
        const sampleAgentId = new mongoose.Types.ObjectId();

        const activities = [];

        // Generate 50 sample activities
        for (let i = 0; i < 50; i++) {
            const activityType = ACTIVITY_TYPES[Math.floor(Math.random() * ACTIVITY_TYPES.length)];
            const createdDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);

            const activity = {
                activityType,
                leadId: sampleLeadId,
                userId: Math.random() > 0.3 ? sampleUserId : null,
                leadSnapshot: {
                    firstName: ['John', 'Jane', 'Michael', 'Sarah', 'David'][Math.floor(Math.random() * 5)],
                    lastName: ['Doe', 'Smith', 'Johnson', 'Brown', 'Wilson'][Math.floor(Math.random() * 5)],
                    email: `lead${i}@example.com`,
                    phone: `+1415555${String(i).padStart(4, '0')}`,
                    status: STATUSES[Math.floor(Math.random() * STATUSES.length)],
                    priority: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)],
                    source: SOURCES[Math.floor(Math.random() * SOURCES.length)],
                    assignedTo: Math.random() > 0.3 ? sampleAgentId : null
                },
                description: generateDescription(activityType),
                severity: SEVERITIES[Math.floor(Math.random() * SEVERITIES.length)],
                metadata: {
                    ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
                    userAgent: 'Mozilla/5.0',
                    source: ['API', 'MANUAL', 'AUTOMATION'][Math.floor(Math.random() * 3)]
                },
                createdAt: createdDate,
                updatedAt: createdDate
            };

            // Add change details based on activity type
            if (activityType === 'LEAD_UPDATED') {
                activity.changeDetails = {
                    field: ['status', 'priority', 'phone'][Math.floor(Math.random() * 3)],
                    oldValue: STATUSES[0],
                    newValue: STATUSES[Math.floor(Math.random() * STATUSES.length)],
                    changeType: 'UPDATED'
                };
            } else if (activityType === 'STATUS_CHANGED') {
                const oldStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
                const newStatus = STATUSES[Math.floor(Math.random() * STATUSES.length)];
                activity.changeDetails = {
                    field: 'status',
                    oldValue: oldStatus,
                    newValue: newStatus,
                    changeType: 'STATUS'
                };
            } else if (activityType === 'LEAD_ASSIGNED') {
                activity.changeDetails = {
                    field: 'assignedTo',
                    oldValue: 'Unassigned',
                    newValue: sampleAgentId,
                    changeType: 'ASSIGNED'
                };
            } else if (activityType === 'LEAD_CREATED') {
                activity.changeDetails = {
                    field: 'lead',
                    newValue: `${activity.leadSnapshot.firstName} ${activity.leadSnapshot.lastName}`,
                    changeType: 'CREATED'
                };
            }

            activities.push(activity);
        }

        // Insert activities
        const result = await Activity.insertMany(activities);
        logger.info(`✅ Successfully seeded ${result.length} activities`);
        return result;
    } catch (error) {
        logger.error('❌ Error seeding activities:', error);
        throw error;
    }
}

/**
 * Generate description based on activity type
 */
function generateDescription(activityType) {
    const descriptions = {
        LEAD_CREATED: [
            'Lead created via website form',
            'Lead created via API',
            'Lead imported from campaign',
            'Lead created manually'
        ],
        LEAD_UPDATED: [
            'Lead information updated - contact details changed',
            'Lead updated - budget range modified',
            'Lead details updated - location changed',
            'Lead updated - notes added'
        ],
        LEAD_ASSIGNED: [
            'Lead assigned to sales agent',
            'Lead reassigned to new agent',
            'Lead assigned based on load balancing',
            'Lead reassigned by manager'
        ],
        STATUS_CHANGED: [
            'Lead status changed to qualified',
            'Lead status changed to in negotiation',
            'Lead status changed to contacted',
            'Lead status changed to converted'
        ],
        LEAD_CONVERTED: [
            'Lead successfully converted to customer',
            'Lead conversion completed - deal value recorded',
            'Customer acquired from lead conversion'
        ],
        CONTACT_ATTEMPTED: [
            'Contact attempt - phone call',
            'Contact attempt - email sent',
            'Contact attempt - follow-up scheduled',
            'Contact attempt - unsuccessful'
        ],
        NOTE_ADDED: [
            'Sales note added to lead record',
            'Internal note - follow-up required',
            'Note added - client preferences recorded'
        ]
    };

    const typeDescriptions = descriptions[activityType] || ['Activity recorded'];
    return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
}

/**
 * Clear existing activities
 */
async function clearActivities() {
    try {
        const result = await Activity.deleteMany({});
        logger.info(`✅ Cleared ${result.deletedCount} existing activities`);
        return result;
    } catch (error) {
        logger.error('❌ Error clearing activities:', error);
        throw error;
    }
}

/**
 * Main seed function
 */
async function runSeed(options = {}) {
    try {
        const { clear = true } = options;

        if (clear) {
            await clearActivities();
        }

        await seedActivities();
        logger.info('✅ Activity seed completed successfully');
    } catch (error) {
        logger.error('❌ Activity seed failed:', error);
        process.exit(1);
    }
}

module.exports = {
    seedActivities,
    clearActivities,
    runSeed
};