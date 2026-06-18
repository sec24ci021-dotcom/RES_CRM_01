/**
 * Lead FollowUp Schema
 * Tracks scheduled follow-ups for leads
 */

const mongoose = require('mongoose');

const leadFollowUpSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: [true, 'Lead is required'],
        index: true
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Assigned to employee is required'],
        index: true
    },

    // Follow-up Details
    scheduledDate: {
        type: Date,
        required: [true, 'Scheduled date is required'],
        index: true
    },
    title: {
        type: String,
        required: [true, 'Follow-up title is required'],
        trim: true,
        maxlength: [200, 'Title cannot exceed 200 characters']
    },
    description: {
        type: String,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },

    // Status Tracking
    status: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'RESCHEDULED', 'CANCELLED', 'MISSED'],
        default: 'PENDING'
    },
    completedDate: Date,
    completedNotes: {
        type: String,
        maxlength: [500, 'Completed notes cannot exceed 500 characters']
    },

    // Reminders
    reminderSet: {
        type: Boolean,
        default: false
    },
    reminderTime: {
        type: Number,
        min: [5, 'Reminder time must be at least 5 minutes before'],
        max: [10080, 'Reminder time cannot exceed 7 days (10080 minutes)'],
        default: 30 // Default 30 minutes before
    },

    // Created By
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Creator information is required']
    }
}, {
    timestamps: true,
    collection: 'lead_followups'
});

// Indexes
leadFollowUpSchema.index({ lead: 1, scheduledDate: -1 });
leadFollowUpSchema.index({ assignedTo: 1, status: 1, scheduledDate: 1 });
leadFollowUpSchema.index({ scheduledDate: 1, status: 1 });

// Pre-save middleware for validation
leadFollowUpSchema.pre('save', function(next) {
    // Validate that scheduled date is in the future for new follow-ups
    if (this.isNew && this.scheduledDate <= new Date()) {
        throw new Error('Scheduled date must be in the future');
    }
    next();
});

// Method to mark as completed
leadFollowUpSchema.methods.complete = function(notes = '') {
    this.status = 'COMPLETED';
    this.completedDate = new Date();
    if (notes) this.completedNotes = notes;
    return this.save();
};

// Method to reschedule
leadFollowUpSchema.methods.reschedule = function(newDate) {
    if (newDate <= new Date()) {
        throw new Error('New scheduled date must be in the future');
    }
    this.status = 'RESCHEDULED';
    this.scheduledDate = newDate;
    return this.save();
};

// Method to cancel
leadFollowUpSchema.methods.cancel = function() {
    this.status = 'CANCELLED';
    return this.save();
};

// Static method to get pending follow-ups
leadFollowUpSchema.statics.getPendingFollowUps = function(employeeId) {
    return this.find({
            assignedTo: employeeId,
            status: 'PENDING',
            scheduledDate: { $lte: new Date(Date.now() + 24 * 60 * 60 * 1000) } // Next 24 hours
        }).sort({ scheduledDate: 1 })
        .populate('lead', 'firstName lastName email phone');
};

// Static method to get overdue follow-ups
leadFollowUpSchema.statics.getOverdueFollowUps = function(employeeId) {
    return this.find({
            assignedTo: employeeId,
            status: 'PENDING',
            scheduledDate: { $lt: new Date() }
        }).sort({ scheduledDate: 1 })
        .populate('lead', 'firstName lastName email phone');
};

module.exports = mongoose.model('LeadFollowUp', leadFollowUpSchema);