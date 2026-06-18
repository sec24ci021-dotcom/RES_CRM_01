/**
 * Lead Model
 * Core model for lead information and status tracking
 */

const mongoose = require('mongoose');
const { LEAD_STATUS, LEAD_PRIORITY, LEAD_SOURCE } = require('../constants');

const leadSchema = new mongoose.Schema({
    // Contact Information
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        minlength: [2, 'First name must be at least 2 characters'],
        maxlength: [50, 'First name must not exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        minlength: [2, 'Last name must be at least 2 characters'],
        maxlength: [50, 'Last name must not exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
        index: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[0-9\s\-()]{10,}$/, 'Invalid phone format'],
        index: true
    },

    // Lead Classification
    status: {
        type: String,
        enum: Object.values(LEAD_STATUS),
        default: LEAD_STATUS.NEW,
        index: true
    },
    source: {
        type: String,
        enum: Object.values(LEAD_SOURCE),
        required: [true, 'Lead source is required'],
        index: true
    },
    priority: {
        type: String,
        enum: Object.values(LEAD_PRIORITY),
        default: LEAD_PRIORITY.MEDIUM,
        index: true
    },

    // Campaign & Property
    campaign: {
        type: String,
        trim: true,
        index: true
    },
    propertyId: {
        type: String,
        trim: true,
        index: true
    },

    // Assignment
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null,
        index: true
    },

    // Property Information
    propertyType: {
        type: String,
        enum: ['Residential', 'Commercial', 'Industrial', 'Agricultural'],
        default: 'Residential'
    },
    location: {
        address: String,
        city: String,
        state: String,
        zipCode: String,
        country: String,
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },

    // Budget Information
    budgetMin: {
        type: Number,
        min: 0,
        default: 0
    },
    budgetMax: {
        type: Number,
        min: 0,
        default: 0
    },

    // Conversion Tracking
    conversionStatus: {
        type: String,
        enum: ['In Progress', 'Converted', 'Abandoned'],
        default: 'In Progress',
        index: true
    },
    conversionValue: {
        type: Number,
        min: 0,
        default: 0
    },

    // Additional Information
    notes: {
        type: String,
        maxlength: 1000
    },
    tags: [String],
    customFields: mongoose.Schema.Types.Mixed,

    // Audit Trail
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee'
    },

    // Soft Delete
    isDeleted: {
        type: Boolean,
        default: false,
        index: true
    },
    deletedAt: Date
}, {
    timestamps: true,
    collection: 'leads'
});

// =====================================================
// INDEXES
// =====================================================
leadSchema.index({ email: 1, phone: 1 });
leadSchema.index({ status: 1, assignedTo: 1 });
leadSchema.index({ source: 1, priority: 1 });
leadSchema.index({ createdAt: -1 });
leadSchema.index({ 'location.city': 1 });

// Text search index
leadSchema.index({
    firstName: 'text',
    lastName: 'text',
    email: 'text',
    phone: 'text',
    notes: 'text'
});

// =====================================================
// VIRTUAL PROPERTIES
// =====================================================
leadSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// =====================================================
// INSTANCE METHODS
// =====================================================
/**
 * Mark lead as deleted
 */
leadSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    return this.save();
};

/**
 * Restore deleted lead
 */
leadSchema.methods.restore = function() {
    this.isDeleted = false;
    this.deletedAt = null;
    return this.save();
};

/**
 * Convert lead
 */
leadSchema.methods.convert = function(conversionValue = 0) {
    this.status = LEAD_STATUS.CONVERTED;
    this.conversionStatus = 'Converted';
    this.conversionValue = conversionValue;
    return this.save();
};

/**
 * Abandon lead
 */
leadSchema.methods.abandon = function() {
    this.status = LEAD_STATUS.LOST;
    this.conversionStatus = 'Abandoned';
    return this.save();
};

// =====================================================
// STATIC METHODS
// =====================================================
/**
 * Find active leads
 */
leadSchema.statics.findActive = function() {
    return this.find({ isDeleted: false });
};

/**
 * Find leads by status
 */
leadSchema.statics.findByStatus = function(status) {
    return this.find({ status, isDeleted: false });
};

/**
 * Search leads
 */
leadSchema.statics.searchLeads = function(searchTerm, options = {}) {
    const { page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    return this.find({ $text: { $search: searchTerm }, isDeleted: false }, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .skip(skip)
        .limit(limit);
};

// =====================================================
// MIDDLEWARE (HOOKS)
// =====================================================
/**
 * Validate budget range before saving
 */
leadSchema.pre('save', function(next) {
    if (this.budgetMin > this.budgetMax && this.budgetMax > 0) {
        next(new Error('Minimum budget cannot be greater than maximum budget'));
    } else {
        next();
    }
});

/**
 * Exclude deleted documents from queries by default
 */
leadSchema.pre(/^find/, function(next) {
    if (!this.getOptions()._recursed) {
        this.where({ isDeleted: false });
    }
    next();
});

module.exports = mongoose.model('Lead', leadSchema);
