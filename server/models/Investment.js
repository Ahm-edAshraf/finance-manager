const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Stocks', 'Bonds', 'Mutual Funds', 'ETFs', 'Real Estate', 'Cryptocurrency', 'Other']
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    currentValue: {
        type: Number,
        required: true,
        min: 0
    },
    purchaseDate: {
        type: Date,
        required: true
    },
    returnRate: {
        type: Number,
        default: 0
    },
    notes: {
        type: String
    }
}, {
    timestamps: true
});

// Calculate return rate before saving
investmentSchema.pre('save', function(next) {
    if (this.currentValue && this.amount) {
        this.returnRate = ((this.currentValue - this.amount) / this.amount) * 100;
    }
    next();
});

module.exports = mongoose.model('Investment', investmentSchema);
