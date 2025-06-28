    // server/controllers/budgetController.js

    const db = require('../services/databaseService');
    const { v4: uuidv4 } = require('uuid');

    // Create a new budget
    exports.createBudget = async (req, res) => {
        const { userId, category, limitAmount, spent = 0, period, startDate } = req.body;
        const id = uuidv4();

        if (!userId || !category || !limitAmount || !period || !startDate) {
            return res.status(400).json({ message: 'Missing required budget fields.' });
        }
        if (period !== 'monthly' && period !== 'weekly' && period !== 'yearly') {
            return res.status(400).json({ message: 'Budget period must be "monthly", "weekly", or "yearly".' });
        }

        try {
            // Optional: Check if a budget for this user/category/period already exists to avoid duplicates
            const existingBudget = await db.all('SELECT id FROM budgets WHERE userId = ? AND category = ? AND period = ?', [userId, category, period]);
            if (existingBudget.length > 0) {
                return res.status(409).json({ message: 'A budget for this category and period already exists for this user.' });
            }

            const sql = `INSERT INTO budgets (id, userId, category, limitAmount, spent, period, startDate) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const params = [id, userId, category, limitAmount, spent, period, startDate];
            await db.run(sql, params);
            res.status(201).json({ message: 'Budget created successfully!', budget: { id, userId, category, limitAmount, spent, period, startDate } });
        } catch (error) {
            console.error('Error creating budget:', error.message);
            res.status(500).json({ message: 'Error creating budget: ' + error.message });
        }
    };

    // Get all budgets for a specific user
    exports.getBudgetsByUserId = async (req, res) => {
        const { userId } = req.params;
        try {
            const budgets = await db.all('SELECT * FROM budgets WHERE userId = ?', [userId]);
            res.status(200).json(budgets);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving budgets: ' + error.message });
        }
    };

    // Get a single budget by ID
    exports.getBudgetById = async (req, res) => {
        const { id } = req.params;
        try {
            const budget = await db.all('SELECT * FROM budgets WHERE id = ?', [id]);
            if (budget.length === 0) {
                return res.status(404).json({ message: 'Budget not found.' });
            }
            res.status(200).json(budget[0]);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving budget: ' + error.message });
        }
    };

    // Update a budget
    exports.updateBudget = async (req, res) => {
        const { id } = req.params;
        const { category, limitAmount, spent, period, startDate } = req.body;

        let updates = [];
        let params = [];

        if (category) { updates.push('category = ?'); params.push(category); }
        if (limitAmount !== undefined && limitAmount !== null) { updates.push('limitAmount = ?'); params.push(limitAmount); }
        if (spent !== undefined && spent !== null) { updates.push('spent = ?'); params.push(spent); }
        if (period) {
            if (period !== 'monthly' && period !== 'weekly' && period !== 'yearly') {
                return res.status(400).json({ message: 'Budget period must be "monthly", "weekly", or "yearly".' });
            }
            updates.push('period = ?'); params.push(period);
        }
        if (startDate) { updates.push('startDate = ?'); params.push(startDate); }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        params.push(id);

        const sql = `UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`;

        try {
            const result = await db.run(sql, params);
            if (result.changes === 0) {
                return res.status(404).json({ message: 'Budget not found or no changes made.' });
            }
            res.status(200).json({ message: 'Budget updated successfully!' });
        } catch (error) {
            console.error('Error updating budget:', error.message);
            res.status(500).json({ message: 'Error updating budget: ' + error.message });
        }
    };

    // Delete a budget
    exports.deleteBudget = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.run('DELETE FROM budgets WHERE id = ?', [id]);
            if (result.changes === 0) {
                return res.status(404).json({ message: 'Budget not found.' });
            }
            res.status(200).json({ message: 'Budget deleted successfully!' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting budget: ' + error.message });
        }
    };
    