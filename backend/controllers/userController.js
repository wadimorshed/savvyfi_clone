    // server/controllers/userController.js

    const db = require('../services/databaseService');
    const bcrypt = require('bcryptjs'); // For password hashing
    const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

    // --- Helper for creating a user (used by signup) ---
    async function createUser(username, email, password) {
        const id = uuidv4();
        const hashedPassword = await bcrypt.hash(password, 10); // Hash password with salt rounds
        const createdAt = new Date().toISOString();

        const sql = `INSERT INTO users (id, username, email, passwordHash, createdAt) VALUES (?, ?, ?, ?, ?)`;
        const params = [id, username, email, hashedPassword, createdAt];

        try {
            await db.run(sql, params);
            console.log(`User ${username} created.`);
            return { id, username, email, createdAt }; // Return relevant user info, not password hash
        } catch (err) {
            if (err.message.includes('UNIQUE constraint failed')) {
                throw new Error('Username or email already exists.');
            }
            throw new Error('Failed to create user: ' + err.message);
        }
    }

    // --- Controller functions ---

    // Register/Signup a new user
    exports.registerUser = async (req, res) => {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({ message: 'Username, email, and password are required.' });
        }

        try {
            const newUser = await createUser(username, email, password);
            res.status(201).json({ message: 'User registered successfully!', user: newUser });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    };

    // Login a user (simplified for example, would involve JWT in a real app)
    exports.loginUser = async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        try {
            const user = await db.all('SELECT * FROM users WHERE email = ?', [email]);
            if (user.length === 0) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            const hashedPassword = user[0].passwordHash;
            const isMatch = await bcrypt.compare(password, hashedPassword);

            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid credentials.' });
            }

            // Update last login time
            await db.run('UPDATE users SET lastLogin = ? WHERE id = ?', [new Date().toISOString(), user[0].id]);

            // In a real app, you'd generate and send a JWT token here.
            res.status(200).json({ message: 'Login successful!', user: { id: user[0].id, username: user[0].username, email: user[0].email } });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login.' });
        }
    };

    // Get all users (for admin purposes or testing)
    exports.getAllUsers = async (req, res) => {
        try {
            const users = await db.all('SELECT id, username, email, createdAt, lastLogin FROM users');
            res.status(200).json(users);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving users: ' + error.message });
        }
    };

    // Get a user by ID
    exports.getUserById = async (req, res) => {
        const { id } = req.params;
        try {
            const user = await db.all('SELECT username, email, createdAt, lastLogin FROM users WHERE id = ?', [id]);
            if (user.length === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json(user[0]);
        } catch (error) {
            res.status(500).json({ message: 'Error retrieving user: ' + error.message });
        }
    };

    // Update a user (e.g., change username/email)
    exports.updateUser = async (req, res) => {
        const { id } = req.params;
        const { username, email } = req.body; // Password change would be a separate endpoint

        if (!username && !email) {
            return res.status(400).json({ message: 'No fields provided for update.' });
        }

        let updates = [];
        let params = [];

        if (username) {
            updates.push('username = ?');
            params.push(username);
        }
        if (email) {
            updates.push('email = ?');
            params.push(email);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: 'No valid fields to update.' });
        }

        params.push(id); // Add ID for the WHERE clause

        const sql = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;

        try {
            const result = await db.run(sql, params);
            if (result.changes === 0) {
                return res.status(404).json({ message: 'User not found or no changes made.' });
            }
            res.status(200).json({ message: 'User updated successfully!' });
        } catch (error) {
            if (error.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({ message: 'Username or email already taken.' });
            }
            res.status(500).json({ message: 'Error updating user: ' + error.message });
        }
    };

    // Delete a user
    exports.deleteUser = async (req, res) => {
        const { id } = req.params;
        try {
            const result = await db.run('DELETE FROM users WHERE id = ?', [id]);
            if (result.changes === 0) {
                return res.status(404).json({ message: 'User not found.' });
            }
            res.status(200).json({ message: 'User deleted successfully!' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting user: ' + error.message });
        }
    };
    