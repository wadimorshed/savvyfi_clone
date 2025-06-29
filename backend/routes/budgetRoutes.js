    // server/routes/budgetRoutes.js

    const express = require('express');
    const router = express.Router();
    const budgetController = require('../controllers/budgetController');

    // Define budget-related API endpoints
    router.post('/create', budgetController.createBudget);             // Create a new budget
    router.get('/all/:userId', budgetController.getBudgetsByUserId); // Get all budgets for a specific user
    router.get('/:id', budgetController.getBudgetById);          // Get a single budget by ID
    router.put('/update/:id', budgetController.updateBudget);           // Update an existing budget
    router.delete('/delete/:id', budgetController.deleteBudget);        // Delete a budget

    module.exports = router;
    