const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Other']
    },
    amount: {
        type: Number,
        required: true
    },
    period: {
        type: String,
        enum: ['monthly', 'yearly'],
        default: 'monthly'
    },
    startDate: {
        type: Date,
        default: Date.now
    },
    endDate: {
        type: Date
    },
    alerts: {
        enabled: {
            type: Boolean,
            default: true
        },
        threshold: {
            type: Number,
            default: 80 // percentage
        }
    }
}, {
    timestamps: true
});

// Index for efficient querying
budgetSchema.index({ user: 1, category: 1 });

module.exports = mongoose.model('Budget', budgetSchema);
