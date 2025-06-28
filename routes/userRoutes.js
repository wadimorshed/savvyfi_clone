    // server/routes/userRoutes.js

    const express = require('express');
    const router = express.Router();
    const userController = require('../controllers/userController');

    // Define user-related API endpoints
    router.post('/register', userController.registerUser); // Register a new user
    router.post('/login', userController.loginUser);       // Login an existing user

    router.get('/', userController.getAllUsers);           // Get all users (e.g., for admin)
    router.get('/:id', userController.getUserById);        // Get a specific user by ID
    router.put('/:id', userController.updateUser);         // Update a user's details
    router.delete('/:id', userController.deleteUser);      // Delete a user

    module.exports = router;
    