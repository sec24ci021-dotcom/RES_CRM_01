/**
 * Employee Schema
 * Represents sales team members and staff
 */

const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, 'First name is required'],
        trim: true,
        maxlength: [50, 'First name cannot exceed 50 characters']
    },
    lastName: {
        type: String,
        required: [true, 'Last name is required'],
        trim: true,
        maxlength: [50, 'Last name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Phone number is required'],
        match: [/^[\d\s\-\+\(\)]{10,}$/, 'Please provide a valid phone number']
    },
    role: {
        type: String,
        enum: ['JUNIOR_AGENT', 'SENIOR_AGENT', 'MANAGER', 'DIRECTOR', 'ADMIN'],
        required: true,
        default: 'JUNIOR_AGENT'
    },
    department: {
        type: String,
        trim: true,
        maxlength: [50, 'Department cannot exceed 50 characters']
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true,
        index: true
    },
    specializations: [{
        type: String,
        trim: true,
        maxlength: [50, 'Specialization cannot exceed 50 characters']
    }],
    totalLeadsAssigned: {
        type: Number,
        default: 0,
        min: 0
    },
    totalLeadsConverted: {
        type: Number,
        default: 0,
        min: 0
    },
    conversionRate: {
        type: Number,
        default: 0,
        min: [0, 'Conversion rate cannot be negative'],
        max: [100, 'Conversion rate cannot exceed 100']
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    collection: 'employees'
});

// Indexes
employeeSchema.index({ email: 1 });
employeeSchema.index({ role: 1, isActive: 1 });
employeeSchema.index({ company: 1, isActive: 1 });

// Virtual for full name
employeeSchema.virtual('fullName').get(function() {
    return `${this.firstName} ${this.lastName}`;
});

// Method to update conversion rate
employeeSchema.methods.updateConversionRate = function() {
    if (this.totalLeadsAssigned > 0) {
        this.conversionRate = (this.totalLeadsConverted / this.totalLeadsAssigned) * 100;
    }
    return this.save();
};

module.exports = mongoose.model('Employee', employeeSchema);