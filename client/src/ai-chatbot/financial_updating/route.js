//financial data updating
import { dbOperations } from "@/lib/database"
import { NextResponse } from "next/server"

// GET - Retrieve user's financial data
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const userEmail = searchParams.get("userId") || "default@example.com" // Use email as identifier
    const type = searchParams.get("type") // 'latest', 'all', 'summary', 'transactions'
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const months = Number.parseInt(searchParams.get("months") || "12")

    console.log("🔍 Fetching financial data for user email:", userEmail, "type:", type)

    // Get or create user by email
    let user
    try {
      user = dbOperations.getOrCreateUserByEmail(userEmail, "Default User")
      console.log("✅ User found/created:", user.id, user.name)
    } catch (dbError) {
      console.error("❌ User creation/retrieval failed:", dbError)
      return NextResponse.json(
        {
          success: false,
          error: "User management failed",
          details: dbError.message,
        },
        { status: 500 },
      )
    }

    const userId = user.id

    switch (type) {
      case "history":
        const history = dbOperations.getTransactionHistory(userId, startDate, endDate)
        console.log("📜 Transaction history count:", history.length)
        return NextResponse.json({ success: true, data: history })

      case "trends":
        const monthlyBreakdown = dbOperations.getMonthlyBreakdown(userId, months)
        const categoryTrends = dbOperations.getCategoryTrends(userId, months)
        console.log("📈 Trends data:", { monthly: monthlyBreakdown.length, categories: categoryTrends.length })
        return NextResponse.json({
          success: true,
          data: { monthlyBreakdown, categoryTrends },
        })

      case "summary":
        const enhancedSummary = dbOperations.getUserHistoricalSummaryEnhanced(userId)
        console.log("📊 Enhanced summary:", enhancedSummary.transactions)
        return NextResponse.json({ success: true, data: enhancedSummary })

      case "latest":
        const latestData = dbOperations.getLatestFinancialData(userId)
        console.log("📄 Latest data result:", latestData ? "Found" : "Not found")
        if (latestData) {
          console.log("📊 Data details:", {
            id: latestData.id,
            filename: latestData.filename,
            upload_date: latestData.upload_date,
            data_length: latestData.raw_data?.length || 0,
          })
        }
        return NextResponse.json({ success: true, data: latestData })

      case "transactions":
        const transactions = dbOperations.getUserTransactions(userId, 100)
        console.log("💳 Transactions count:", transactions.length)
        return NextResponse.json({ success: true, data: transactions })

      case "summary":
        const summary = dbOperations.getFinancialSummary(userId)
        const historical = dbOperations.getUserHistoricalSummary(userId)
        const budgets = dbOperations.getUserBudgets(userId)
        const goals = dbOperations.getUserGoals(userId)
        console.log("📊 Summary data:", {
          summary: summary.length,
          historical,
          budgets: budgets.length,
          goals: goals.length,
        })
        return NextResponse.json({
          success: true,
          data: { summary, historical, budgets, goals },
        })

      case "budgets":
        const userBudgets = dbOperations.getUserBudgets(userId)
        console.log("💰 Budgets count:", userBudgets.length)
        return NextResponse.json({ success: true, data: userBudgets })

      case "goals":
        const userGoals = dbOperations.getUserGoals(userId)
        console.log("🎯 Goals count:", userGoals.length)
        return NextResponse.json({ success: true, data: userGoals })

      case "reminders":
        const reminders = dbOperations.getUserReminders(userId)
        console.log("⏰ Reminders count:", reminders.length)
        return NextResponse.json({ success: true, data: reminders })

      case "all":
        const allUploads = dbOperations.getUserUploads(userId, 50)
        console.log("📁 All uploads count:", allUploads.length)
        return NextResponse.json({ success: true, data: allUploads })

      default:
        // Return latest data by default
        const defaultData = dbOperations.getLatestFinancialData(userId)
        console.log("📄 Default data result:", defaultData ? "Found" : "Not found")
        return NextResponse.json({ success: true, data: defaultData })
    }
  } catch (error) {
    console.error("❌ Error fetching financial data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch financial data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// POST - Save new financial data (parse and save as transactions)
export async function POST(request) {
  try {
    const body = await request.json()
    const {
      userId: userEmail = "default@example.com",
      filename,
      fileType,
      rawData,
      processedData,
      fileSize,
      extractionMethod,
      isIncremental = false, // New flag to indicate incremental update
    } = body

    console.log("💾 Saving financial data for user email:", userEmail, "Incremental:", isIncremental)

    // Get or create user
    const user = dbOperations.getOrCreateUserByEmail(userEmail, "Default User")
    const userId = user.id

    if (isIncremental) {
      // Add new data without replacing existing
      const result = dbOperations.addIncrementalData(userId, rawData)
      console.log("📊 Incremental update result:", result)

      return NextResponse.json({
        success: true,
        transactionsAdded: result.addedCount,
        duplicatesSkipped: result.duplicateCount,
        totalParsed: result.totalParsed,
        message: `Added ${result.addedCount} new transactions (${result.duplicateCount} duplicates skipped)`,
        isIncremental: true,
      })
    } else {
      // Parse the raw data and extract transactions (full upload)
      const transactions = parseFinancialDataWithDates(rawData)
      console.log("📊 Parsed transactions:", transactions.length)

      // Save transactions to database with duplicate checking
      let savedCount = 0
      let duplicateCount = 0

      for (const transaction of transactions) {
        try {
          const result = dbOperations.saveTransactionSafe(
            userId,
            transaction.type,
            transaction.category,
            transaction.amount,
            transaction.description,
            transaction.payment_method,
            transaction.date,
            transaction.is_recurring,
            transaction.tags,
          )

          if (result.isDuplicate) {
            duplicateCount++
          } else {
            savedCount++
          }
        } catch (error) {
          console.warn("Failed to save transaction:", error.message)
        }
      }

      console.log("✅ Saved", savedCount, "new transactions,", duplicateCount, "duplicates skipped")

      return NextResponse.json({
        success: true,
        transactionsSaved: savedCount,
        duplicatesSkipped: duplicateCount,
        totalParsed: transactions.length,
        message: `Successfully saved ${savedCount} transactions (${duplicateCount} duplicates skipped)`,
        isIncremental: false,
      })
    }
  } catch (error) {
    console.error("❌ Error saving financial data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save financial data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// PUT - Update existing financial data (now properly incremental)
export async function PUT(request) {
  try {
    const body = await request.json()
    const { userId: userEmail = "default@example.com", processedData, updateType = "manual_update" } = body

    console.log("🔄 Incremental update for user email:", userEmail)

    // Get user
    const user = dbOperations.getOrCreateUserByEmail(userEmail, "Default User")
    const userId = user.id

    // Add new data incrementally (don't replace existing)
    const result = dbOperations.addIncrementalData(userId, processedData, updateType)

    console.log("✅ Incremental update completed:", result)

    return NextResponse.json({
      success: true,
      transactionsAdded: result.addedCount,
      duplicatesSkipped: result.duplicateCount,
      totalParsed: result.totalParsed,
      message: `Added ${result.addedCount} new transactions to your historical data`,
      isIncremental: true,
    })
  } catch (error) {
    console.error("❌ Error updating financial data:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update financial data",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Enhanced parsing function that preserves dates (moved from database.js)
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

    // Parse transaction lines
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
