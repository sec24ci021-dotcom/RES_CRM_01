/**
 * Lead Assignment Schema
 * Tracks lead assignments and reassignments
 */

const mongoose = require('mongoose');

const leadAssignmentSchema = new mongoose.Schema({
    lead: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Lead',
        required: [true, 'Lead is required'],
        index: true
    },
    assignedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Assigned by employee is required']
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: [true, 'Assigned to employee is required'],
        index: true
    },

    // Assignment Details
    assignmentDate: {
        type: Date,
        default: Date.now,
        required: true,
        index: true
    },
    reassignmentReason: {
        type: String,
        trim: true,
        maxlength: [500, 'Reason cannot exceed 500 characters']
    },

    // Performance Tracking
    followUpStatus: {
        type: String,
        enum: ['PENDING', 'COMPLETED', 'MISSED'],
        default: 'PENDING'
    },
    assignmentStatus: {
        type: String,
        enum: ['ACTIVE', 'COMPLETED', 'TRANSFERRED', 'REASSIGNED'],
        default: 'ACTIVE'
    },

    // Metadata
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    collection: 'lead_assignments'
});

// Indexes
leadAssignmentSchema.index({ lead: 1, assignmentDate: -1 });
leadAssignmentSchema.index({ assignedTo: 1, assignmentDate: -1 });
leadAssignmentSchema.index({ isActive: 1, assignedTo: 1 });
leadAssignmentSchema.index({ createdAt: -1 });

// Method to mark assignment as transferred
leadAssignmentSchema.methods.transfer = function(newAssignee, reason = '') {
    this.assignmentStatus = 'TRANSFERRED';
    this.reassignmentReason = reason;
    this.isActive = false;
    return this.save();
};

// Static method to get current assignment for a lead
leadAssignmentSchema.statics.getCurrentAssignment = function(leadId) {
    return this.findOne({
        lead: leadId,
        isActive: true,
        assignmentStatus: 'ACTIVE'
    }).populate('assignedTo', 'firstName lastName email');
};

// Static method to get assignment history
leadAssignmentSchema.statics.getAssignmentHistory = function(leadId) {
    return this.find({ lead: leadId })
        .sort({ assignmentDate: -1 })
        .populate('assignedBy', 'firstName lastName email')
        .populate('assignedTo', 'firstName lastName email');
};

module.exports = mongoose.model('LeadAssignment', leadAssignmentSchema);