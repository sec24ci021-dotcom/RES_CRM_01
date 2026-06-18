/**
 * Lead Activity Schema
 * Tracks all activities related to leads
 */

const mongoose = require('mongoose');

const leadActivitySchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: [true, 'Lead is required'],
        index: true
    },
    activityType: {
        type: String,
        enum: ['CALL', 'EMAIL', 'MEETING', 'SITE_VISIT', 'PROPOSAL', 'FOLLOW_UP', 'NOTE', 'STATUS_CHANGE'],
        required: [true, 'Activity type is required']
    },
    title: {
        type: String,
        required: [true, 'Activity title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [2000, 'Description cannot exceed 2000 characters']
    },

    // Activity Details
    scheduledDate: Date,
    completedDate: Date,
    status: {
        type: String,
        enum: ['SCHEDULED', 'COMPLETED', 'MISSED', 'CANCELLED'],
        default: 'SCHEDULED'
    },

    // Communication Details
    outcome: {
        type: String,
        trim: true,
        maxlength: [500, 'Outcome cannot exceed 500 characters']
    },
    nextSteps: {
        type: String,
        maxlength: [500, 'Next steps cannot exceed 500 characters']
    },

    // Related Information
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Creator information is required']
    },
    relatedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeadAssignment'
    },

    // Metadata
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH'],
        default: 'MEDIUM'
    },
    attachments: [{
        fileName: {
            type: String,
            trim: true
        },
        fileUrl: {
            type: String,
            trim: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, {
    timestamps: true,
    collection: 'lead_activities'
});

// Indexes
leadActivitySchema.index({ lead: 1, createdAt: -1 });
leadActivitySchema.index({ createdBy: 1, createdAt: -1 });
leadActivitySchema.index({ scheduledDate: 1 });
leadActivitySchema.index({ status: 1, lead: 1 });

// Method to mark activity as completed
leadActivitySchema.methods.complete = function(outcome = '', nextSteps = '') {
    this.status = 'COMPLETED';
    this.completedDate = new Date();
    if (outcome) this.outcome = outcome;
    if (nextSteps) this.nextSteps = nextSteps;
    return this.save();
};

// Static method to get recent activities for a lead
leadActivitySchema.statics.getRecentActivities = function(leadId, limit = 10) {
    return this.find({ lead: leadId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('createdBy', 'firstName lastName email');
};

module.exports = mongoose.model('LeadActivity', leadActivitySchema);