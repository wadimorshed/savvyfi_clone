require('dotenv').config();  // Load environment variables from a .env file

// External dependencies
const express = require("express");
const cors = require("cors");  // For enabling Cross-Origin Resource Sharing (CORS)
const port = process.env.PORT || 5000;  // Get the port from environment or default to 5000

// Database dependencies
const sqlite = require("sqlite3");  // SQLite database package
const db = new sqlite3.Database('./finance.db', (err) => {
    if (err) {
        console.error('Database connection error:', err.message);  // Log any database connection error
    } else {
        console.log('Connected to the SQLite database.');  // Log successful connection
    }
});

// Express setup
const app = express();  // Create a new Express application

// Middleware setup
app.use(cors());  // Enable CORS for all routes (ensure cors() is called as a function)
app.use(express.json());  // Middleware to parse incoming JSON requests

// Routes
// Users Route
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);  // Route for handling user-related requests

// Budgets Route
const budgetRoutes = require('./routes/budgetRoutes');
app.use('/api/budgets', budgetRoutes);  // Route for handling budget-related requests

// Goals Route
const goalRoutes = require('./routes/goalRoutes');
app.use('/api/goals', goalRoutes);  // Route for handling goal-related requests

// Transactions Route
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);  // Route for handling transaction-related requests

// AI Route
const aiRoutes = require('./routes/aiRoutes');  // Import AI-related routes
app.use('/api/ai', aiRoutes);  // Route for handling AI-related requests

// Start the Express server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);  // Log server start message
});

// Export the database instance for use in other parts of the application
module.exports = db;
