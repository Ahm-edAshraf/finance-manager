class ExpensePredictor {
    constructor() {
        this.historicalData = [];
    }

    async trainModel(expenses) {
        this.historicalData = expenses;
    }

    async predict(inputData) {
        try {
            if (!this.historicalData.length) {
                return 0;
            }

            // Calculate average spending for the category
            const categoryExpenses = this.historicalData.filter(
                expense => expense.category === inputData.category
            );

            if (!categoryExpenses.length) {
                return 0;
            }

            const avgAmount = categoryExpenses.reduce((sum, expense) => sum + expense.amount, 0) / categoryExpenses.length;

            // Apply simple trend analysis
            const sortedExpenses = categoryExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
            const recentExpenses = sortedExpenses.slice(0, Math.min(3, sortedExpenses.length));
            const recentAvg = recentExpenses.reduce((sum, expense) => sum + expense.amount, 0) / recentExpenses.length;

            // Predict next month's expense with a weighted average
            const prediction = (recentAvg * 0.7 + avgAmount * 0.3);
            
            return Math.max(0, Math.round(prediction * 100) / 100);
        } catch (error) {
            console.error('Prediction error:', error);
            return 0;
        }
    }

    async generateInsights(expenses) {
        if (!Array.isArray(expenses) || expenses.length === 0) {
            return [];
        }

        const insights = [];
        
        // 1. Category Analysis
        const categoryTotals = {};
        const categoryCount = {};
        
        expenses.forEach(expense => {
            if (expense && expense.category && expense.amount) {
                categoryTotals[expense.category] = (categoryTotals[expense.category] || 0) + expense.amount;
                categoryCount[expense.category] = (categoryCount[expense.category] || 0) + 1;
            }
        });

        const totalSpent = Object.values(categoryTotals).reduce((a, b) => a + b, 0);

        // 2. Generate Category Insights
        for (const [category, amount] of Object.entries(categoryTotals)) {
            const percentage = totalSpent > 0 ? (amount / totalSpent) * 100 : 0;
            const frequency = categoryCount[category];
            const avgTransactionAmount = amount / frequency;

            if (percentage > 30) {
                insights.push({
                    category,
                    type: 'high_spending',
                    message: `Your ${category} expenses are ${percentage.toFixed(1)}% of total spending. Consider reducing it by ${Math.round(amount * 0.1)} to save money.`
                });
            }

            if (avgTransactionAmount > totalSpent * 0.2) {
                insights.push({
                    category,
                    type: 'large_transactions',
                    message: `Your average ${category} transaction (${avgTransactionAmount.toFixed(2)}) is relatively high. Consider breaking down these expenses into smaller amounts.`
                });
            }
        }

        // 3. Spending Trend Analysis
        const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));
        const recentExpenses = sortedExpenses.slice(0, Math.min(10, sortedExpenses.length));
        const olderExpenses = sortedExpenses.slice(Math.min(10, sortedExpenses.length));

        if (recentExpenses.length && olderExpenses.length) {
            const recentTotal = recentExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const olderTotal = olderExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const recentAvg = recentTotal / recentExpenses.length;
            const olderAvg = olderTotal / olderExpenses.length;

            if (recentAvg > olderAvg * 1.2) {
                insights.push({
                    type: 'spending_trend',
                    message: 'Your recent spending has increased significantly. Consider reviewing your expenses to identify areas for potential savings.'
                });
            }
        }

        // 4. Recurring Expenses Analysis
        const recurringExpenses = expenses.filter(expense => expense.isRecurring);
        if (recurringExpenses.length > 0) {
            const recurringTotal = recurringExpenses.reduce((sum, exp) => sum + exp.amount, 0);
            const recurringPercentage = (recurringTotal / totalSpent) * 100;

            if (recurringPercentage > 50) {
                insights.push({
                    type: 'recurring_expenses',
                    message: `${recurringPercentage.toFixed(1)}% of your spending is on recurring expenses. Review these subscriptions and services for potential savings.`
                });
            }
        }

        return insights;
    }
}

module.exports = new ExpensePredictor();
