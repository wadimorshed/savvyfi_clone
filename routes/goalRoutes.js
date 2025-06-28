const express = require('express');
const router = express.router();
const goalController = '../controllers/goalController';

router.post('/create-goal', goalController.createGoal);
router.get('/get-goal:id', goalController.getGoal);
router.get('/get-goals', goalController.getGoals);
router.put('/edit-goal:id', goalController.updateGoal);
router.delete('/delete-goal:id', goalController.deleteGoal);

module.exports = router;