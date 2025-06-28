    // server/routes/budgetRoutes.js

    const express = require('express');
    const router = express.Router();
    const budgetController = require('../controllers/budgetController');

    // Define budget-related API endpoints
    router.post('/', budgetController.createBudget);             // Create a new budget
    router.get('/user/:userId', budgetController.getBudgetsByUserId); // Get all budgets for a specific user
    router.get('/:id', budgetController.getBudgetById);          // Get a single budget by ID
    router.put('/:id', budgetController.updateBudget);           // Update an existing budget
    router.delete('/:id', budgetController.deleteBudget);        // Delete a budget

    module.exports = router;
    