const Budget = require('../models/Budget');
const Expense = require('../models/Expense');

const budgetController = {
    // Create new budget
    async create(req, res) {
        try {
            const budget = new Budget({
                ...req.body,
                user: req.user._id
            });
            await budget.save();
            res.status(201).json(budget);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Get all budgets
    async getAll(req, res) {
        try {
            const budgets = await Budget.find({ user: req.user._id });
            
            // Calculate current spending for each budget
            const enrichedBudgets = await Promise.all(budgets.map(async (budget) => {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const expenses = await Expense.aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            category: budget.category,
                            date: { $gte: startOfMonth }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                const currentSpending = expenses[0]?.total || 0;
                const percentageUsed = (currentSpending / budget.amount) * 100;
                const remaining = budget.amount - currentSpending;

                return {
                    ...budget.toObject(),
                    currentSpending,
                    percentageUsed,
                    remaining
                };
            }));

            res.json(enrichedBudgets);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get budget by ID
    async getById(req, res) {
        try {
            const budget = await Budget.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!budget) {
                return res.status(404).json({ error: 'Budget not found' });
            }

            res.json(budget);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update budget
    async update(req, res) {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['amount', 'period', 'startDate', 'endDate', 'alerts'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        try {
            const budget = await Budget.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!budget) {
                return res.status(404).json({ error: 'Budget not found' });
            }

            updates.forEach(update => budget[update] = req.body[update]);
            await budget.save();
            res.json(budget);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Delete budget
    async delete(req, res) {
        try {
            const budget = await Budget.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

            if (!budget) {
                return res.status(404).json({ error: 'Budget not found' });
            }

            res.json(budget);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Check budget alerts
    async checkAlerts(req, res) {
        try {
            const budgets = await Budget.find({ 
                user: req.user._id,
                'alerts.enabled': true
            });

            const alerts = await Promise.all(budgets.map(async (budget) => {
                const startOfMonth = new Date();
                startOfMonth.setDate(1);
                startOfMonth.setHours(0, 0, 0, 0);

                const expenses = await Expense.aggregate([
                    {
                        $match: {
                            user: req.user._id,
                            category: budget.category,
                            date: { $gte: startOfMonth }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: { $sum: '$amount' }
                        }
                    }
                ]);

                const currentSpending = expenses[0]?.total || 0;
                const percentageUsed = (currentSpending / budget.amount) * 100;

                if (percentageUsed >= budget.alerts.threshold) {
                    return {
                        category: budget.category,
                        threshold: budget.alerts.threshold,
                        percentageUsed,
                        currentSpending,
                        budgetAmount: budget.amount
                    };
                }
                return null;
            }));

            const activeAlerts = alerts.filter(alert => alert !== null);
            res.json(activeAlerts);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = budgetController;
