const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['Food', 'Rent', 'Transportation', 'Entertainment', 'Shopping', 'Utilities', 'Healthcare', 'Education', 'Other']
    },
    description: {
        type: String,
        trim: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    paymentMethod: {
        type: String,
        enum: ['cash', 'credit', 'debit', 'online', 'other'],
        default: 'other'
    },
    location: {
        type: String,
        trim: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    isRecurring: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Index for efficient querying
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
