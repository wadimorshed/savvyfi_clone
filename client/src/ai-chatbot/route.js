// chatbot
import { google } from "@ai-sdk/google"
import { streamText } from "ai"
import { dbOperations } from "@/lib/database"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req) {
  try {
    const body = await req.json()
    const { messages } = body

    // Extract financial data and user info from the request body
    const financialData = body.financialData || body.data?.financialData || null
    const isDataUpdate = body.isDataUpdate || false
    const updateDescription = body.updateDescription || null
    const userEmail = body.userId || "default@example.com" // Use email as identifier
    const sessionId = body.sessionId || `session_${Date.now()}`

    console.log("=== API ROUTE DEBUG ===")
    console.log("User Email:", userEmail)
    console.log("Session ID:", sessionId)
    console.log("Financial data received:", financialData ? "YES" : "NO")
    console.log("Is data update:", isDataUpdate)
    console.log("Messages count:", messages?.length || 0)

    // Get or create user
    let user
    let userId
    try {
      user = dbOperations.getOrCreateUserByEmail(userEmail, "Default User")
      userId = user.id
      console.log("✅ User ID:", userId)
    } catch (dbError) {
      console.warn("Database user operation warning:", dbError.message)
      userId = 1 // Fallback
    }

    // Save user message to AI logs
    if (messages && messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      if (lastMessage.role === "user") {
        try {
          dbOperations.logAIInteraction(
            userId,
            sessionId,
            lastMessage.content,
            null, // Response will be filled later
            "chat",
            "chat",
          )
        } catch (dbError) {
          console.warn("Failed to log user message:", dbError.message)
        }
      }
    }

    // Get historical financial data for context
    let historicalContext = ""
    try {
      console.log("🔍 Fetching historical context for user:", userId)

      const enhancedSummary = dbOperations.getUserHistoricalSummaryEnhanced(userId)
      console.log("📊 Enhanced historical summary:", enhancedSummary)

      const recentTransactions = dbOperations.getUserTransactions(userId, 10)
      console.log("💳 Recent transactions count:", recentTransactions.length)

      if (enhancedSummary.transactions.transaction_count > 0) {
        const totalIncome = enhancedSummary.transactions.total_income || 0
        const totalExpenses = enhancedSummary.transactions.total_expenses || 0
        const netIncome = totalIncome - totalExpenses
        const avgSavingsRate =
          enhancedSummary.savingsRates.length > 0
            ? enhancedSummary.savingsRates.reduce((sum, r) => sum + r.savings_rate, 0) /
              enhancedSummary.savingsRates.length
            : 0

        historicalContext = `

=== COMPREHENSIVE HISTORICAL FINANCIAL CONTEXT ===
Transaction History (${enhancedSummary.transactions.months_with_data} months of data):
- Total transactions: ${enhancedSummary.transactions.transaction_count}
- Date range: ${enhancedSummary.transactions.first_transaction} to ${enhancedSummary.transactions.last_transaction}
- Total income: $${totalIncome.toFixed(2)}
- Total expenses: $${totalExpenses.toFixed(2)}
- Net income: $${netIncome.toFixed(2)}
- Average savings rate: ${avgSavingsRate.toFixed(1)}%

Recent Monthly Trends:
${enhancedSummary.trends
  .slice(0, 3)
  .map(
    (t) =>
      `- ${t.month}: Income $${t.monthly_income}, Expenses $${t.monthly_expenses}, Savings Rate ${t.monthly_income > 0 ? (((t.monthly_income - t.monthly_expenses) / t.monthly_income) * 100).toFixed(1) : 0}%`,
  )
  .join("\n")}

Top Spending Categories (All Time):
${enhancedSummary.topCategories
  .filter((c) => c.type === "expense")
  .slice(0, 5)
  .map((c) => `- ${c.category}: $${c.total.toFixed(2)} (${c.count} transactions)`)
  .join("\n")}

Top Income Sources:
${enhancedSummary.topCategories
  .filter((c) => c.type === "income")
  .slice(0, 3)
  .map((c) => `- ${c.category}: $${c.total.toFixed(2)} (${c.count} transactions)`)
  .join("\n")}

Recent Transactions:
${recentTransactions
  .slice(0, 5)
  .map(
    (t) => `- ${t.transaction_date}: ${t.type} - ${t.category} - $${t.amount} - ${t.description || "No description"}`,
  )
  .join("\n")}

Active Budgets (${enhancedSummary.budgets.length}):
${enhancedSummary.budgets
  .map((b) => {
    const percentage = ((b.spent_amount / b.amount_limit) * 100).toFixed(1)
    return `- ${b.category}: $${b.spent_amount}/$${b.amount_limit} (${percentage}% used)`
  })
  .join("\n")}

Financial Goals (${enhancedSummary.goals.length}):
${enhancedSummary.goals
  .map((g) => {
    const percentage = ((g.current_amount / g.target_amount) * 100).toFixed(1)
    return `- ${g.name} (${g.goal_type}): $${g.current_amount}/$${g.target_amount} (${percentage}% complete)`
  })
  .join("\n")}

Savings Rate Trend (Last 6 Months):
${enhancedSummary.savingsRates.map((r) => `- ${r.month}: ${r.savings_rate.toFixed(1)}%`).join("\n")}
=== END COMPREHENSIVE HISTORICAL CONTEXT ===`

        console.log("✅ Comprehensive historical context created:", historicalContext.length, "characters")
      } else {
        console.log("❌ No historical transactions found")
      }
    } catch (dbError) {
      console.error("❌ Failed to fetch historical context:", dbError.message)
      console.error("Database error details:", dbError)
    }

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set")
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Enhanced system prompt that includes financial data context and historical data
    let systemPrompt = `You are a friendly financial advisor AI assistant with access to the user's comprehensive financial database. Your goal is to make finance simple and approachable for everyone.

RESPONSE STYLE:
- Keep responses SHORT (2-3 paragraphs maximum)
- Use SIMPLE language - avoid jargon
- Be encouraging and positive
- End with 1-2 specific follow-up questions to help the user
- Focus on ONE main point per response
- Use everyday examples people can relate to

FORMATTING:
- Use **bold** for key numbers or important points
- Use bullet points (•) only when listing 2-3 simple items
- Keep paragraphs short (2-3 sentences max)
- Always end with "What would you like to know more about?"

COMPREHENSIVE FINANCIAL DATA ACCESS:
You have access to the user's complete financial database including:
- All transactions (income and expenses) with categories, dates, and amounts
- Active budgets with spending limits and current usage
- Financial goals (savings and debt) with progress tracking
- Bill reminders and subscriptions
- Historical trends and patterns
${historicalContext}`

    if (isDataUpdate && updateDescription) {
      systemPrompt += `

✅ **DATA UPDATE CONFIRMED!** 
The user's financial data has been updated: ${updateDescription}

RESPONSE APPROACH:
- Acknowledge the successful update
- Briefly explain how this change affects their financial picture
- Suggest what to analyze next with the updated data
- Keep it short and encouraging

Example response:
"✅ **Great! I've updated your data.** ${updateDescription}

This change [brief impact explanation]. Your updated financial picture shows [key insight].

What would you like me to analyze with your updated information?"`
    } else if (financialData) {
      systemPrompt += `

✅ I can see your current financial information! 

=== USER'S CURRENT FINANCIAL DATA ===
${financialData}
=== END OF CURRENT DATA ===

ANALYSIS APPROACH:
- Give ONE key insight at a time
- Use their actual numbers in simple terms
- Explain what the numbers mean in plain English
- Compare with historical data when available
- Suggest ONE specific action they can take
- Ask what they'd like to explore next

Example response style:
"I can see you spend **$X** on [category]. That's about **X%** of your income, which is [good/high/normal]. 

${historicalContext ? "Compared to your previous data, this shows [trend/change]." : ""}

Here's one simple thing you could try: [specific action].

What would you like me to look at next - your savings rate or spending in a specific area?"`
    } else {
      systemPrompt += `

The user hasn't uploaded current financial data, but I can see their comprehensive financial history.

${
  historicalContext
    ? `
Based on their financial database:
${historicalContext}

I can provide insights about their financial trends, budgets, goals, and spending patterns.
`
    : "The user hasn't set up their financial data yet. Keep it simple:"
}

- Explain they can upload a text file or PDF with their financial info
- Mention that PDFs need to have readable text (not just images)
- Mention they can also update their data using natural language commands
- Give ONE general tip they can use right away
- Ask what specific area of finance they want help with`
    }

    systemPrompt += `

DATA UPDATE FEATURE:
Users can update their financial data by saying things like:
- "Add $200 monthly gym membership to my expenses"
- "Update my salary to $5500 per month"  
- "Remove Netflix subscription from my expenses"
- "Add goal to save $5000 for vacation"
- "Create a budget of $400 for groceries"

If they ask about updating data, explain this feature briefly.

COMPREHENSIVE INSIGHTS:
With access to their full financial database, you can:
- Compare current vs historical spending patterns
- Track progress toward financial goals
- Monitor budget usage and suggest adjustments
- Identify spending trends and anomalies
- Provide personalized recommendations based on their data
- Celebrate achievements and milestones

REMEMBER: 
- Short responses (under 150 words)
- Simple language
- One main point
- End with follow-up questions
- Be encouraging and helpful
- Use comprehensive financial context when available`

    console.log("System prompt includes financial data:", systemPrompt.includes("FINANCIAL INFORMATION"))
    console.log("System prompt includes historical context:", systemPrompt.includes("HISTORICAL CONTEXT"))

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
      onFinish: async (result) => {
        // Log the complete AI interaction
        try {
          dbOperations.logAIInteraction(
            userId,
            sessionId,
            messages[messages.length - 1]?.content || "No prompt",
            result.text,
            "chat",
            "chat",
            result.usage?.totalTokens || 0,
            "gemini-2.5-flash",
            true,
          )
        } catch (dbError) {
          console.warn("Failed to log AI response:", dbError.message)
        }
      },
    })

    console.log("Streaming response started...")
    return result.toDataStreamResponse()
  } catch (error) {
    console.error("API Route Error:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
