    // server/routes/aiRoutes.js

    const express = require('express');
    const router = express.Router();
    const aiController = require('../controllers/aiController');

    // Define AI assistant related API endpoints
    router.post('/chat', aiController.getAssistantResponse);        // Send message to AI and get response
    router.post('/suggestions/budget', aiController.getBudgetSuggestions); // Get AI-generated budget suggestions

    module.exports = router;
    