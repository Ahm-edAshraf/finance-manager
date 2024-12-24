const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');

const API_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';
let expenseId = '';
let budgetId = '';

// Test user data
const testUser = {
    email: `test${Date.now()}@example.com`,
    password: 'Password123!',
    name: 'Test User'
};

// Test expense data
const testExpense = {
    amount: 50,
    category: 'Food',
    description: 'Lunch',
    paymentMethod: 'credit',
    location: 'Restaurant',
    tags: ['meal', 'work'],
    isRecurring: false
};

// Test budget data
const testBudget = {
    category: 'Food',
    amount: 500,
    period: 'monthly',
    alerts: {
        enabled: true,
        threshold: 80
    }
};

// Helper function to create a test CSV file
const createTestCSV = () => {
    const csvContent = 'date,amount,description\n2024-01-01,25.50,Grocery Shopping\n2024-01-02,15.75,Coffee Shop';
    fs.writeFileSync('test.csv', csvContent);
};

// Helper function for making authenticated requests
const authRequest = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Update auth token for requests
const setAuthToken = (token) => {
    authToken = token;
    authRequest.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

async function runTests() {
    try {
        console.log('🚀 Starting API Tests\n');

        // 1. User Authentication Tests
        console.log('👤 Testing User Authentication');
        
        // Register
        console.log('\nTesting User Registration...');
        const registerResponse = await axios.post(`${API_URL}/users/register`, testUser);
        console.log('✅ Registration successful');
        
        // Login
        console.log('\nTesting User Login...');
        const loginResponse = await axios.post(`${API_URL}/users/login`, {
            email: testUser.email,
            password: testUser.password
        });
        setAuthToken(loginResponse.data.token);
        userId = loginResponse.data.user._id;
        console.log('✅ Login successful');

        // Get Profile
        console.log('\nTesting Get Profile...');
        const profileResponse = await authRequest.get('/users/profile');
        console.log('✅ Profile retrieved successfully');

        // Update Profile
        console.log('\nTesting Profile Update...');
        const updateResponse = await authRequest.patch('/users/profile', {
            name: 'Updated Test User'
        });
        console.log('✅ Profile updated successfully');

        // 2. Expense Management Tests
        console.log('\n💰 Testing Expense Management');

        // Create Expense
        console.log('\nTesting Create Expense...');
        const expenseResponse = await authRequest.post('/expenses', testExpense);
        expenseId = expenseResponse.data._id;
        console.log('✅ Expense created successfully');

        // Get All Expenses
        console.log('\nTesting Get All Expenses...');
        const allExpensesResponse = await authRequest.get('/expenses');
        console.log('✅ All expenses retrieved successfully');

        // Get Single Expense
        console.log('\nTesting Get Single Expense...');
        const singleExpenseResponse = await authRequest.get(`/expenses/${expenseId}`);
        console.log('✅ Single expense retrieved successfully');

        // Update Expense
        console.log('\nTesting Update Expense...');
        const updateExpenseResponse = await authRequest.patch(`/expenses/${expenseId}`, {
            amount: 75
        });
        console.log('✅ Expense updated successfully');

        // Get Expense Stats
        console.log('\nTesting Get Expense Stats...');
        const statsResponse = await authRequest.get('/expenses/stats/summary');
        console.log('✅ Expense stats retrieved successfully');

        // Upload CSV
        console.log('\nTesting CSV Upload...');
        createTestCSV();
        const formData = new FormData();
        formData.append('csv', fs.createReadStream('test.csv'));
        const csvUploadResponse = await authRequest.post('/expenses/upload', formData, {
            headers: {
                ...formData.getHeaders()
            }
        });
        fs.unlinkSync('test.csv');
        console.log('✅ CSV uploaded successfully');

        // 3. Budget Management Tests
        console.log('\n📊 Testing Budget Management');

        // Create Budget
        console.log('\nTesting Create Budget...');
        const budgetResponse = await authRequest.post('/budgets', testBudget);
        budgetId = budgetResponse.data._id;
        console.log('✅ Budget created successfully');

        // Get All Budgets
        console.log('\nTesting Get All Budgets...');
        const allBudgetsResponse = await authRequest.get('/budgets');
        console.log('✅ All budgets retrieved successfully');

        // Get Single Budget
        console.log('\nTesting Get Single Budget...');
        const singleBudgetResponse = await authRequest.get(`/budgets/${budgetId}`);
        console.log('✅ Single budget retrieved successfully');

        // Update Budget
        console.log('\nTesting Update Budget...');
        const updateBudgetResponse = await authRequest.patch(`/budgets/${budgetId}`, {
            amount: 600
        });
        console.log('✅ Budget updated successfully');

        // Check Budget Alerts
        console.log('\nTesting Budget Alerts...');
        const alertsResponse = await authRequest.get('/budgets/check/alerts');
        console.log('✅ Budget alerts checked successfully');

        // 4. ML Predictions Tests
        console.log('\n🤖 Testing ML Predictions');

        // Get Predictions
        console.log('\nTesting Get ML Predictions...');
        const predictionsResponse = await authRequest.get('/ml/predictions');
        console.log('✅ ML predictions retrieved successfully');

        // Train Model
        console.log('\nTesting ML Model Training...');
        const trainResponse = await authRequest.post('/ml/train');
        console.log('✅ ML model trained successfully');

        // 5. Cleanup Tests
        console.log('\n🧹 Testing Cleanup');

        // Delete Expense
        console.log('\nTesting Delete Expense...');
        await authRequest.delete(`/expenses/${expenseId}`);
        console.log('✅ Expense deleted successfully');

        // Delete Budget
        console.log('\nTesting Delete Budget...');
        await authRequest.delete(`/budgets/${budgetId}`);
        console.log('✅ Budget deleted successfully');

        // Delete Account
        console.log('\nTesting Delete Account...');
        await authRequest.delete('/users/account');
        console.log('✅ Account deleted successfully');

        console.log('\n✨ All tests completed successfully! ✨');

    } catch (error) {
        console.error('\n❌ Test failed:', error.response?.data || error.message);
        console.error('Status:', error.response?.status);
        console.error('At:', error.stack);
    }
}

// Run the tests
runTests();
