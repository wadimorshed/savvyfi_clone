//Database initialization/connection
const db = require('./db');

exports.createTransaction = async (req, res) => {
    const {
        type,
        category,
        amount,
        desc,
        method,
        date,
        recurring,
        receipt,
        tags,
        budgetCat,
    } = req.body;  

    if(!type || !category || !amount || !date || !recurring)
        return res.status(400).json({ error: "Not all necessary fields are filled in" });

    try {
        const budgetCheck = await db.query('SELECT id FROM Budgets WHERE category = ?', [budgetCat]);
        budgetId = budgetCheck[0]?.id;

        const newTransaction = await db.query(
            'INSERT INTO Transactions (user_id, type, category, amount, description, payment_method, transaction_date, created_at, updated_at, is_recurring, receipt_url, tags, budget_id) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?)',
            [req.user.userId, type, category, amount, desc, method, date, recurring, receipt, tags, budgetId]
        );
        return res.status(201).json({ message: "Transaction created" });
    } catch(error) {
        return res.status(500).json({ error: "Failed to create the transaction" });
    }
};

exports.getTransaction = async (req, res) => {
    const transactionId = req.params.id;

    if (!transactionId)
        return res.status(400).json({ error: 'Transaction ID is required' });

    try {
        const result = await db.query('SELECT * FROM Transactions WHERE id = ?', [transactionId]);

        if (result.length == 0)
            return res.status(404).json({ message: 'Transaction not found.' });

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
};

exports.getTransactions = async (req, res) => {
    const userId = req.user.userId;

    if (!userId)
        return res.status(400).json({ error: 'User ID is required' });

    try {
        const results = await db.query('SELECT * FROM Transactions WHERE user_id = ?', [userId]);

        if (results.length == 0)
            return res.status(404).json({ message: 'No transactions found.' });

        res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
};

exports.updateTransaction = async (req, res) => {
    const transactionId = req.params.id;

    if (!transactionId)
        return res.status(400).json({ error: 'Transaction ID is required' });

    const {
        type,
        category,
        amount,
        desc,
        method,
        date,
        recurring,
        receipt,
        tags,
        budgetCat,
    } = req.body;

    try {
        const budgetCheck = await db.query('SELECT id FROM Budgets WHERE category = ?', [budgetCat]);
        budgetId = budgetCheck[0]?.id;

        const result = await db.query(
            'UPDATE Transactions SET type = ?, category = ?, amount = ?, description = ?, payment_method = ?, transaction_date = ?, updated_at = ?, is_recurring = ?, receipt_url = ?, tags = ? WHERE id = ?', 
            [type, category, amount, desc, method, date, CURRENT_TIMESTAMP, recurring, receipt, tags, budgetId, transactionId]
        );

        if (result.affectedRows == 0)
            return res.status(404).json({ message: 'Transaction not able to be updated' });

        res.status(200).json({ message: "Transaction updated" });
    } catch (error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
};

exports.deleteTransaction = async (req, res) => {
    const transactionId = req.params.id;

    if (!transactionId)
        return res.status(400).json({ error: 'Transaction ID is required' });

    try {
        const result = await db.query('DELETE FROM Transactions WHERE id = ?', [transactionId]);

        if(result.affectedRows == 0)
            return res.status(404).json({ error: 'Transaction unable to be deleted' });

        return res.status(200).json({ message: 'Transaction deleted' });
    } catch(error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
}; 
