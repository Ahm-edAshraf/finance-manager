const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Investment = require('../models/Investment');
const moment = require('moment');

router.get('/', auth, async (req, res) => {
    try {
        const startOfMonth = moment().startOf('month');
        const endOfMonth = moment().endOf('month');

        // Get monthly expenses
        const monthlyExpenses = await Expense.find({
            user: req.user.id,
            date: {
                $gte: startOfMonth.toDate(),
                $lte: endOfMonth.toDate()
            }
        });

        // Calculate total monthly expenses
        const totalMonthlyExpenses = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;

        // Get expenses by category for the month
        const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        // Get all budgets
        const budgets = await Budget.find({ user: req.user.id });
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0) || 0;

        // Calculate total balance (total budget - total expenses)
        const totalBalance = totalBudget - totalMonthlyExpenses;

        // Get budget progress
        const budgetProgress = budgets.map(budget => ({
            category: budget.category,
            budgeted: budget.amount,
            spent: expensesByCategory[budget.category] || 0,
            remaining: budget.amount - (expensesByCategory[budget.category] || 0)
        }));

        // Get investments total
        const investments = await Investment.find({ user: req.user.id });
        const totalInvestments = investments.reduce((sum, inv) => sum + inv.currentValue, 0) || 0;
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0) || 0;
        const investmentReturn = totalInvestments - totalInvested;

        // Get expense trend for the last 6 months
        const sixMonthsAgo = moment().subtract(5, 'months').startOf('month');
        const months = Array.from({ length: 6 }, (_, i) => moment(sixMonthsAgo).add(i, 'months'));
        
        const expenseTrend = await Promise.all(
            months.map(async (month) => {
                const startOfMonth = month.clone().startOf('month');
                const endOfMonth = month.clone().endOf('month');
                
                const expenses = await Expense.find({
                    user: req.user.id,
                    date: {
                        $gte: startOfMonth.toDate(),
                        $lte: endOfMonth.toDate()
                    }
                });
                
                return {
                    month: month.format('YYYY-MM'),
                    total: expenses.reduce((sum, expense) => sum + expense.amount, 0) || 0
                };
            })
        );

        // Calculate month-over-month changes
        const previousMonthExpenses = await Expense.find({
            user: req.user.id,
            date: {
                $gte: moment().subtract(1, 'month').startOf('month').toDate(),
                $lte: moment().subtract(1, 'month').endOf('month').toDate()
            }
        });
        const previousMonthTotal = previousMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0) || 0;
        const expenseChange = previousMonthTotal ? ((totalMonthlyExpenses - previousMonthTotal) / previousMonthTotal) * 100 : 0;
        const balanceChange = previousMonthTotal ? ((totalBalance - previousMonthTotal) / previousMonthTotal) * 100 : 0;
        const incomeChange = 3.1; // Placeholder since we're using budget as income

        res.json({
            totalBalance,
            balanceChange,
            monthlyIncome: totalBudget,
            incomeChange,
            totalMonthlyExpenses,
            expenseChange,
            monthlySavings: totalBalance,
            savingsRate: totalBudget > 0 ? (totalBalance / totalBudget) * 100 : 0,
            budgetProgress,
            totalInvestments,
            investmentReturn,
            expensesByCategory: {
                labels: Object.keys(expensesByCategory),
                data: Object.values(expensesByCategory)
            },
            expenseTrend: {
                labels: expenseTrend.map(e => moment(e.month).format('MMM')),
                data: expenseTrend.map(e => e.total)
            },
            recentTransactions: monthlyExpenses.slice(0, 5).map(expense => ({
                ...expense.toObject(),
                date: moment(expense.date).format('YYYY-MM-DD')
            }))
        });
    } catch (err) {
        console.error('Dashboard error:', err);
        res.status(500).json({ message: 'Error fetching dashboard data' });
    }
});

module.exports = router;
