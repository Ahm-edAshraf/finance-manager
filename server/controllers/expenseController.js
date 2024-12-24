const Expense = require('../models/Expense');
const { parseCSV, categorizeExpense } = require('../utils/csvParser');
const expensePredictor = require('../ml/expensePredictor');

const expenseController = {
    // Create new expense
    async create(req, res) {
        try {
            const expense = new Expense({
                ...req.body,
                user: req.user._id
            });
            await expense.save();
            res.status(201).json(expense);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Get all expenses with filters
    async getAll(req, res) {
        try {
            const match = { user: req.user._id };
            const sort = {};

            // Apply filters
            if (req.query.category) {
                match.category = req.query.category;
            }
            if (req.query.startDate) {
                match.date = { $gte: new Date(req.query.startDate) };
            }
            if (req.query.endDate) {
                match.date = { ...match.date, $lte: new Date(req.query.endDate) };
            }

            // Apply sorting
            if (req.query.sortBy) {
                const parts = req.query.sortBy.split(':');
                sort[parts[0]] = parts[1] === 'desc' ? -1 : 1;
            }

            const expenses = await Expense.find(match)
                .sort(sort)
                .limit(parseInt(req.query.limit))
                .skip(parseInt(req.query.skip));

            res.json(expenses);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get expense by ID
    async getById(req, res) {
        try {
            const expense = await Expense.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!expense) {
                return res.status(404).json({ error: 'Expense not found' });
            }

            res.json(expense);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update expense
    async update(req, res) {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['amount', 'category', 'description', 'date', 'paymentMethod', 'location', 'tags', 'isRecurring'];
        const isValidOperation = updates.every(update => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ error: 'Invalid updates' });
        }

        try {
            const expense = await Expense.findOne({
                _id: req.params.id,
                user: req.user._id
            });

            if (!expense) {
                return res.status(404).json({ error: 'Expense not found' });
            }

            updates.forEach(update => expense[update] = req.body[update]);
            await expense.save();
            res.json(expense);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Delete expense
    async delete(req, res) {
        try {
            const expense = await Expense.findOneAndDelete({
                _id: req.params.id,
                user: req.user._id
            });

            if (!expense) {
                return res.status(404).json({ error: 'Expense not found' });
            }

            res.json(expense);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Upload CSV file
    async uploadCSV(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({ error: 'Please upload a CSV file' });
            }

            const expenses = await parseCSV(req.file.path);
            const savedExpenses = await Promise.all(
                expenses.map(async (expense) => {
                    const newExpense = new Expense({
                        ...expense,
                        user: req.user._id
                    });
                    return await newExpense.save();
                })
            );

            res.status(201).json(savedExpenses);
        } catch (error) {
            res.status(400).json({ error: error.message });
        }
    },

    // Get expense statistics
    async getStats(req, res) {
        try {
            const stats = await Expense.aggregate([
                { $match: { user: req.user._id } },
                {
                    $group: {
                        _id: '$category',
                        total: { $sum: '$amount' },
                        count: { $sum: 1 },
                        avgAmount: { $avg: '$amount' }
                    }
                }
            ]);

            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get ML predictions and insights
    async getInsights(req, res) {
        try {
            const expenses = await Expense.find({ user: req.user._id })
                .sort({ date: -1 })
                .limit(100);

            await expensePredictor.trainModel(expenses);
            const insights = await expensePredictor.generateInsights(expenses);

            // Predict next month's expenses
            const nextMonthPrediction = await expensePredictor.predict({
                amount: expenses[0].amount,
                date: new Date(),
                category: expenses[0].category,
                isRecurring: expenses[0].isRecurring
            });

            res.json({
                insights,
                prediction: {
                    nextMonth: nextMonthPrediction
                }
            });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};

module.exports = expenseController;
