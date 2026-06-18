/**
 * Activity Model
 * Tracks all lead-related activities for audit trail and analytics
 */

const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    // Activity type enum
    activityType: {
        type: String,
        enum: [
            'LEAD_CREATED',
            'LEAD_UPDATED',
            'LEAD_DELETED',
            'LEAD_ASSIGNED',
            'STATUS_CHANGED',
            'LEAD_CONVERTED',
            'LEAD_REOPENED',
            'NOTE_ADDED',
            'CONTACT_ATTEMPTED'
        ],
        required: true,
        index: true
    },

    // Reference to the lead
    leadId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: true,
        index: true
    },

    // User who performed the action
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },

    // Lead information snapshot
    leadSnapshot: {
        firstName: String,
        lastName: String,
        email: String,
        phone: String,
        status: String,
        priority: String,
        source: String,
        assignedTo: mongoose.Schema.Types.ObjectId
    },

    // What changed
    changeDetails: {
        field: String, // Field that changed
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changeType: {
            type: String,
            enum: ['CREATED', 'UPDATED', 'DELETED', 'ASSIGNED', 'STATUS', 'CONVERTED', 'OTHER'],
            default: 'OTHER'
        }
    },

    // Description of the activity
    description: {
        type: String,
        required: true
    },

    // Additional metadata
    metadata: {
        ipAddress: String,
        userAgent: String,
        deviceInfo: String,
        source: {
            type: String,
            enum: ['API', 'MANUAL', 'AUTOMATION', 'IMPORT', 'SYSTEM'],
            default: 'API'
        }
    },

    // Severity level
    severity: {
        type: String,
        enum: ['INFO', 'WARNING', 'CRITICAL'],
        default: 'INFO'
    },

    // Related entities
    relatedRecords: [{
        entityType: String, // 'Lead', 'Agent', 'Campaign', etc.
        entityId: mongoose.Schema.Types.ObjectId,
        entityName: String
    }],

    // Status of activity logging
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'FAILED'],
        default: 'COMPLETED'
    },

    // Error info if failed
    errorInfo: {
        code: String,
        message: String,
        stackTrace: String
    }
}, {
    timestamps: true,
    collection: 'activities'
});

// Indexes for performance
activitySchema.index({ leadId: 1, createdAt: -1 });
activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ activityType: 1, createdAt: -1 });
activitySchema.index({ createdAt: -1 });
activitySchema.index({ 'metadata.source': 1 });

// Virtual for activity summary
activitySchema.virtual('summary').get(function() {
    return `${this.activityType} - ${this.description}`;
});

// Methods
activitySchema.methods.toJSON = function() {
    const obj = this.toObject();
    obj.summary = this.summary;
    return obj;
};

// Static methods
activitySchema.statics.findByLeadId = function(leadId, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    return this.find({ leadId })
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email')
        .populate('leadId', 'firstName lastName email');
};

activitySchema.statics.findByUserId = function(userId, options = {}) {
    const { limit = 50, skip = 0, sort = { createdAt: -1 } } = options;
    return this.find({ userId })
        .sort(sort)
        .limit(limit)
        .skip(skip)
        .populate('leadId', 'firstName lastName email');
};

activitySchema.statics.findByDateRange = function(startDate, endDate, options = {}) {
    const { limit = 100, skip = 0 } = options;
    return this.find({
            createdAt: { $gte: startDate, $lte: endDate }
        })
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(skip)
        .populate('userId', 'name email')
        .populate('leadId', 'firstName lastName email');
};

activitySchema.statics.getLeadTimeline = function(leadId) {
    return this.find({ leadId })
        .sort({ createdAt: -1 })
        .populate('userId', 'name email role')
        .lean();
};

module.exports = mongoose.model('Activity', activitySchema);