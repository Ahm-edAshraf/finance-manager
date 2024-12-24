const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const expensePredictor = require('../ml/expensePredictor');
const Expense = require('../models/Expense');

router.use(auth);

// Get spending predictions and insights
router.get('/predictions', async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id })
            .sort({ date: -1 })
            .limit(100);

        await expensePredictor.trainModel(expenses);
        
        const predictions = {
            nextMonth: await expensePredictor.predict({
                amount: expenses[0].amount,
                date: new Date(),
                category: expenses[0].category,
                isRecurring: expenses[0].isRecurring
            }),
            insights: await expensePredictor.generateInsights(expenses)
        };

        res.json(predictions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Train model with user data
router.post('/train', async (req, res) => {
    try {
        const expenses = await Expense.find({ user: req.user._id });
        await expensePredictor.trainModel(expenses);
        res.json({ message: 'Model trained successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
