// chatbot

import { google } from "@ai-sdk/google"
import { streamText } from "ai"

// Allow streaming responses up to 30 seconds
export const maxDuration = 30

export async function POST(req) {
  try {
    const body = await req.json()
    const { messages } = body

    // Extract financial data from the request body - check both locations
    const financialData = body.financialData || body.data?.financialData || null
    const isDataUpdate = body.isDataUpdate || false
    const updateDescription = body.updateDescription || null

    console.log("=== API ROUTE DEBUG ===")
    console.log("Request body keys:", Object.keys(body))
    console.log("Financial data received:", financialData ? "YES" : "NO")
    console.log("Is data update:", isDataUpdate)
    console.log("Update description:", updateDescription)
    if (financialData) {
      console.log("Financial data length:", financialData.length)
      console.log("Financial data preview:", financialData.substring(0, 300))
    }
    console.log("Messages count:", messages?.length || 0)

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      console.error("GOOGLE_GENERATIVE_AI_API_KEY is not set")
      return new Response(JSON.stringify({ error: "API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Enhanced system prompt that includes financial data context
    let systemPrompt = `You are a friendly financial advisor AI assistant. Your goal is to make finance simple and approachable for everyone.

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
- Always end with "What would you like to know more about?"`

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

✅ I can see your financial information! 

=== USER'S FINANCIAL DATA ===
${financialData}
=== END OF DATA ===

ANALYSIS APPROACH:
- Give ONE key insight at a time
- Use their actual numbers in simple terms
- Explain what the numbers mean in plain English
- Suggest ONE specific action they can take
- Ask what they'd like to explore next

Example response style:
"I can see you spend **$X** on [category]. That's about **X%** of your income, which is [good/high/normal]. 

Here's one simple thing you could try: [specific action].

What would you like me to look at next - your savings rate or spending in a specific area?"`
    } else {
      systemPrompt += `

The user hasn't uploaded financial data yet. Keep it simple:
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

If they ask about updating data, explain this feature briefly.

REMEMBER: 
- Short responses (under 150 words)
- Simple language
- One main point
- End with follow-up questions
- Be encouraging and helpful`

    console.log("System prompt includes financial data:", systemPrompt.includes("FINANCIAL INFORMATION"))

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages,
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
