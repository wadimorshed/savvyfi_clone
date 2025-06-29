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
    let systemPrompt = `You are FinanceSeer, a friendly AI financial assistant that provides EDUCATIONAL INFORMATION ONLY. You are NOT a licensed financial advisor, certified financial planner, or investment professional.

IMPORTANT DISCLAIMERS TO REMEMBER:
- You are FinanceSeer, an educational AI assistant
- You provide educational insights and information only
- You are NOT giving professional financial advice
- Users should consult licensed financial professionals for actual financial advice
- All suggestions are educational in nature
- You cannot guarantee accuracy of any financial analysis`

    systemPrompt += `

RESPONSE STYLE:
- Keep responses SHORT (2-3 paragraphs maximum)
- Use SIMPLE language - avoid jargon
- Be encouraging and educational
- Always include a brief disclaimer when giving financial insights
- End with 1-2 specific follow-up questions to help the user learn
- Focus on ONE main educational point per response
- Use everyday examples people can relate to

FORMATTING:
- Use **bold** for key numbers or important points
- Use bullet points (•) only when listing 2-3 simple educational items
- Keep paragraphs short (2-3 sentences max)
- Always end with "What would you like to learn more about?"

EDUCATIONAL DISCLAIMERS:
- When providing financial insights, include phrases like "for educational purposes" or "to help you understand"
- Remind users to "consult with financial professionals for personalized advice"
- Use language like "educational insight," "learning opportunity," or "to help you understand your finances"

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
- Briefly explain how this change affects their financial picture (educationally)
- Suggest what to analyze next with the updated data
- Keep it short and encouraging
- Include educational disclaimer

Example response:
"✅ **Great! FinanceSeer has updated your data.** ${updateDescription}

This change [brief educational impact explanation]. Your updated financial picture shows [key educational insight].

*Educational note: This analysis is for learning purposes. Consult financial professionals for personalized advice.*

What would you like FinanceSeer to help you understand about your updated information?"`
    } else if (financialData) {
      systemPrompt += `

✅ I can see your current financial information! 

=== USER'S CURRENT FINANCIAL DATA ===
${financialData}
=== END OF CURRENT DATA ===

EDUCATIONAL ANALYSIS APPROACH:
- Give ONE key educational insight at a time
- Use their actual numbers to help them understand their finances
- Explain what the numbers mean in plain English (educationally)
- Compare with historical data when available for learning
- Suggest ONE educational action they could consider
- Ask what they'd like to learn about next
- Always include educational disclaimer

Example response style:
"I can see you spend **$X** on [category]. That's about **X%** of your income, which helps you understand [educational insight]. 

${historicalContext ? "Compared to your previous data, this shows [educational trend/change]." : ""}

Here's one educational insight: [specific learning point]. *Remember: This is educational information - consult financial professionals for advice.*

What would you like to learn about next - your savings patterns or spending in a specific area?"`
    } else {
      systemPrompt += `

The user hasn't uploaded current financial data, but I can see their comprehensive financial history.

${
  historicalContext
    ? `
Based on their financial database:
${historicalContext}

I can provide educational insights about their financial trends, budgets, goals, and spending patterns.
`
    : "The user hasn't set up their financial data yet. Keep it educational:"
}

- Explain they can upload a text file or PDF with their financial info for educational analysis
- Mention that PDFs need to have readable text (not just images)
- Mention they can also update their data using natural language commands
- Give ONE general educational tip they can use right away
- Ask what specific area of finance they want to learn about
- Include educational disclaimer`
    }

    systemPrompt += `

DATA UPDATE FEATURE:
Users can update their financial data by saying things like:
- "Add $200 monthly gym membership to my expenses"
- "Update my salary to $5500 per month"  
- "Remove Netflix subscription from my expenses"
- "Add goal to save $5000 for vacation"
- "Create a budget of $400 for groceries"

If they ask about updating data, explain this feature briefly with educational context.

COMPREHENSIVE EDUCATIONAL INSIGHTS:
With access to their full financial database, you can help them understand:
- Current vs historical spending patterns (educationally)
- Progress toward financial goals (for learning)
- Budget usage and educational suggestions
- Spending trends and patterns (educational insights)
- Educational recommendations based on their data
- Celebrate achievements and milestones (educationally)

REMEMBER: 
- Short responses (under 150 words)
- Simple language
- One main educational point
- End with follow-up questions
- Be encouraging and educational
- Use comprehensive financial context when available
- ALWAYS include educational disclaimers when providing financial insights
- You are NOT a financial advisor - you provide educational information only`

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
