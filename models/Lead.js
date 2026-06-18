/**
 * Lead Schema
 * Core collection for lead management
 */

const mongoose = require('mongoose');

const leadSchema = new mongoose.Schema({
    // Personal Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters'],
        index: true
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters'],
        index: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
        index: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        unique: true,
        match: [/^[\d\s\-\+\(\)]{10,}$/, 'Please provide a valid phone number'],
        index: true
    },
    alternatePhone: {
        type: String,
        match: [/^[\d\s\-\+\(\)]{10,}$/, 'Please provide a valid phone number']
    },

    // Lead Details
    status: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeadStatus',
        required: [true, 'Lead status is required'],
        index: true
    },
    source: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeadSource',
        required: [true, 'Lead source is required'],
        index: true
    },
    priority: {
        type: String,
        enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
        default: 'MEDIUM',
        index: true
    },

    // Assignment Information
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        index: true
    },
    assignedAt: Date,

    // Property Preferences
    propertyType: [{
        type: String,
        enum: ['Apartment', 'House', 'Commercial', 'Plot'],
        trim: true
    }],
    budgetMin: {
        type: Number,
        min: [0, 'Minimum budget cannot be negative']
    },
    budgetMax: {
        type: Number,
        min: [0, 'Maximum budget cannot be negative']
    },
    location: [{
        type: String,
        trim: true,
        maxlength: [100, 'Location cannot exceed 100 characters']
    }],
    areaPreference: [{
        type: String,
        trim: true,
        maxlength: [100, 'Area preference cannot exceed 100 characters']
    }],

    // Communication Preferences
    preferredContactMethod: {
        type: String,
        enum: ['CALL', 'EMAIL', 'SMS', 'WHATSAPP'],
        default: 'CALL'
    },
    communicationOptIn: {
        type: Boolean,
        default: true
    },

    // Additional Information
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        index: true
    },
    notes: {
        type: String,
        maxlength: [1000, 'Notes cannot exceed 1000 characters']
    },
    tags: [{
        type: String,
        trim: true,
        maxlength: [50, 'Tag cannot exceed 50 characters']
    }],

    // Audit Fields
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },

    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: Date,

    // Conversion Tracking
    conversionStatus: {
        type: String,
        enum: ['NEW', 'CONTACTED', 'CONVERTED', 'LOST', 'INACTIVE'],
        default: 'NEW'
    },
    convertedAt: Date,
    convertedValue: {
        type: Number,
        min: [0, 'Converted value cannot be negative']
    }
}, {
    timestamps: true,
    collection: 'leads'
});

// Compound Indexes for common queries
leadSchema.index({ status: 1, isDeleted: 1 });
leadSchema.index({ assignedTo: 1, isDeleted: 1 });
leadSchema.index({ source: 1, isDeleted: 1 });
leadSchema.index({ createdAt: -1, isDeleted: 1 });
leadSchema.index({ priority: 1, isDeleted: 1 });
leadSchema.index({ status: 1, assignedTo: 1, createdAt: -1, isDeleted: 1 });

// Text Search Index
leadSchema.index({
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phone: 'text'
});

// Virtual for full name
leadSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Pre-save middleware for validation
leadSchema.pre('save', function(next) {
    // Validate budget range
    if (this.budgetMin && this.budgetMax && this.budgetMin > this.budgetMax) {
        throw new Error('Minimum budget cannot be greater than maximum budget');
    }
    next();
});

// Method to mark as deleted (soft delete)
leadSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

// Method to restore deleted lead
leadSchema.methods.restore = function() {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
};

// Static method to find active leads
leadSchema.statics.findActive = function(filter = {}) {
    return this.find({...filter, isDeleted: false });
};

// Static method to search leads by text
leadSchema.statics.searchLeads = function(searchTerm) {
    return this.find({ $text: { $search: searchTerm }, isDeleted: false }, { score: { $meta: 'textScore' } }).sort({ score: { $meta: 'textScore' } });
};

module.exports = mongoose.model('Lead', leadSchema);