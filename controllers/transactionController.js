//Database initialization/connection
const db = require('./db');

//201 - transaction created
//400 - missing needed fields
//500 - error
exports.createTransaction = async (req, res) => {
    //sets info to the body
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

    //checks if any needed fields are empty
    if(!type || !category || !amount || !date || !recurring)
        return res.status(400).json({ error: "Not all necessary fields are filled in" });

    try {
        //gets budgetId from the the category
        const budgetCheck = await db.query('SELECT id FROM Budgets WHERE category = ?', [budgetCat]);
        budgetId = budgetCheck[0]?.id;

        //inserts new transaction
        const newTransaction = await db.query(
            'INSERT INTO Transactions (user_id, type, category, amount, description, payment_method, transaction_date, created_at, updated_at, is_recurring, receipt_url, tags, budget_id) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, ?, ?, ?, ?)',
            [req.user.userId, type, category, amount, desc, method, date, recurring, receipt, tags, budgetId]
        );
        return res.status(201).json({ message: "Transaction created" });
    } catch(error) {
        return res.status(500).json({ error: "Failed to create the transaction" });
    }
};

//200 - transaction gotten
//400 - missing transaction id
//404 - nothing found
//500 - error
exports.getTransaction = async (req, res) => {
    //gets transaction id from request
    const transactionId = req.params.id;

    //checks if id is gotten
    if (!transactionId)
        return res.status(400).json({ error: 'Transaction ID is required' });

    try {
        //gets transaction from database
        const result = await db.query('SELECT * FROM Transactions WHERE id = ?', [transactionId]);

        //checks if anything was found
        if (result.length == 0)
            return res.status(404).json({ message: 'Transaction not found.' });

        res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
};

//200 - transactions gotten
//400 - missing user id
//404 - nothing found
//500 - error
exports.getTransactions = async (req, res) => {
    //gets user id from request
    const userId = req.user.userId;

    //checks if user id is gotten
    if (!userId)
        return res.status(400).json({ error: 'User ID is required' });

    try {
        //finds all transactions for the user
        const results = await db.query('SELECT * FROM Transactions WHERE user_id = ?', [userId]);

        //checks if anything is found
        if (results.length == 0)
            return res.status(404).json({ message: 'No transactions found.' });

        res.status(200).json(results);
    } catch (error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
};

//200 - updated
//400 - missing id
//404 - update failed
//500 - error
exports.updateTransaction = async (req, res) => {
    //gets transaction id from request
    const transactionId = req.params.id;

    //checks if transaction id is gotten
    if (!transactionId)
        return res.status(400).json({ error: 'Transaction ID is required' });

    //sets all editable types to request body
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
        //gets budgetId from the budget category
        const budgetCheck = await db.query('SELECT id FROM Budgets WHERE category = ?', [budgetCat]);
        budgetId = budgetCheck[0]?.id;

        //finds and updates the transaction
        const result = await db.query(
            'UPDATE Transactions SET type = ?, category = ?, amount = ?, description = ?, payment_method = ?, transaction_date = ?, updated_at = ?, is_recurring = ?, receipt_url = ?, tags = ? WHERE id = ?', 
            [type, category, amount, desc, method, date, CURRENT_TIMESTAMP, recurring, receipt, tags, budgetId, transactionId]
        );

        //checks if a transaction was updated
        if (result.affectedRows == 0)
            return res.status(404).json({ message: 'Transaction not able to be updated' });

        res.status(200).json({ message: "Transaction updated" });
    } catch (error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
};

//200 - transaction deleted
//400 - missing transaction id
//404 - deletion failed
//500 - error
exports.deleteTransaction = async (req, res) => {
    //transaction id gotten from request
    const transactionId = req.params.id;

    //checks if transaction id is gotten
    if (!transactionId)
        return res.status(400).json({ error: 'Transaction ID is required' });

    try {
        //deletes the transaction
        const result = await db.query('DELETE FROM Transactions WHERE id = ?', [transactionId]);

        //checks if transaction was deleted
        if(result.affectedRows == 0)
            return res.status(404).json({ error: 'Transaction unable to be deleted' });

        return res.status(200).json({ message: 'Transaction deleted' });
    } catch(error) {
        return res.status(500).json({ error: 'Database error occurred.'});
    }
}; 
