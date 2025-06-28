// financial data updating
import { google } from "@ai-sdk/google"
import { generateText } from "ai"

export async function POST(request) {
  try {
    const { currentData, updateRequest } = await request.json()

    if (!currentData || !updateRequest) {
      return Response.json({ error: "Missing required data" }, { status: 400 })
    }

    console.log("=== DATA UPDATE REQUEST ===")
    console.log("Update request:", updateRequest)
    console.log("Current data length:", currentData.length)

    // Check if API key is available
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return Response.json({ error: "API key not configured" }, { status: 500 })
    }

    const systemPrompt = `You are a financial data editor. Your job is to update financial information based on user requests.

INSTRUCTIONS:
1. Analyze the user's request to understand what they want to add, remove, or update
2. Modify the financial data accordingly
3. Keep the same format and structure as the original data
4. Be precise with numbers and categories
5. If adding new items, place them in the appropriate section
6. If removing items, delete them completely
7. If updating items, change only the specified values

RESPONSE FORMAT:
Return a JSON object with:
{
  "updatedData": "the modified financial data as a string",
  "updateDescription": "brief description of what was changed",
  "success": true
}

If you cannot make the requested change, return:
{
  "error": "explanation of why the change cannot be made",
  "success": false
}

CURRENT FINANCIAL DATA:
${currentData}

USER REQUEST: ${updateRequest}`

    const result = await generateText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      prompt: `Please update the financial data based on the user's request: "${updateRequest}"`,
    })

    console.log("AI Response:", result.text)

    // Try to parse the AI response as JSON
    let parsedResponse
    try {
      // Extract JSON from the response (in case there's extra text)
      const jsonMatch = result.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        parsedResponse = JSON.parse(jsonMatch[0])
      } else {
        throw new Error("No JSON found in response")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      return Response.json(
        {
          error: "Failed to process the update request. Please try rephrasing your request.",
          success: false,
        },
        { status: 500 },
      )
    }

    if (!parsedResponse.success) {
      return Response.json(
        {
          error: parsedResponse.error || "Update failed",
          success: false,
        },
        { status: 400 },
      )
    }

    // Validate the updated data
    if (!parsedResponse.updatedData || parsedResponse.updatedData.length < 50) {
      return Response.json(
        {
          error: "Updated data appears to be invalid or too short",
          success: false,
        },
        { status: 400 },
      )
    }

    console.log("Update successful:", parsedResponse.updateDescription)
    console.log("New data length:", parsedResponse.updatedData.length)

    return Response.json({
      updatedData: parsedResponse.updatedData,
      updateDescription: parsedResponse.updateDescription,
      success: true,
    })
  } catch (error) {
    console.error("Data update error:", error)
    return Response.json(
      {
        error: "Failed to process update request",
        success: false,
      },
      { status: 500 },
    )
  }
}
