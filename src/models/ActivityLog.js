/**
 * Activity Log Model
 * Tracks all activities/interactions related to leads
 */

const mongoose = require('mongoose');
const { ACTIVITY_TYPE } = require('../constants');

const activityLogSchema = new mongoose.Schema({
    // Reference Information
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: [true, 'Lead reference is required'],
        index: true
    },
    employee: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: false,
        index: true
    },

    // Activity Details
    type: {
        type: String,
        enum: Object.values(ACTIVITY_TYPE),
        required: [true, 'Activity type is required'],
        index: true
    },
    subject: {
        type: String,
        required: [true, 'Subject is required'],
        trim: true,
        maxlength: [200, 'Subject must not exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [2000, 'Description must not exceed 2000 characters']
    },
    severity: {
        type: String,
        enum: ['INFO', 'WARNING', 'CRITICAL'],
        default: 'INFO',
        index: true
    },
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
    changeDetails: {
        field: String,
        oldValue: mongoose.Schema.Types.Mixed,
        newValue: mongoose.Schema.Types.Mixed,
        changeType: {
            type: String,
            enum: ['CREATED', 'UPDATED', 'DELETED', 'ASSIGNED', 'STATUS', 'CONVERTED', 'OTHER'],
            default: 'OTHER'
        }
    },
    relatedRecords: [{
        entityType: String,
        entityId: mongoose.Schema.Types.ObjectId,
        entityName: String
    }],

    // Activity Metadata
    metadata: {
        duration: Number, // in minutes for calls/meetings
        location: String, // for site visits/meetings
        attendees: [String], // for meetings
        outcome: {
            type: String,
            enum: ['Successful', 'Unsuccessful', 'Rescheduled', 'Cancelled'],
            default: 'Successful'
        },
        nextFollowUp: Date,
        callRecording: String, // URL or file path
        attachments: [{
            name: String,
            url: String,
            type: String,
            uploadedAt: { type: Date, default: Date.now }
        }],
        ipAddress: String,
        userAgent: String,
        deviceInfo: String,
        source: {
            type: String,
            enum: ['API', 'MANUAL', 'AUTOMATION', 'IMPORT', 'SYSTEM'],
            default: 'API'
        }
    },

    // Interaction Details
    contactMethod: {
        type: String,
        enum: ['Phone', 'Email', 'In-Person', 'Video Call', 'WhatsApp', 'SMS', 'Other'],
        default: 'Phone'
    },
    direction: {
        type: String,
        enum: ['Inbound', 'Outbound'],
        default: 'Outbound'
    },
    status: {
        type: String,
        enum: ['Completed', 'Scheduled', 'Pending', 'Cancelled'],
        default: 'Completed',
        index: true
    },

    // Notes & Comments
    notes: {
        type: String,
        maxlength: [1000, 'Notes must not exceed 1000 characters']
    },
    internalNotes: {
        type: String,
        maxlength: [1000, 'Internal notes must not exceed 1000 characters']
    },
    tags: [String],

    // Lead Status Updates
    leadStatusBefore: String,
    leadStatusAfter: String,
    leadPriorityBefore: String,
    leadPriorityAfter: String,

    // Engagement Metrics
    sentiment: {
        type: String,
        enum: ['Positive', 'Neutral', 'Negative'],
        default: 'Neutral'
    },
    engagementScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 50
    },

    // Scheduling
    scheduledFor: Date,
    actualDate: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number, // in minutes
        min: 0
    },

    // Follow-up Tracking
    requiresFollowUp: {
        type: Boolean,
        default: false
    },
    followUpDate: Date,
    followUpType: {
        type: String,
        enum: ['Call', 'Email', 'Meeting', 'Site Visit', 'Other']
    },

    // Approval & Visibility
    isPublic: {
        type: Boolean,
        default: true
    },
    approvalStatus: {
        type: String,
        enum: ['Pending', 'Approved', 'Rejected'],
        default: 'Approved'
    },
    approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },

    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    }
}, {
    timestamps: true,
    collection: 'activitylogs'
});

// =====================================================
// INDEXES
// =====================================================
activityLogSchema.index({ lead: 1, createdAt: -1 });
activityLogSchema.index({ employee: 1, type: 1 });
activityLogSchema.index({ type: 1, status: 1 });
activityLogSchema.index({ actualDate: -1 });
activityLogSchema.index({ followUpDate: 1 });

// Compound index for activity filtering
activityLogSchema.index({ lead: 1, type: 1, status: 1 });

// Text search index
activityLogSchema.index({
    subject: 'text',
    description: 'text',
    notes: 'text'
});

// =====================================================
// VIRTUAL PROPERTIES
// =====================================================
activityLogSchema.virtual('isPending').get(function() {
    return this.status === 'Pending';
});

activityLogSchema.virtual('isCompleted').get(function() {
    return this.status === 'Completed';
});

activityLogSchema.virtual('isOverdue').get(function() {
    return this.scheduledFor < new Date() && this.status === 'Pending';
});

// =====================================================
// INSTANCE METHODS
// =====================================================
/**
 * Mark activity as completed
 */
activityLogSchema.methods.markCompleted = function(leadStatusAfter, sentimentScore = null) {
    this.status = 'Completed';
    this.actualDate = new Date();
    if (leadStatusAfter) {
        this.leadStatusAfter = leadStatusAfter;
    }
    if (sentimentScore !== null) {
        this.sentiment = sentimentScore > 0.6 ? 'Positive' : (sentimentScore < 0.4 ? 'Negative' : 'Neutral');
        this.engagementScore = Math.round(sentimentScore * 100);
    }
    return this.save();
};

/**
 * Schedule follow-up
 */
activityLogSchema.methods.scheduleFollowUp = function(followUpDate, followUpType = 'Call') {
    this.requiresFollowUp = true;
    this.followUpDate = followUpDate;
    this.followUpType = followUpType;
    return this.save();
};

/**
 * Add attachment
 */
activityLogSchema.methods.addAttachment = function(name, url, type = 'document') {
    if (!this.metadata) {
        this.metadata = {};
    }
    if (!this.metadata.attachments) {
        this.metadata.attachments = [];
    }
    this.metadata.attachments.push({
        name,
        url,
        type,
        uploadedAt: new Date()
    });
    return this.save();
};

/**
 * Mark as deleted
 */
activityLogSchema.methods.softDelete = function() {
    this.isDeleted = true;
    return this.save();
};

// =====================================================
// STATIC METHODS
// =====================================================
/**
 * Find activities by lead
 */
activityLogSchema.statics.findByLead = function(leadId, options = {}) {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    return this.find({ lead: leadId, isDeleted: false })
        .sort({ actualDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('employee', 'firstName lastName email');
};

/**
 * Find activities by employee
 */
activityLogSchema.statics.findByEmployee = function(employeeId, options = {}) {
    const { limit = 10, page = 1, type = null } = options;
    const skip = (page - 1) * limit;
    const query = { employee: employeeId, isDeleted: false };
    if (type) query.type = type;
    return this.find(query)
        .sort({ actualDate: -1 })
        .skip(skip)
        .limit(limit)
        .populate('lead', 'firstName lastName email');
};

/**
 * Find pending activities
 */
activityLogSchema.statics.findPending = function(options = {}) {
    const { limit = 10, page = 1 } = options;
    const skip = (page - 1) * limit;
    return this.find({ status: 'Pending', isDeleted: false })
        .sort({ scheduledFor: 1 })
        .skip(skip)
        .limit(limit)
        .populate('lead', 'firstName lastName')
        .populate('employee', 'firstName lastName');
};

/**
 * Find overdue activities
 */
activityLogSchema.statics.findOverdue = function() {
    return this.find({
            status: 'Pending',
            scheduledFor: { $lt: new Date() },
            isDeleted: false
        })
        .sort({ scheduledFor: 1 })
        .populate('lead', 'firstName lastName')
        .populate('employee', 'firstName lastName');
};

/**
 * Get activity summary for lead
 */
activityLogSchema.statics.getLeadActivitySummary = async function(leadId) {
    return this.aggregate([
        { $match: { lead: mongoose.Types.ObjectId(leadId), isDeleted: false } },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                lastActivity: { $max: '$actualDate' }
            }
        },
        { $sort: { count: -1 } }
    ]);
};

/**
 * Get employee activity stats
 */
activityLogSchema.statics.getEmployeeStats = async function(employeeId, startDate, endDate) {
    return this.aggregate([{
            $match: {
                employee: mongoose.Types.ObjectId(employeeId),
                actualDate: { $gte: startDate, $lte: endDate },
                isDeleted: false
            }
        },
        {
            $group: {
                _id: '$type',
                count: { $sum: 1 },
                avgEngagement: { $avg: '$engagementScore' },
                avgSentiment: {
                    $avg: {
                        $cond: [{ $eq: ['$sentiment', 'Positive'] }, 1, { $cond: [{ $eq: ['$sentiment', 'Negative'] }, -1, 0] }]
                    }
                }
            }
        }
    ]);
};

// =====================================================
// MIDDLEWARE (HOOKS)
// =====================================================
/**
 * Exclude deleted activities from queries by default
 */
activityLogSchema.pre(/^find/, function(next) {
    if (!this.getOptions()._recursed) {
        this.where({ isDeleted: false });
    }
    next();
});

module.exports = mongoose.model('ActivityLog', activityLogSchema);