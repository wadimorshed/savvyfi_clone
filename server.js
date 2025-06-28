require('dotenv').config();

//External dependencies
const express = require("express");
const cors = require("cors");
const port = process.env.PORT || 5000;

//Database dependencies
const sqlite = require("sqlite3");
const db = new sqlite3.Database('./finance.db');

//Express
const app = express();

//Middleware
app.use(cors);
app.use(express.json());

//Users
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

//Budgets
const budgetRoutes = require('./routes/budgetRoutes');
app.use('/api/budgets', budgetRoutes);

//Goals
const goalRoutes = require('./routes/goalRoutes');
app.use('/api/goals', goalRoutes);

//Transactions
const transactionRoutes = require('./routes/transactionRoutes');
app.use('/api/transactions', transactionRoutes);

//AI
const aiRoutes = require('./routes/aiRoutes');
app.use('/api/ai', aiRoutes);

app.listen(port);

module.exports = db;