# Personal Finance Manager Backend

A robust backend system for a personal finance management application with machine learning insights.

## Features

- User Authentication & Authorization
- Expense Tracking with CSV Upload Support
- Budget Management with Alerts
- Machine Learning Insights
- Secure API Endpoints
- Data Visualization Support

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- TensorFlow.js for ML
- JWT for Authentication
- Various middleware for security

## Prerequisites

- Node.js (v14 or higher)
- MongoDB Atlas account
- npm or yarn

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following variables:
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret
   NODE_ENV=development
   ```

## Running the Server

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm start
```

## API Endpoints

### Authentication
- POST /api/users/register - Register new user
- POST /api/users/login - Login user
- GET /api/users/profile - Get user profile
- PATCH /api/users/profile - Update user profile
- DELETE /api/users/account - Delete user account

### Expenses
- POST /api/expenses - Create expense
- GET /api/expenses - Get all expenses
- GET /api/expenses/:id - Get specific expense
- PATCH /api/expenses/:id - Update expense
- DELETE /api/expenses/:id - Delete expense
- POST /api/expenses/upload - Upload CSV
- GET /api/expenses/stats/summary - Get expense statistics
- GET /api/expenses/insights/ml - Get ML insights

### Budgets
- POST /api/budgets - Create budget
- GET /api/budgets - Get all budgets
- GET /api/budgets/:id - Get specific budget
- PATCH /api/budgets/:id - Update budget
- DELETE /api/budgets/:id - Delete budget
- GET /api/budgets/check/alerts - Check budget alerts

### ML Predictions
- GET /api/ml/predictions - Get spending predictions
- POST /api/ml/train - Train ML model

## Security Features

- JWT Authentication
- Request Rate Limiting
- Helmet Security Headers
- CORS Configuration
- Input Validation
- Error Handling

## Error Handling

The API uses consistent error responses:
```json
{
    "error": "Error message here"
}
```

## Data Models

### User
- email (String, required, unique)
- password (String, required)
- name (String, required)
- monthlyBudget (Number)
- preferences (Object)

### Expense
- user (ObjectId, ref: 'User')
- amount (Number, required)
- category (String, required)
- description (String)
- date (Date)
- paymentMethod (String)
- location (String)
- tags (Array)
- isRecurring (Boolean)

### Budget
- user (ObjectId, ref: 'User')
- category (String, required)
- amount (Number, required)
- period (String)
- alerts (Object)

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request
