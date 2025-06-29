import Database from "better-sqlite3"
import path from "path"
import fs from "fs"

let db = null

// Add better error handling and debugging to getDatabase function
function getDatabase() {
  if (db) return db

  // Use environment variable or default to finance.db in project root
  const dbPath = process.env.DATABASE_PATH || path.join(process.cwd(), "finance.db")

  console.log("🗄️ Database path:", dbPath)
  console.log("📁 Current working directory:", process.cwd())

  // Check if the database file exists
  if (!fs.existsSync(dbPath)) {
    console.log("❌ Database file not found, creating new one at:", dbPath)
  } else {
    console.log("✅ Using existing database file:", dbPath)
    const stats = fs.statSync(dbPath)
    console.log("📊 Database file size:", stats.size, "bytes")
    console.log("📅 Database last modified:", stats.mtime)
  }

  try {
    db = new Database(dbPath)
    console.log("✅ Database connection established")

    // Enable WAL mode for better performance
    db.pragma("journal_mode = WAL")

    // Test the database connection
    const testQuery = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
    console.log(
      "📋 Available tables:",
      testQuery.map((t) => t.name),
    )

    // Check if we have the new schema or need to initialize
    const hasNewSchema = testQuery.some((t) => t.name === "transactions")
    if (!hasNewSchema) {
      console.log("🔄 Initializing new database schema...")
      initializeDatabase()
    } else {
      console.log("✅ Using existing database schema")
    }

    return db
  } catch (error) {
    console.error("❌ Database connection failed:", error)
    throw error
  }
}

function initializeDatabase() {
  console.log("Initializing database schema based on provided structure...")

  // Create users table (updated schema)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      phone TEXT,
      onboarding_complete BOOLEAN DEFAULT 0,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Create transactions table
  db.exec(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      type TEXT CHECK(type IN ('income', 'expense')) NOT NULL,
      category TEXT NOT NULL,
      amount REAL NOT NULL CHECK(amount >= 0),
      description TEXT,
      payment_method TEXT,
      transaction_date DATE NOT NULL DEFAULT (DATE('now')),
      is_recurring BOOLEAN DEFAULT 0,
      receipt_url TEXT,
      tags TEXT,
      budget_id INTEGER,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (budget_id) REFERENCES budgets(id) ON DELETE SET NULL
    )
  `)

  // Create budgets table
  db.exec(`
    CREATE TABLE IF NOT EXISTS budgets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      category TEXT NOT NULL,
      amount_limit REAL NOT NULL CHECK(amount_limit >= 0),
      spent_amount REAL DEFAULT 0 CHECK(spent_amount >= 0),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      frequency TEXT DEFAULT 'monthly',
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'expired', 'cancelled')),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create goals table
  db.exec(`
    CREATE TABLE IF NOT EXISTS goals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      goal_type TEXT CHECK(goal_type IN ('savings', 'debt')) NOT NULL,
      name TEXT NOT NULL,
      target_amount REAL NOT NULL CHECK(target_amount >= 0),
      current_amount REAL DEFAULT 0 CHECK(current_amount >= 0),
      due_date DATE,
      status TEXT DEFAULT 'in_progress' CHECK(status IN ('in_progress', 'achieved', 'cancelled')),
      recurrence TEXT,
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create reminders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS reminders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      type TEXT CHECK(type IN ('bill', 'subscription', 'alert')) NOT NULL,
      amount REAL DEFAULT NULL CHECK(amount >= 0),
      due_date DATE NOT NULL,
      frequency TEXT DEFAULT 'monthly',
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'paid', 'cancelled')),
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create achievements table
  db.exec(`
    CREATE TABLE IF NOT EXISTS achievements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      badge_name TEXT NOT NULL,
      badge_type TEXT DEFAULT 'milestone',
      description TEXT,
      points INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create ai_logs table
  db.exec(`
    CREATE TABLE IF NOT EXISTS ai_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      session_id TEXT,
      prompt TEXT NOT NULL,
      response TEXT,
      feature_area TEXT,
      interaction_type TEXT DEFAULT 'chat',
      tokens_used INTEGER DEFAULT 0,
      model_name TEXT DEFAULT 'gemini',
      success BOOLEAN DEFAULT 1,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `)

  // Create triggers for updated_at timestamps
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS set_updated_at
    AFTER UPDATE ON users FOR EACH ROW
    BEGIN
      UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_transaction_timestamp
    AFTER UPDATE ON transactions FOR EACH ROW
    BEGIN
      UPDATE transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_budget_timestamp
    AFTER UPDATE ON budgets FOR EACH ROW
    BEGIN
      UPDATE budgets SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_reminder_timestamp
    AFTER UPDATE ON reminders FOR EACH ROW
    BEGIN
      UPDATE reminders SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_achievement_timestamp
    AFTER UPDATE ON achievements FOR EACH ROW
    BEGIN
      UPDATE achievements SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `)

  db.exec(`
    CREATE TRIGGER IF NOT EXISTS update_ai_log_timestamp
    AFTER UPDATE ON ai_logs FOR EACH ROW
    BEGIN
      UPDATE ai_logs SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
    END
  `)

  // Create indexes for better performance
  db.exec(`
    CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions (user_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions (type);
    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions (transaction_date);
    CREATE INDEX IF NOT EXISTS idx_budgets_user_id ON budgets (user_id);
    CREATE INDEX IF NOT EXISTS idx_goals_user_id ON goals (user_id);
    CREATE INDEX IF NOT EXISTS idx_reminders_user_id ON reminders (user_id);
    CREATE INDEX IF NOT EXISTS idx_achievements_user_id ON achievements (user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_logs_user_id ON ai_logs (user_id);
    CREATE INDEX IF NOT EXISTS idx_ai_logs_session ON ai_logs (session_id);
  `)

  console.log("Database schema initialized successfully")
}

// Database operations updated for new schema
export const dbOperations = {
  // User operations
  createUser: (name, email, password = "temp_password", phone = null) => {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO users (name, email, password, phone)
      VALUES (?, ?, ?, ?)
    `)
    return stmt.run(name, email, password, phone)
  },

  // Get or create user by email (for compatibility)
  getOrCreateUserByEmail: (email, name = "Default User") => {
    let user = db.prepare("SELECT * FROM users WHERE email = ?").get(email)
    if (!user) {
      const result = dbOperations.createUser(name, email)
      user = db.prepare("SELECT * FROM users WHERE id = ?").get(result.lastInsertRowid)
    }
    return user
  },

  // Transaction operations
  saveTransaction: (
    userId,
    type,
    category,
    amount,
    description,
    paymentMethod,
    transactionDate,
    isRecurring = false,
    tags = null,
    budgetId = null,
  ) => {
    const stmt = db.prepare(`
      INSERT INTO transactions 
      (user_id, type, category, amount, description, payment_method, transaction_date, is_recurring, tags, budget_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(
      userId,
      type,
      category,
      amount,
      description,
      paymentMethod,
      transactionDate,
      isRecurring,
      tags,
      budgetId,
    )
  },

  // Get user's transactions
  getUserTransactions: (userId, limit = 100, type = null) => {
    let query = `
      SELECT * FROM transactions 
      WHERE user_id = ?
    `
    const params = [userId]

    if (type) {
      query += ` AND type = ?`
      params.push(type)
    }

    query += ` ORDER BY transaction_date DESC, created_at DESC LIMIT ?`
    params.push(limit)

    const stmt = db.prepare(query)
    return stmt.all(...params)
  },

  // Get financial summary for user
  getFinancialSummary: (userId) => {
    const stmt = db.prepare(`
      SELECT 
        type,
        category,
        SUM(amount) as total_amount,
        COUNT(*) as count,
        AVG(amount) as avg_amount
      FROM transactions 
      WHERE user_id = ?
      GROUP BY type, category
      ORDER BY type, total_amount DESC
    `)
    return stmt.all(userId)
  },

  // Get monthly summary
  getMonthlySummary: (userId, year = null, month = null) => {
    let dateFilter = ""
    const params = [userId]

    if (year && month) {
      dateFilter = "AND strftime('%Y-%m', transaction_date) = ?"
      params.push(`${year}-${month.toString().padStart(2, "0")}`)
    } else if (year) {
      dateFilter = "AND strftime('%Y', transaction_date) = ?"
      params.push(year.toString())
    }

    const stmt = db.prepare(`
      SELECT 
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? ${dateFilter}
      GROUP BY type
    `)
    return stmt.all(...params)
  },

  // Budget operations
  createBudget: (userId, category, amountLimit, startDate, endDate, frequency = "monthly") => {
    const stmt = db.prepare(`
      INSERT INTO budgets (user_id, category, amount_limit, start_date, end_date, frequency)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(userId, category, amountLimit, startDate, endDate, frequency)
  },

  getUserBudgets: (userId, status = "active") => {
    const stmt = db.prepare(`
      SELECT * FROM budgets 
      WHERE user_id = ? AND status = ?
      ORDER BY created_at DESC
    `)
    return stmt.all(userId, status)
  },

  // Goal operations
  createGoal: (userId, goalType, name, targetAmount, dueDate = null, notes = null) => {
    const stmt = db.prepare(`
      INSERT INTO goals (user_id, goal_type, name, target_amount, due_date, notes)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(userId, goalType, name, targetAmount, dueDate, notes)
  },

  getUserGoals: (userId, status = "in_progress") => {
    const stmt = db.prepare(`
      SELECT * FROM goals 
      WHERE user_id = ? AND status = ?
      ORDER BY created_at DESC
    `)
    return stmt.all(userId, status)
  },

  // Reminder operations
  createReminder: (userId, title, type, amount, dueDate, frequency = "monthly", notes = null) => {
    const stmt = db.prepare(`
      INSERT INTO reminders (user_id, title, type, amount, due_date, frequency, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(userId, title, type, amount, dueDate, frequency, notes)
  },

  getUserReminders: (userId, status = "pending") => {
    const stmt = db.prepare(`
      SELECT * FROM reminders 
      WHERE user_id = ? AND status = ?
      ORDER BY due_date ASC
    `)
    return stmt.all(userId, status)
  },

  // AI logging
  logAIInteraction: (
    userId,
    sessionId,
    prompt,
    response,
    featureArea = "general",
    interactionType = "chat",
    tokensUsed = 0,
    modelName = "gemini",
    success = true,
  ) => {
    const stmt = db.prepare(`
      INSERT INTO ai_logs (user_id, session_id, prompt, response, feature_area, interaction_type, tokens_used, model_name, success)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return stmt.run(userId, sessionId, prompt, response, featureArea, interactionType, tokensUsed, modelName, success)
  },

  // Get user's historical data summary
  getUserHistoricalSummary: (userId) => {
    const transactionsStmt = db.prepare(`
      SELECT COUNT(*) as transaction_count, 
             MIN(transaction_date) as first_transaction,
             MAX(transaction_date) as last_transaction,
             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
      FROM transactions 
      WHERE user_id = ?
    `)

    const budgetsStmt = db.prepare(`
      SELECT COUNT(*) as budget_count,
             SUM(amount_limit) as total_budget_limit,
             SUM(spent_amount) as total_spent
      FROM budgets 
      WHERE user_id = ? AND status = 'active'
    `)

    const goalsStmt = db.prepare(`
      SELECT COUNT(*) as goal_count,
             SUM(target_amount) as total_target,
             SUM(current_amount) as total_progress
      FROM goals 
      WHERE user_id = ? AND status = 'in_progress'
    `)

    const transactions = transactionsStmt.get(userId)
    const budgets = budgetsStmt.get(userId)
    const goals = goalsStmt.get(userId)

    return {
      transactions,
      budgets,
      goals,
    }
  },

  // Get latest financial data (compatibility method)
  getLatestFinancialData: (userId) => {
    // Get recent transactions and format as text for compatibility
    const transactions = dbOperations.getUserTransactions(userId, 50)
    const summary = dbOperations.getFinancialSummary(userId)
    const budgets = dbOperations.getUserBudgets(userId)
    const goals = dbOperations.getUserGoals(userId)

    if (transactions.length === 0) {
      return null
    }

    // Format data as text for AI processing
    let formattedData = "=== FINANCIAL SUMMARY ===\n\n"

    // Income and expenses summary
    const income = summary.filter((s) => s.type === "income")
    const expenses = summary.filter((s) => s.type === "expense")

    if (income.length > 0) {
      formattedData += "INCOME:\n"
      income.forEach((item) => {
        formattedData += `- ${item.category}: $${item.total_amount.toFixed(2)} (${item.count} transactions)\n`
      })
      formattedData += "\n"
    }

    if (expenses.length > 0) {
      formattedData += "EXPENSES:\n"
      expenses.forEach((item) => {
        formattedData += `- ${item.category}: $${item.total_amount.toFixed(2)} (${item.count} transactions)\n`
      })
      formattedData += "\n"
    }

    // Recent transactions
    if (transactions.length > 0) {
      formattedData += "RECENT TRANSACTIONS:\n"
      transactions.slice(0, 10).forEach((t) => {
        formattedData += `- ${t.transaction_date}: ${t.type} - ${t.category} - $${t.amount} - ${t.description || "No description"}\n`
      })
      formattedData += "\n"
    }

    // Active budgets
    if (budgets.length > 0) {
      formattedData += "ACTIVE BUDGETS:\n"
      budgets.forEach((b) => {
        const percentage = ((b.spent_amount / b.amount_limit) * 100).toFixed(1)
        formattedData += `- ${b.category}: $${b.spent_amount}/$${b.amount_limit} (${percentage}% used)\n`
      })
      formattedData += "\n"
    }

    // Active goals
    if (goals.length > 0) {
      formattedData += "FINANCIAL GOALS:\n"
      goals.forEach((g) => {
        const percentage = ((g.current_amount / g.target_amount) * 100).toFixed(1)
        formattedData += `- ${g.name} (${g.goal_type}): $${g.current_amount}/$${g.target_amount} (${percentage}% complete)\n`
      })
    }

    return {
      id: "latest",
      user_id: userId,
      raw_data: formattedData,
      upload_date: new Date().toISOString(),
      filename: "Current Financial Data",
      file_type: "generated",
    }
  },

  // Compatibility methods for old API
  getUserUploads: (userId, limit = 10) => {
    // Return formatted transaction history as "uploads"
    const latestData = dbOperations.getLatestFinancialData(userId)
    return latestData ? [latestData] : []
  },

  // Database maintenance
  cleanup: () => {
    // Clean up old AI logs (keep last 1000 per user)
    db.exec(`
      DELETE FROM ai_logs 
      WHERE id NOT IN (
        SELECT id FROM ai_logs 
        ORDER BY created_at DESC 
        LIMIT 1000
      )
    `)

    // Vacuum database
    db.exec("VACUUM")
  },

  // Enhanced transaction saving with duplicate prevention
  saveTransactionSafe: (
    userId,
    type,
    category,
    amount,
    description,
    paymentMethod,
    transactionDate,
    isRecurring = false,
    tags = null,
    budgetId = null,
  ) => {
    // Check for duplicate transactions (same user, amount, category, date)
    const duplicateCheck = db
      .prepare(`
      SELECT id FROM transactions 
      WHERE user_id = ? AND type = ? AND category = ? AND amount = ? AND transaction_date = ?
      LIMIT 1
    `)
      .get(userId, type, category, amount, transactionDate)

    if (duplicateCheck) {
      console.log("Duplicate transaction detected, skipping:", { category, amount, transactionDate })
      return { lastInsertRowid: duplicateCheck.id, isDuplicate: true }
    }

    const stmt = db.prepare(`
      INSERT INTO transactions 
      (user_id, type, category, amount, description, payment_method, transaction_date, is_recurring, tags, budget_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `)
    return {
      ...stmt.run(
        userId,
        type,
        category,
        amount,
        description,
        paymentMethod,
        transactionDate,
        isRecurring,
        tags,
        budgetId,
      ),
      isDuplicate: false,
    }
  },

  // Add incremental data update
  addIncrementalData: (userId, newData, updateType = "manual_update") => {
    const transactions = parseFinancialDataWithDates(newData)
    let addedCount = 0
    let duplicateCount = 0

    for (const transaction of transactions) {
      const result = dbOperations.saveTransactionSafe(
        userId,
        transaction.type,
        transaction.category,
        transaction.amount,
        transaction.description,
        transaction.payment_method,
        transaction.date,
        transaction.is_recurring,
        `${transaction.tags || ""},${updateType}`,
      )

      if (result.isDuplicate) {
        duplicateCount++
      } else {
        addedCount++
      }
    }

    return { addedCount, duplicateCount, totalParsed: transactions.length }
  },

  // Get transaction history with date ranges
  getTransactionHistory: (userId, startDate = null, endDate = null, limit = 1000) => {
    let query = `
      SELECT * FROM transactions 
      WHERE user_id = ?
    `
    const params = [userId]

    if (startDate) {
      query += ` AND transaction_date >= ?`
      params.push(startDate)
    }

    if (endDate) {
      query += ` AND transaction_date <= ?`
      params.push(endDate)
    }

    query += ` ORDER BY transaction_date DESC, created_at DESC LIMIT ?`
    params.push(limit)

    const stmt = db.prepare(query)
    return stmt.all(...params)
  },

  // Get monthly breakdown for trends
  getMonthlyBreakdown: (userId, months = 12) => {
    const stmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', transaction_date) as month,
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? 
        AND transaction_date >= date('now', '-${months} months')
      GROUP BY strftime('%Y-%m', transaction_date), type
      ORDER BY month DESC, type
    `)
    return stmt.all(userId)
  },

  // Get spending trends by category
  getCategoryTrends: (userId, months = 6) => {
    const stmt = db.prepare(`
      SELECT 
        category,
        strftime('%Y-%m', transaction_date) as month,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ? 
        AND type = 'expense'
        AND transaction_date >= date('now', '-${months} months')
      GROUP BY category, strftime('%Y-%m', transaction_date)
      ORDER BY month DESC, total DESC
    `)
    return stmt.all(userId)
  },

  // Update existing transaction (for real updates, not additions)
  updateTransaction: (transactionId, updates) => {
    const allowedFields = ["category", "amount", "description", "payment_method", "transaction_date", "tags"]
    const setClause = []
    const params = []

    for (const [field, value] of Object.entries(updates)) {
      if (allowedFields.includes(field)) {
        setClause.push(`${field} = ?`)
        params.push(value)
      }
    }

    if (setClause.length === 0) {
      throw new Error("No valid fields to update")
    }

    params.push(transactionId)
    const stmt = db.prepare(`
      UPDATE transactions 
      SET ${setClause.join(", ")}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `)
    return stmt.run(...params)
  },

  // Enhanced historical summary with trends
  getUserHistoricalSummaryEnhanced: (userId) => {
    const transactionsStmt = db.prepare(`
      SELECT COUNT(*) as transaction_count, 
             MIN(transaction_date) as first_transaction,
             MAX(transaction_date) as last_transaction,
             SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
             SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
             COUNT(DISTINCT strftime('%Y-%m', transaction_date)) as months_with_data
      FROM transactions 
      WHERE user_id = ?
    `)

    const recentTrendsStmt = db.prepare(`
      SELECT 
        strftime('%Y-%m', transaction_date) as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as monthly_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as monthly_expenses
      FROM transactions 
      WHERE user_id = ? 
        AND transaction_date >= date('now', '-6 months')
      GROUP BY strftime('%Y-%m', transaction_date)
      ORDER BY month DESC
      LIMIT 6
    `)

    const topCategoriesStmt = db.prepare(`
      SELECT 
        category,
        type,
        SUM(amount) as total,
        COUNT(*) as count
      FROM transactions 
      WHERE user_id = ?
      GROUP BY category, type
      ORDER BY total DESC
      LIMIT 10
    `)

    const transactions = transactionsStmt.get(userId)
    const trends = recentTrendsStmt.all(userId)
    const topCategories = topCategoriesStmt.all(userId)

    // Calculate savings rate trend
    const savingsRates = trends.map((t) => ({
      month: t.month,
      savings_rate: t.monthly_income > 0 ? ((t.monthly_income - t.monthly_expenses) / t.monthly_income) * 100 : 0,
    }))

    return {
      transactions,
      trends,
      topCategories,
      savingsRates,
      budgets: dbOperations.getUserBudgets(userId),
      goals: dbOperations.getUserGoals(userId),
    }
  },
}

// Enhanced parsing function that preserves dates
function parseFinancialDataWithDates(text) {
  const transactions = []
  const lines = text.split("\n")

  let currentSection = null
  let currentDate = new Date().toISOString().split("T")[0] // Default to today

  for (const line of lines) {
    const trimmedLine = line.trim()
    if (!trimmedLine) continue

    // Look for date patterns
    const datePatterns = [
      /(\d{4}-\d{2}-\d{2})/, // YYYY-MM-DD
      /(\d{1,2}\/\d{1,2}\/\d{4})/, // MM/DD/YYYY
      /(\d{1,2}-\d{1,2}-\d{4})/, // MM-DD-YYYY
    ]

    for (const pattern of datePatterns) {
      const dateMatch = trimmedLine.match(pattern)
      if (dateMatch) {
        try {
          const parsedDate = new Date(dateMatch[1])
          if (!isNaN(parsedDate.getTime())) {
            currentDate = parsedDate.toISOString().split("T")[0]
          }
        } catch (e) {
          // Keep current date if parsing fails
        }
        break
      }
    }

    // Detect sections
    if (trimmedLine.toUpperCase().includes("INCOME")) {
      currentSection = "income"
      continue
    } else if (trimmedLine.toUpperCase().includes("EXPENSE") || trimmedLine.toUpperCase().includes("SPENDING")) {
      currentSection = "expense"
      continue
    }

    // Parse transaction lines (look for patterns like "- Category: $amount" or "Category: $amount")
    const patterns = [
      /^-?\s*([^:$]+):\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /^-?\s*([^$]+)\s+\$(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /^\s*([^$]+):\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/,
      /^(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4}).*?([^:$]+):\s*\$?(\d+(?:,\d{3})*(?:\.\d{2})?)/, // Date + transaction
    ]

    for (const pattern of patterns) {
      const match = trimmedLine.match(pattern)
      if (match) {
        let category,
          amount,
          lineDate = currentDate

        if (match.length === 4) {
          // Pattern with date
          lineDate = new Date(match[1]).toISOString().split("T")[0]
          category = match[2].trim().replace(/^-\s*/, "")
          amount = Number.parseFloat(match[3].replace(/,/g, ""))
        } else {
          // Pattern without date
          category = match[1].trim().replace(/^-\s*/, "")
          amount = Number.parseFloat(match[2].replace(/,/g, ""))
        }

        if (amount > 0 && category.length > 0) {
          transactions.push({
            type: currentSection || "expense",
            category: category,
            amount: amount,
            description: `${category} - ${lineDate}`,
            payment_method: null,
            date: lineDate,
            is_recurring: false,
            tags: "imported",
          })
        }
        break
      }
    }
  }

  return transactions
}

// Initialize database on import
export default function initDB() {
  return getDatabase()
}

// Export database instance
export { getDatabase }
