/**
 * Employee Model
 * Represents company employees/agents managing leads
 */

const mongoose = require('mongoose');
const bcryptjs = require('bcryptjs');
const { EMPLOYEE_ROLE } = require('../constants');

const employeeSchema = new mongoose.Schema({
    // Personal Information
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
        unique: true,
        lowercase: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
        index: true
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^\+?[0-9\s\-()]{10,}$/, 'Invalid phone format']
    },
    mobile: {
        type: String,
        match: [/^\+?[0-9\s\-()]{10,}$/, 'Invalid mobile format']
    },

    // Authentication
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [8, 'Password must be at least 8 characters'],
        select: false
    },

    // Role & Permissions
    role: {
        type: String,
        enum: Object.values(EMPLOYEE_ROLE),
        default: EMPLOYEE_ROLE.JUNIOR_AGENT,
        required: true,
        index: true
    },
    permissions: [String],

    // Department & Team
    department: {
        type: String,
        enum: ['Sales', 'Management', 'Support', 'Admin'],
        default: 'Sales'
    },
    team: {
        type: String,
        default: null
    },
    reportingTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        default: null
    },

    // Performance Metrics
    totalLeadsAssigned: {
        type: Number,
        default: 0,
        min: 0
    },
    convertedLeads: {
        type: Number,
        default: 0,
        min: 0
    },
    lostLeads: {
        type: Number,
        default: 0,
        min: 0
    },
    conversionRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    averageDealValue: {
        type: Number,
        default: 0,
        min: 0
    },

    // Account Status
    status: {
        type: String,
        enum: ['Active', 'Inactive', 'On Leave', 'Suspended'],
        default: 'Active',
        index: true
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    lastLogin: Date,

    // Profile
    profileImage: String,
    bio: {
        type: String,
        maxlength: 500
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },

    // Employment Details
    employeeId: {
        type: String,
        unique: true,
        sparse: true,
        index: true
    },
    joinDate: Date,
    designation: String,
    salary: {
        type: Number,
        select: false
    },

    // Settings & Preferences
    timezone: {
        type: String,
        default: 'UTC'
    },
    language: {
        type: String,
        default: 'en'
    },
    notificationPreferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: true },
        push: { type: Boolean, default: true }
    },

    // Audit
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
    collection: 'employees'
});

// =====================================================
// INDEXES
// =====================================================
employeeSchema.index({ email: 1, isDeleted: 1 });
employeeSchema.index({ role: 1, status: 1 });
employeeSchema.index({ department: 1 });
employeeSchema.index({ createdAt: -1 });

// =====================================================
// VIRTUAL PROPERTIES
// =====================================================
employeeSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

employeeSchema.virtual('displayName').get(function() {
    return `${this.firstName} ${this.lastName} (${this.role})`;
});

// =====================================================
// PASSWORD HASHING
// =====================================================
/**
 * Hash password before saving
 */
employeeSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcryptjs.genSalt(10);
        this.password = await bcryptjs.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// =====================================================
// INSTANCE METHODS
// =====================================================
/**
 * Compare password with stored hash
 */
employeeSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcryptjs.compare(candidatePassword, this.password);
    } catch (error) {
        throw new Error('Error comparing passwords');
    }
};

/**
 * Get public profile (without sensitive data)
 */
employeeSchema.methods.getPublicProfile = function() {
    const profile = this.toObject();
    delete profile.password;
    delete profile.salary;
    return profile;
};

/**
 * Mark employee as deleted
 */
employeeSchema.methods.softDelete = function() {
    this.isDeleted = true;
    this.deletedAt = new Date();
    this.status = 'Suspended';
    return this.save();
};

/**
 * Restore deleted employee
 */
employeeSchema.methods.restore = function() {
    this.isDeleted = false;
    this.deletedAt = null;
    this.status = 'Active';
    return this.save();
};

/**
 * Update performance metrics
 */
employeeSchema.methods.updateMetrics = function(conversionCount = 0, totalLeads = 0) {
    this.totalLeadsAssigned = totalLeads;
    this.convertedLeads = conversionCount;
    if (totalLeads > 0) {
        this.conversionRate = (conversionCount / totalLeads) * 100;
    }
    return this.save();
};

// =====================================================
// STATIC METHODS
// =====================================================
/**
 * Find active employees
 */
employeeSchema.statics.findActive = function() {
    return this.find({ isDeleted: false, status: 'Active' });
};

/**
 * Find by email with password
 */
employeeSchema.statics.findByEmailWithPassword = function(email) {
    return this.findOne({ email: email.toLowerCase(), isDeleted: false }).select('+password');
};

/**
 * Find by role
 */
employeeSchema.statics.findByRole = function(role) {
    return this.find({ role, isDeleted: false, status: 'Active' });
};

/**
 * Find employees by department
 */
employeeSchema.statics.findByDepartment = function(department) {
    return this.find({ department, isDeleted: false, status: 'Active' });
};

/**
 * Get employees with best conversion rates
 */
employeeSchema.statics.getTopPerformers = function(limit = 10) {
    return this.find({ isDeleted: false, status: 'Active' })
        .sort({ conversionRate: -1, convertedLeads: -1 })
        .limit(limit);
};

// =====================================================
// MIDDLEWARE (HOOKS)
// =====================================================
/**
 * Exclude deleted employees from queries by default
 */
employeeSchema.pre(/^find/, function(next) {
    if (!this.getOptions()._recursed) {
        this.where({ $or: [{ isDeleted: false }, { isDeleted: { $exists: false } }] });
    }
    next();
});

/**
 * Prevent password selection by default
 */
employeeSchema.pre(/^find/, function(next) {
    this.select('-password');
    next();
});

module.exports = mongoose.model('Employee', employeeSchema);