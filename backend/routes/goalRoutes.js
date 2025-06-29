    // server/routes/goalRoutes.js

    const express = require('express');
    const router = express.Router();
    const goalController = require('../controllers/goalController');

    // Define goal-related API endpoints
    router.post('/create', goalController.createGoal);             // Create a new goal
    router.get('/all/:userId', goalController.getGoalsByUserId); // Get all goals for a specific user
    router.get('/:id', goalController.getGoalById);          // Get a single goal by ID
    router.put('/update/:id', goalController.updateGoal);           // Update an existing goal
    router.delete('/delete/:id', goalController.deleteGoal);        // Delete a goal

    module.exports = router;
    