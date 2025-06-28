// Database initialization script
import { getDatabase } from "../lib/database.js"

console.log("Initializing financial advisor database...")
console.log("Database file: finance.db")

try {
  const db = getDatabase()
  console.log("✅ Database initialized successfully!")
  console.log("Database location:", process.env.DATABASE_PATH || "./finance.db")

  // Test the database with a sample query
  const result = db.prepare("SELECT COUNT(*) as count FROM users").get()
  console.log(`📊 Current users in database: ${result.count}`)

  // Show existing tables
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()
  console.log("📋 Existing tables:", tables.map((t) => t.name).join(", "))
} catch (error) {
  console.error("❌ Database initialization failed:", error)
  process.exit(1)
}
