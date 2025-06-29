// server/routes/transactionRoutes.js

const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');

// Define transaction-related API endpoints
router.post('/create', transactionController.createTransaction);                 // Create a new transaction
router.get('/all/:userId', transactionController.getTransactionsByUserId); // Get all transactions for a specific user
router.get('/:id', transactionController.getTransactionById);              // Get a single transaction by ID
router.put('/update/:id', transactionController.updateTransaction);               // Update an existing transaction
router.delete('/delete/:id', transactionController.deleteTransaction);            // Delete a transaction

module.exports = router;