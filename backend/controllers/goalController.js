// server/controllers/goalController.js

const db = require('../services/databaseService');

// Create a new goal
exports.createGoal = async (req, res) => {
    const { userId, type, name, target, current, duedate, status, recurrence, notes } = req.body;

    if (!userId || !name || !target || !duedate || !type) {
        return res.status(400).json({ message: 'Missing required goal fields.' });
    }

    try {
        const sql = `INSERT INTO goals (user_id, goal_type, name, target_amount, current_amount, due_date, status, recurrence, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const params = [userId, type, name, target, current, duedate, status, recurrence, notes];
        await db.run(sql, params);
        res.status(201).json({ message: 'Goal created successfully!', goal: { userId, type, name, target, current, duedate, status, recurrence, notes } });
    } catch (error) {
        console.error('Error creating goal:', error.message);
        res.status(500).json({ message: 'Error creating goal: ' + error.message });
    }
};

// Get all goals for a specific user
exports.getGoalsByUserId = async (req, res) => {
    const { userId } = req.params;
    try {
        const goals = await db.all('SELECT * FROM goals WHERE user_id = ? ORDER BY targetDate ASC', [userId]);
        res.status(200).json(goals);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving goals: ' + error.message });
    }
};

// Get a single goal by ID
exports.getGoalById = async (req, res) => {
    const { id } = req.params;
    try {
        const goal = await db.all('SELECT * FROM goals WHERE id = ?', [id]);
        if (goal.length === 0) {
            return res.status(404).json({ message: 'Goal not found.' });
        }
        res.status(200).json(goal[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving goal: ' + error.message });
    }
};

// Update a goal
exports.updateGoal = async (req, res) => {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, startDate, targetDate, status, type } = req.body;

    let updates = [];
    let params = [];

    if (name) { updates.push('name = ?'); params.push(name); }
    if (targetAmount !== undefined && targetAmount !== null) { updates.push('targetAmount = ?'); params.push(targetAmount); }
    if (currentAmount !== undefined && currentAmount !== null) { updates.push('currentAmount = ?'); params.push(currentAmount); }
    if (startDate) { updates.push('startDate = ?'); params.push(startDate); }
    if (targetDate !== undefined) { updates.push('targetDate = ?'); params.push(targetDate); }
    if (status) { updates.push('status = ?'); params.push(status); }
    if (type) { updates.push('type = ?'); params.push(type); }

    if (updates.length === 0) {
        return res.status(400).json({ message: 'No fields provided for update.' });
    }

    params.push(id);

    const sql = `UPDATE goals SET ${updates.join(', ')} WHERE id = ?`;

    try {
        const result = await db.run(sql, params);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Goal not found or no changes made.' });
        }
        res.status(200).json({ message: 'Goal updated successfully!' });
    } catch (error) {
        console.error('Error updating goal:', error.message);
        res.status(500).json({ message: 'Error updating goal: ' + error.message });
    }
};

// Delete a goal
exports.deleteGoal = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.run('DELETE FROM goals WHERE id = ?', [id]);
        if (result.changes === 0) {
            return res.status(404).json({ message: 'Goal not found.' });
        }
        res.status(200).json({ message: 'Goal deleted successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting goal: ' + error.message });
    }
};