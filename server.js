// server/server.js

const express = require('express');
const cors = require('cors');
const path = require('path'); // Import the path module
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

// Import database service
const dbService = require('./services/databaseService'); // This handles SQLite connection and table creation

// Import routes
const userRoutes = require('./routes/userRoutes');
const budgetRoutes = require('./routes/budgetRoutes');
const goalRoutes = require('./routes/goalRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const aiRoutes = require('./routes/aiRoutes'); // For AI Assistant integration

const app = express();
const PORT = process.env.PORT || 5000; // Use port from .env or default to 5000

// Middleware
app.use(cors()); // Enable CORS for cross-origin requests from your React frontend
app.use(express.json()); // Enable JSON body parsing for incoming requests

// Serve static files from the React app
// This assumes your React build output is in '../client/dist'.
// Adjust this path if your build output directory is different.
app.use(express.static(path.join(__dirname, '../client/dist')));

// API Routes
app.use('/api/users', userRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/ai', aiRoutes); // Route for AI assistant

// For any other GET request, serve the React app's index.html
// This handles client-side routing for your single-page application.
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
});


// Initialize database and start server
async function startServer() {
    try {
        // Initialize database first. This will connect and create tables if they don't exist.
        await dbService.initializeDatabase();
        
        // Once the database is ready, start the Express server
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log(`Access backend API at http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error('Failed to initialize database or start server:', error);
        // If database connection fails, exit the process to prevent further issues
        process.exit(1);
    }
}

// Call the function to start the server
startServer();

// Optional: Graceful shutdown to ensure the database connection is closed
process.on('SIGINT', () => {
    console.log('Server shutting down...');
    dbService.closeDatabase(); // Close the database connection
    process.exit(0);
});

// Remove the direct database export; controllers will now use dbService methods directly.
// module.exports = db; // This line should be removed as db is managed by dbService
