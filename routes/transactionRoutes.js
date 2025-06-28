const express = require('express');
const router = express.router();
const transactionController = '../controllers/transactionController';

router.post('/create-transaction', transactionController.createTransaction);
router.get('/get-transaction:id', transactionController.getTransaction);
router.get('/get-transactions', transactionController.getTransactions);
router.put('/edit-transaction:id', transactionController.updateTransaction);
router.delete('/delete-transaction:id', transactionController.deleteTransaction);

module.exports = router;