/**
 * Lead Source Schema
 * Master data collection for lead sources
 */

const mongoose = require('mongoose');

const leadSourceSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Lead source name is required'],
        unique: true,
        trim: true,
        maxlength: [50, 'Lead source name cannot exceed 50 characters']
    },
    code: {
        type: String,
        required: [true, 'Lead source code is required'],
        unique: true,
        uppercase: true,
        trim: true,
        maxlength: [20, 'Lead source code cannot exceed 20 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    channel: {
        type: String,
        enum: ['WEBSITE', 'SOCIAL_MEDIA', 'REFERRAL', 'ADVERTISEMENT', 'WALK_IN', 'CALL', 'EMAIL'],
        required: true
    },
    costPerLead: {
        type: Number,
        min: [0, 'Cost per lead cannot be negative'],
        default: 0
    },
    conversionRate: {
        type: Number,
        min: [0, 'Conversion rate cannot be less than 0'],
        max: [100, 'Conversion rate cannot exceed 100'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    collection: 'lead_sources'
});

// Indexes
leadSourceSchema.index({ code: 1 });
leadSourceSchema.index({ channel: 1 });
leadSourceSchema.index({ isActive: 1 });

module.exports = mongoose.model('LeadSource', leadSourceSchema);