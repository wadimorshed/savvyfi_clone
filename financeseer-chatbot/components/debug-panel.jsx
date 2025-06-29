"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Settings } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function DebugPanel() {
  const [isVisible, setIsVisible] = useState(false)
  const [testResult, setTestResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const testAPIConnection = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "Hello, can you help me with financial advice?",
            },
          ],
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setTestResult(`Error: ${response.status} - ${errorData.error || "Unknown error"}`)
        return
      }

      // Check if it's a streaming response
      if (response.headers.get("content-type")?.includes("text/plain")) {
        setTestResult("✅ API connection successful! Streaming response received.")
      } else {
        setTestResult("⚠️ API responded but may not be streaming correctly.")
      }
    } catch (error) {
      setTestResult(`❌ Connection failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  const testFinancialData = async () => {
    setIsLoading(true)
    setTestResult(null)

    try {
      // Create sample financial text data
      const sampleFinancialText = `My Monthly Financial Situation:

INCOME:
- Salary: $5,000
- Freelance: $800
Total Monthly Income: $5,800

EXPENSES:
- Rent: $1,200
- Groceries: $400
- Car payment: $350
- Utilities: $150
- Entertainment: $200
- Insurance: $100
Total Monthly Expenses: $2,400

Net Income: $3,400
Savings Rate: 58.6%

GOALS:
- Build emergency fund to $15,000 (currently at $8,000)
- Save for vacation: $3,000
- Pay off student loan: $12,000 remaining

CONCERNS:
- Am I saving enough for retirement?
- Should I invest more aggressively?`

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              role: "user",
              content: "I've uploaded my financial information. Can you analyze it and give me advice?",
            },
          ],
          data: {
            financialData: sampleFinancialText,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        setTestResult(`Error: ${response.status} - ${errorData.error || "Unknown error"}`)
        return
      }

      setTestResult("✅ Financial data test successful! AI should see and analyze the sample financial text.")
    } catch (error) {
      setTestResult(`❌ Financial data test failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    } finally {
      setIsLoading(false)
    }
  }

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-white shadow-lg"
      >
        <Settings className="w-4 h-4 mr-2" />
        Debug
      </Button>
    )
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 shadow-xl z-50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <span className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Debug Panel
          </span>
          <Button variant="ghost" size="sm" onClick={() => setIsVisible(false)}>
            ×
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <h4 className="text-sm font-medium">API Configuration</h4>
          <div className="text-xs space-y-1">
            <div>Environment: {process.env.NODE_ENV}</div>
            <div>API Key: {typeof window !== "undefined" ? "Client-side (hidden)" : "Server-side configured"}</div>
          </div>
        </div>

        <Button onClick={testAPIConnection} disabled={isLoading} size="sm" className="w-full">
          {isLoading ? "Testing..." : "Test API Connection"}
        </Button>

        <Button onClick={testFinancialData} disabled={isLoading} size="sm" className="w-full">
          {isLoading ? "Testing..." : "Test Financial Data"}
        </Button>

        {testResult && (
          <Alert variant={testResult.includes("✅") ? "default" : "destructive"}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-xs">{testResult}</AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>
            <strong>Troubleshooting:</strong>
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check .env.local file exists</li>
            <li>Verify GOOGLE_GENERATIVE_AI_API_KEY is set</li>
            <li>Restart development server</li>
            <li>Check browser console for errors</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
