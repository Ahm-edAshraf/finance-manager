const express = require('express');
const router = express.Router();
const PDFDocument = require('pdfkit');
const moment = require('moment');
const auth = require('../middleware/auth');
const Expense = require('../models/Expense');
const Budget = require('../models/Budget');
const Investment = require('../models/Investment');

router.get('/export', auth, async (req, res) => {
    try {
        const { timeRange } = req.query;
        const startDate = moment().subtract(parseInt(timeRange), 'days').startOf('day');
        const endDate = moment().endOf('day');

        // Fetch all data
        const expenses = await Expense.find({
            user: req.user.id,
            date: { $gte: startDate.toDate(), $lte: endDate.toDate() }
        }).sort({ date: -1 });

        const budgets = await Budget.find({ user: req.user.id });
        const investments = await Investment.find({ user: req.user.id });

        // Create PDF document
        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=finance-report-${timeRange}.pdf`);
        doc.pipe(res);

        // Add title and date range
        doc.fontSize(25).text('Financial Report', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Date Range: ${startDate.format('MMMM D, YYYY')} - ${endDate.format('MMMM D, YYYY')}`, { align: 'center' });
        doc.moveDown(2);

        // Summary section
        doc.fontSize(18).text('Summary', { underline: true });
        doc.moveDown();
        
        const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
        const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
        const totalInvestments = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
        const totalInvested = investments.reduce((sum, inv) => sum + inv.amount, 0);
        
        doc.fontSize(12)
           .text(`Total Expenses: $${totalExpenses.toLocaleString()}`)
           .text(`Total Budget: $${totalBudget.toLocaleString()}`)
           .text(`Total Investments: $${totalInvestments.toLocaleString()}`)
           .text(`Investment Returns: $${(totalInvestments - totalInvested).toLocaleString()}`);
        doc.moveDown(2);

        // Expenses by category
        doc.fontSize(18).text('Expenses by Category', { underline: true });
        doc.moveDown();
        
        const expensesByCategory = expenses.reduce((acc, exp) => {
            acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
            return acc;
        }, {});

        Object.entries(expensesByCategory).forEach(([category, amount]) => {
            doc.fontSize(12).text(`${category}: $${amount.toLocaleString()}`);
        });
        doc.moveDown(2);

        // Budget Progress
        doc.fontSize(18).text('Budget Progress', { underline: true });
        doc.moveDown();
        
        budgets.forEach(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const remaining = budget.amount - spent;
            const percentage = ((spent / budget.amount) * 100).toFixed(1);
            
            doc.fontSize(12)
               .text(`${budget.category}:`)
               .text(`  Budget: $${budget.amount.toLocaleString()}`)
               .text(`  Spent: $${spent.toLocaleString()}`)
               .text(`  Remaining: $${remaining.toLocaleString()}`)
               .text(`  Progress: ${percentage}%`)
               .moveDown();
        });
        doc.moveDown();

        // Investment Performance
        if (investments.length > 0) {
            doc.fontSize(18).text('Investment Performance', { underline: true });
            doc.moveDown();
            
            investments.forEach(inv => {
                const returns = inv.currentValue - inv.amount;
                const roi = ((returns / inv.amount) * 100).toFixed(1);
                
                doc.fontSize(12)
                   .text(`${inv.name}:`)
                   .text(`  Invested: $${inv.amount.toLocaleString()}`)
                   .text(`  Current Value: $${inv.currentValue.toLocaleString()}`)
                   .text(`  Returns: $${returns.toLocaleString()}`)
                   .text(`  ROI: ${roi}%`)
                   .moveDown();
            });
        }

        // Recent Transactions
        doc.fontSize(18).text('Recent Transactions', { underline: true });
        doc.moveDown();
        
        expenses.slice(0, 10).forEach(exp => {
            doc.fontSize(12)
               .text(`${moment(exp.date).format('MMM D, YYYY')} - ${exp.category}`)
               .text(`  Amount: $${exp.amount.toLocaleString()}`)
               .text(`  Payment Method: ${exp.paymentMethod}`)
               .moveDown();
        });

        // Finalize the PDF
        doc.end();
    } catch (error) {
        console.error('PDF generation error:', error);
        res.status(500).json({ message: 'Error generating PDF report' });
    }
});

module.exports = router;
