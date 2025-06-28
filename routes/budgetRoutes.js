const express = require("express")
const router = express.router();
const budgetController = require('../controllers/budgetController');

router.post('/create-budget', budgetController.createBudget);
router.get('/get-budget:id', budgetController.getBudget);
router.get('/get-budgets', budgetController.getBudgets);
router.put('/edit-budget:id', budgetController.updateBudget);
router.delete('/delete-budget:id', Controller.deleteBudget);

module.exports = router;