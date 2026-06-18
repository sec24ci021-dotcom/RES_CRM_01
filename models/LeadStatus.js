/**
 * Lead Status Schema
 * Master data collection for lead statuses
 */

const mongoose = require('mongoose');

const leadStatusSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead status name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Lead status name cannot exceed 50 characters']
    },
    code: {
      type: String,
      required: [true, 'Lead status code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      maxlength: [20, 'Lead status code cannot exceed 20 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters']
    },
    color: {
      type: String,
      required: true,
      match: [/^#[0-9A-F]{6}$/i, 'Please provide a valid hex color code'],
      default: '#808080'
    },
    stage: {
      type: String,
      enum: ['DISCOVERY', 'QUALIFICATION', 'NEGOTIATION', 'CLOSURE', 'POST_SALE'],
      required: true
    },
    order: {
      type: Number,
      required: true,
      default: 0
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    }
  },
  {
    timestamps: true,
    collection: 'lead_statuses'
  }
);

// Indexes
leadStatusSchema.index({ code: 1 });
leadStatusSchema.index({ isActive: 1 });
leadStatusSchema.index({ stage: 1 });

module.exports = mongoose.model('LeadStatus', leadStatusSchema);
