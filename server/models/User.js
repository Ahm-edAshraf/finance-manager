const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    monthlyBudget: {
        type: Number,
        default: 0
    },
    preferences: {
        currency: {
            type: String,
            default: 'USD'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    },
    settings: {
        emailNotifications: {
            type: Boolean,
            default: true
        },
        pushNotifications: {
            type: Boolean,
            default: true
        },
        currency: {
            type: String,
            default: 'USD'
        },
        language: {
            type: String,
            default: 'English'
        },
        theme: {
            type: String,
            enum: ['light', 'dark'],
            default: 'light'
        },
        budgetAlerts: {
            type: Boolean,
            default: true
        },
        monthlyReports: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 8);
    }
    next();
});

// Method to validate password
userSchema.methods.validatePassword = async function(password) {
    return bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('User', userSchema);
