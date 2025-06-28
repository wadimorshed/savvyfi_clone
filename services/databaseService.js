// server/services/databaseService.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Determine the database file path.
// It's good practice to make this configurable or relative to the server root.
// Based on your README, 'finance.db' is in 'server/data/'.
const DB_PATH = path.join(__dirname, '../data', 'finance.db');

let db; // Global variable to hold the database connection

/**
 * Initializes the SQLite database connection and creates tables if they don't exist.
 * This function should be called once when the server starts.
 */
async function initializeDatabase() {
    return new Promise((resolve, reject) => {
        // Open the database connection. sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE
        // ensures that if the file doesn't exist, it will be created.
        db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
            if (err) {
                console.error('Error opening database:', err.message);
                return reject(err);
            }
            console.log('Connected to the SQLite database.');

            // Run SQL to create tables. Using IF NOT EXISTS prevents errors if tables already exist.
            db.serialize(() => {
                db.run(`
                    CREATE TABLE IF NOT EXISTS users (
                        id TEXT PRIMARY KEY,
                        username TEXT UNIQUE NOT NULL,
                        email TEXT UNIQUE NOT NULL,
                        passwordHash TEXT NOT NULL,
                        createdAt TEXT NOT NULL,
                        lastLogin TEXT
                    );
                `, (err) => {
                    if (err) { console.error('Error creating users table:', err.message); return reject(err); }
                    console.log('Users table checked/created.');
                });

                db.run(`
                    CREATE TABLE IF NOT EXISTS transactions (
                        id TEXT PRIMARY KEY,
                        userId TEXT NOT NULL,
                        type TEXT NOT NULL, -- 'income' or 'expense'
                        category TEXT NOT NULL,
                        amount REAL NOT NULL,
                        date TEXT NOT NULL,
                        description TEXT,
                        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
                    );
                `, (err) => {
                    if (err) { console.error('Error creating transactions table:', err.message); return reject(err); }
                    console.log('Transactions table checked/created.');
                });

                db.run(`
                    CREATE TABLE IF NOT EXISTS goals (
                        id TEXT PRIMARY KEY,
                        userId TEXT NOT NULL,
                        name TEXT NOT NULL,
                        targetAmount REAL NOT NULL,
                        currentAmount REAL DEFAULT 0.0,
                        startDate TEXT NOT NULL,
                        targetDate TEXT,
                        status TEXT DEFAULT 'In Progress',
                        type TEXT NOT NULL, -- 'savings', 'debt', 'investment'
                        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
                    );
                `, (err) => {
                    if (err) { console.error('Error creating goals table:', err.message); return reject(err); }
                    console.log('Goals table checked/created.');
                });

                db.run(`
                    CREATE TABLE IF NOT EXISTS budgets (
                        id TEXT PRIMARY KEY,
                        userId TEXT NOT NULL,
                        category TEXT NOT NULL,
                        limitAmount REAL NOT NULL, -- Renamed from 'limit' to avoid SQL keyword conflict
                        spent REAL DEFAULT 0.0,
                        period TEXT NOT NULL, -- 'monthly', 'weekly', 'yearly'
                        startDate TEXT NOT NULL,
                        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
                    );
                `, (err) => {
                    if (err) { console.error('Error creating budgets table:', err.message); return reject(err); }
                    console.log('Budgets table checked/created.');
                    resolve(); // Resolve the promise once all tables are checked/created
                });
            });
        });
    });
}

/**
 * Executes a single SQL query and returns the result (for SELECT queries).
 * @param {string} sql - The SQL query string.
 * @param {Array} params - Parameters to bind to the query.
 * @returns {Promise<Array>} - A promise that resolves with an array of rows.
 */
function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) {
                console.error('Error running SQL (all):', err.message);
                reject(err);
            } else {
                resolve(rows);
            }
        });
    });
}

/**
 * Executes a single SQL query (for INSERT, UPDATE, DELETE).
 * @param {string} sql - The SQL query string.
 * @param {Array} params - Parameters to bind to the query.
 * @returns {Promise<Object>} - A promise that resolves with result info (e.g., lastID, changes).
 */
function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) {
                console.error('Error running SQL (run):', err.message);
                reject(err);
            } else {
                resolve({ lastID: this.lastID, changes: this.changes });
            }
        });
    });
}

/**
 * Closes the database connection.
 */
function closeDatabase() {
    if (db) {
        db.close((err) => {
            if (err) {
                console.error('Error closing database:', err.message);
            }
            console.log('Closed the database connection.');
        });
    }
}

module.exports = {
    initializeDatabase,
    all,
    run,
    closeDatabase
};
