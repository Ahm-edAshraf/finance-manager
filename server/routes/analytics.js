const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const moment = require('moment');

// Get analytics data
router.get('/', auth, async (req, res) => {
    try {
        const { timeRange } = req.query;
        let startDate;

        switch (timeRange) {
            case 'Last 7 Days':
                startDate = moment().subtract(7, 'days');
                break;
            case 'Last 30 Days':
                startDate = moment().subtract(30, 'days');
                break;
            case 'Last 3 Months':
                startDate = moment().subtract(3, 'months');
                break;
            case 'Last 6 Months':
                startDate = moment().subtract(6, 'months');
                break;
            case 'Last Year':
                startDate = moment().subtract(1, 'year');
                break;
            default:
                startDate = moment().subtract(30, 'days');
        }

        // Get expenses for the period
        const expenses = await Expense.find({
            user: req.user.id,
            date: { $gte: startDate.toDate() }
        }).sort('date');

        // Get budgets
        const budgets = await Budget.find({ user: req.user.id });

        // Calculate expenses by category
        const expensesByCategory = expenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        // Calculate expenses trend (daily totals)
        const expensesTrend = expenses.reduce((acc, expense) => {
            const date = moment(expense.date).format('YYYY-MM-DD');
            acc[date] = (acc[date] || 0) + expense.amount;
            return acc;
        }, {});

        // Calculate budget vs actual
        const budgetVsActual = budgets.map(budget => ({
            category: budget.category,
            budgeted: budget.amount,
            actual: expensesByCategory[budget.category] || 0
        }));

        // Calculate savings rate
        const totalIncome = 5000; // This should come from income data when implemented
        const totalExpenses = Object.values(expensesByCategory).reduce((a, b) => a + b, 0);
        const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

        // Get top expenses
        const topExpenses = Object.entries(expensesByCategory)
            .map(([category, amount]) => ({ category, amount }))
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5);

        res.json({
            expensesByCategory: {
                labels: Object.keys(expensesByCategory),
                data: Object.values(expensesByCategory)
            },
            expensesTrend: {
                labels: Object.keys(expensesTrend),
                data: Object.values(expensesTrend)
            },
            budgetVsActual: {
                categories: budgetVsActual.map(b => b.category),
                budgeted: budgetVsActual.map(b => b.budgeted),
                actual: budgetVsActual.map(b => b.actual)
            },
            savingsRate: Math.round(savingsRate * 100) / 100,
            topExpenses
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ message: 'Error fetching analytics data' });
    }
});

module.exports = router;
