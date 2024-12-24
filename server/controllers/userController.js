const User = require('../models/User');
const jwt = require('jsonwebtoken');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const userController = {
    // Register new user
    async register(req, res) {
        try {
            const { email, password, name } = req.body;
            
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ error: 'Email already exists' });
            }

            const user = new User({
                email,
                password,
                name
            });

            await user.save();
            
            const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
            res.status(201).json({ user, token });
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            const user = await User.findOne({ email });

            if (!user || !(await user.validatePassword(password))) {
                throw new Error('Invalid login credentials');
            }

            const token = jwt.sign({ _id: user._id.toString() }, JWT_SECRET);
            res.json({ user, token });
        } catch (error) {
            res.status(401).json({ error: error.message });
        }
    },

    // Get user profile
    async getProfile(req, res) {
        res.json(req.user);
    },

    // Update user profile
    async updateProfile(req, res) {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        try {
            // Check if email is being updated and if it's already in use
            if (req.body.email && req.body.email !== req.user.email) {
                const existingUser = await User.findOne({ email: req.body.email });
                if (existingUser) {
                    return res.status(400).json({ error: 'Email already in use' });
                }
            }

            updates.forEach(update => req.user[update] = req.body[update]);
            await req.user.save();
            
            // Return user without sensitive information
            const userResponse = {
                _id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                settings: req.user.settings
            };
            
            res.json(userResponse);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Delete user account
    async deleteAccount(req, res) {
        try {
            // Delete all user's expenses
            await Expense.deleteMany({ user: req.user._id });
            
            // Delete all user's budgets
            await Budget.deleteMany({ user: req.user._id });
            
            // Delete the user
            await User.findByIdAndDelete(req.user._id);
            
            res.json({ message: 'Account and all associated data deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = userController;
