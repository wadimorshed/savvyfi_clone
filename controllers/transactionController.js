    // server/controllers/transactionController.js

    const db = require('../services/databaseService');
    const { v4: uuidv4 } = require('uuid');

    // Create a new transaction
    exports.createTransaction = async (req, res) => {
        const { userId, type, category, amount, date, description } = req.body;
        const id = uuidv4();

        if (!userId || !type || !category || !amount || !date) {
            return res.status(400).json({ message: 'Missing required transaction fields.' });
        }
        if (type !== 'income' && type !== 'expense') {
            return res.status(400).json({ message: 'Transaction type must be "income" or "expense".' });
        }

        try {
            const sql = `INSERT INTO transactions (id, userId, type, category, amount, date, description) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const params = [id, userId, type, category, amount, date, description || null];
            await db.run(sql, params);
            res.status(201).json({ message: 'Transaction created successfully!', transaction: { id, userId, type, category, amount, date, description } });
        } catch (error) {
            console.error('Error creating transaction:', error.message);
            res.status(500).json({ message: 'Error creating transaction: ' + error.message });
        }
    };

    // Get all transactions for a specific user
    exports.getTransactionsByUserId = async (req, res) => {
        const { userId } = req.params; // Assuming userId is passed as a URL parameter
        try {
            const transactions = await db.all('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC', [userId]);
            res.status(200).json(transactions);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving transactions: ' + error.message });
        }
    };

    // Get a single transaction by ID
    exports.getTransactionById = async (req, res) => {
        const { id } = req.params;
        try {
            const transaction = await db.all('SELECT * FROM transactions WHERE id = ?', [id]);
            if (transaction.length === 0) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }
            res.status(200).json(transaction[0]);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving transaction: ' + error.message });
        }
    };

    // Update a transaction
    exports.updateTransaction = async (req, res) => {
        const { id } = req.params;
        const { type, category, amount, date, description } = req.body;

        let updates = [];
        let params = [];

        if (type) {
            if (type !== 'income' && type !== 'expense') {
                return res.status(400).json({ message: 'Transaction type must be "income" or "expense".' });
            }
            updates.push('type = ?');
            params.push(type);
        }
        if (category) { updates.push('category = ?'); params.push(category); }
        if (amount !== undefined && amount !== null) { updates.push('amount = ?'); params.push(amount); }
        if (date) { updates.push('date = ?'); params.push(date); }
        if (description !== undefined) { updates.push('description = ?'); params.push(description); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        params.push(id); // Add ID for the WHERE clause

        const sql = `UPDATE transactions SET ${updates.join(', ')} WHERE id = ?`;

        try {
            const result = await db.run(sql, params);
            if (result.changes === 0) {
                return res.status(404).json({ message: 'Transaction not found or no changes made.' });
            }
            res.status(200).json({ message: 'Transaction updated successfully!' });
        } catch (error) {
            console.error('Error updating transaction:', error.message);
            res.status(500).json({ message: 'Error updating transaction: ' + error.message });
        }
    };

    // Delete a transaction
    exports.deleteTransaction = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.run('DELETE FROM transactions WHERE id = ?', [id]);
            if (result.changes === 0) {
                return res.status(404).json({ message: 'Transaction not found.' });
            }
            res.status(200).json({ message: 'Transaction deleted successfully!' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting transaction: ' + error.message });
        }
    };
    