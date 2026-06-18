/**
 * Company Schema
 * Represents real estate companies and branches
 */

const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        unique: true,
        trim: true,
        maxlength: [100, 'Company name cannot exceed 100 characters']
    },
    email: {
        type: String,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
    },
    phone: {
        type: String,
        match: [/^[\d\s\-\+\(\)]{10,}$/, 'Please provide a valid phone number']
    },
    address: {
        street: {
            type: String,
            trim: true,
            maxlength: [100, 'Street cannot exceed 100 characters']
        },
        city: {
            type: String,
            trim: true,
            maxlength: [50, 'City cannot exceed 50 characters']
        },
        state: {
            type: String,
            trim: true,
            maxlength: [50, 'State cannot exceed 50 characters']
        },
        zipCode: {
            type: String,
            trim: true,
            maxlength: [10, 'Zip code cannot exceed 10 characters']
        },
        country: {
            type: String,
            trim: true,
            maxlength: [50, 'Country cannot exceed 50 characters'],
            default: 'India'
        },
        coordinates: {
            latitude: {
                type: Number,
                min: [-90, 'Invalid latitude'],
                max: [90, 'Invalid latitude']
            },
            longitude: {
                type: Number,
                min: [-180, 'Invalid longitude'],
                max: [180, 'Invalid longitude']
            }
        }
    },
    registrationNumber: {
        type: String,
        unique: true,
        sparse: true,
        trim: true
    },
    industry: {
        type: String,
        default: 'Real Estate',
        trim: true
    },
    totalEmployees: {
        type: Number,
        min: [0, 'Total employees cannot be negative'],
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true
    }
}, {
    timestamps: true,
    collection: 'companies'
});

// Indexes
companySchema.index({ name: 1 });
companySchema.index({ isActive: 1 });

module.exports = mongoose.model('Company', companySchema);