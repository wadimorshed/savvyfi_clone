"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Send,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Calendar,
  Calculator,
  Wallet,
  AlertTriangle,
  Edit3,
  Database,
  History,
  FileText,
  Download,
} from "lucide-react"
import { FinancialUpload } from "@/components/csv-upload"
import { ModelInfo } from "@/components/model-info"
import { DebugPanel } from "@/components/debug-panel"
import { Alert, AlertDescription } from "@/components/ui/alert"
import React from "react"
import { FormattedText } from "@/components/formatted-text"
import { DataUpdatePanel } from "@/components/data-update-panel"
import { generateFinancialReportPDF, generateConversationPDF } from "@/utils/pdf-generator"

export default function FinancialAdvisorChat() {
  const [financialText, setFinancialText] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [showDataEditor, setShowDataEditor] = useState(false)
  const [dataUpdateHistory, setDataUpdateHistory] = useState([])
  const [userEmail] = useState("default@example.com") // Use email as identifier
  const [sessionId] = useState(`session_${Date.now()}`)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    body: {
      financialData: financialText || null,
      userId: userEmail,
      sessionId,
    },
    onError: (error) => {
      console.error("Chat error:", error)
    },
  })

  // Auto-scroll to bottom when new messages arrive or when loading
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    // Small delay to ensure content is rendered
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  // Load historical data on component mount
  useEffect(() => {
    const loadHistoricalData = async () => {
      try {
        console.log("🔍 Loading historical data for user email:", userEmail)
        const response = await fetch(`/api/financial-data?userId=${userEmail}&type=latest`)
        const result = await response.json()

        console.log("📊 Historical data response:", result)

        if (result.success && result.data && result.data.raw_data) {
          console.log("✅ Loaded historical financial data:", result.data.raw_data.length, "characters")
          console.log("📅 Upload date:", result.data.upload_date)
          console.log("📁 Filename:", result.data.filename)
          setFinancialText(result.data.raw_data)
        } else {
          console.log("❌ No historical data found or invalid response")
          console.log("Response details:", result)
        }
      } catch (error) {
        console.error("❌ Failed to load historical data:", error)
      }
    }

    loadHistoricalData()
  }, [userEmail])

  // Add this after the financialText declaration
  React.useEffect(() => {
    if (financialText && messages.length === 0) {
      // Automatically send a message when data is first uploaded
      const welcomeMessage =
        "I've uploaded my financial information. Can you analyze it and give me an overview of my financial situation?"
      handleInputChange({ target: { value: welcomeMessage } })
      setTimeout(() => {
        const syntheticEvent = {
          preventDefault: () => {},
          target: { value: welcomeMessage },
        }
        handleSubmit(syntheticEvent)
      }, 500)
    }
  }, [financialText, messages.length, handleInputChange, handleSubmit])

  // Custom submit handler to ensure financial data is always sent
  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Check if this is a data update request
    const isDataUpdateRequest =
      input.toLowerCase().includes("add ") ||
      input.toLowerCase().includes("remove ") ||
      input.toLowerCase().includes("update ") ||
      input.toLowerCase().includes("change ") ||
      input.toLowerCase().includes("delete ") ||
      input.toLowerCase().includes("create ")

    if (isDataUpdateRequest && financialText) {
      try {
        // Send to data update API
        const response = await fetch("/api/update-financial-data", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            currentData: financialText,
            updateRequest: input,
          }),
        })

        if (response.ok) {
          const result = await response.json()
          if (result.updatedData && result.updatedData !== financialText) {
            handleDataUpdate(result.updatedData, result.updateDescription)

            // Save updated data to database as incremental update
            try {
              await fetch("/api/financial-data", {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  userId: userEmail,
                  processedData: result.updatedData,
                  updateType: "ai_update",
                }),
              })
              console.log("✅ Incremental update saved to database")
            } catch (dbError) {
              console.warn("Failed to save incremental update to database:", dbError)
            }

            // Send a confirmation message to chat
            const confirmationMessage = `✅ **Data Updated!** ${result.updateDescription}\n\nYour financial information has been added to your historical database. What would you like to analyze next?`

            // Add the confirmation as an assistant message
            const syntheticEvent = {
              preventDefault: () => {},
              target: { value: input },
            }

            // Clear the input and submit the original request
            handleInputChange({ target: { value: "" } })
            handleSubmit(syntheticEvent, {
              body: {
                financialData: result.updatedData,
                isDataUpdate: true,
                updateDescription: result.updateDescription,
                userId: userEmail,
                sessionId,
              },
            })
            return
          }
        }
      } catch (error) {
        console.error("Data update failed:", error)
        // Fall through to normal chat handling
      }
    }

    // Normal chat submission
    const customBody = {
      financialData: financialText || null,
      userId: userEmail,
      sessionId,
    }
    console.log("Submitting with financial data:", !!financialText)
    if (financialText) {
      console.log("Financial data length:", financialText.length)
    }

    handleSubmit(e, { body: customBody })
  }

  // Add new prompts for historical data analysis
  const premadePrompts = [
    {
      text: "Show me my spending trends over time",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-blue-100 hover:bg-blue-200 text-blue-800",
    },
    {
      text: "How has my savings rate changed?",
      icon: <PiggyBank className="w-4 h-4" />,
      color: "bg-green-100 hover:bg-green-200 text-green-800",
    },
    {
      text: "What's my biggest expense category?",
      icon: <Calculator className="w-4 h-4" />,
      color: "bg-purple-100 hover:bg-purple-200 text-purple-800",
    },
    {
      text: "Compare this month vs last month",
      icon: <Calendar className="w-4 h-4" />,
      color: "bg-orange-100 hover:bg-orange-200 text-orange-800",
    },
    {
      text: "How am I doing with my budgets?",
      icon: <Wallet className="w-4 h-4" />,
      color: "bg-indigo-100 hover:bg-indigo-200 text-indigo-800",
    },
    {
      text: "Show me my goal progress",
      icon: <DollarSign className="w-4 h-4" />,
      color: "bg-emerald-100 hover:bg-emerald-200 text-emerald-800",
    },
    {
      text: "What are my income trends?",
      icon: <History className="w-4 h-4" />,
      color: "bg-cyan-100 hover:bg-cyan-200 text-cyan-800",
    },
    {
      text: "Analyze my financial patterns",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-violet-100 hover:bg-violet-200 text-violet-800",
    },
  ]

  const dataUpdatePrompts = [
    {
      text: "Add a new expense",
      icon: <Edit3 className="w-4 h-4" />,
      color: "bg-red-100 hover:bg-red-200 text-red-800",
      example: "Add $200 monthly gym membership to my expenses",
    },
    {
      text: "Update income",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "bg-green-100 hover:bg-green-200 text-green-800",
      example: "Update my salary to $5500 per month",
    },
    {
      text: "Create a budget",
      icon: <Calculator className="w-4 h-4" />,
      color: "bg-blue-100 hover:bg-blue-200 text-blue-800",
      example: "Create a budget of $400 for groceries",
    },
    {
      text: "Add savings goal",
      icon: <PiggyBank className="w-4 h-4" />,
      color: "bg-purple-100 hover:bg-purple-200 text-purple-800",
      example: "Add goal to save $5000 for vacation",
    },
  ]

  const handlePromptClick = (promptText) => {
    setSelectedPrompt(promptText)
    // Create a synthetic event to trigger the chat
    const syntheticEvent = {
      preventDefault: () => {},
      target: { value: promptText },
    }

    // Set the input value and submit
    handleInputChange({ target: { value: promptText } })
    setTimeout(() => {
      handleSubmit(syntheticEvent)
      setSelectedPrompt(null)
    }, 100)
  }

  const handleDataUploaded = (data) => {
    setFinancialText(data)
    setDataUpdateHistory([]) // Reset update history when new data is uploaded
    console.log("Financial data uploaded, length:", data.length)
    console.log("First 200 chars:", data.substring(0, 200))
  }

  const handleDataUpdate = (updatedData, updateDescription) => {
    setFinancialText(updatedData)

    // Add to update history
    const updateRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleString(),
      description: updateDescription,
      dataLength: updatedData.length,
    }
    setDataUpdateHistory((prev) => [updateRecord, ...prev].slice(0, 10)) // Keep last 10 updates

    console.log("Financial data updated:", updateDescription)
    console.log("New data length:", updatedData.length)
  }

  const handleExportFinancialReport = () => {
    if (!financialText) {
      alert("No financial data available to export. Please upload your financial information first.")
      return
    }

    try {
      const doc = generateFinancialReportPDF(financialText, userEmail)
      doc.save(`Financial_Report_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating financial report:", error)
      alert("Failed to generate financial report. Please try again.")
    }
  }

  const handleExportConversation = () => {
    if (messages.length === 0) {
      alert("No conversation to export. Start chatting with the AI first!")
      return
    }

    try {
      const doc = generateConversationPDF(messages, userEmail)
      doc.save(`AI_Conversation_${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (error) {
      console.error("Error generating conversation transcript:", error)
      alert("Failed to generate conversation transcript. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
              <br />
              <span className="text-xs">Check the debug panel below for troubleshooting steps.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Financial Upload Section */}
        <FinancialUpload onDataUploaded={handleDataUploaded} financialText={financialText} userId={userEmail} />

        {/* Data Update Panel */}
        {financialText && (
          <DataUpdatePanel
            financialText={financialText}
            onDataUpdate={handleDataUpdate}
            updateHistory={dataUpdateHistory}
            isVisible={showDataEditor}
            onToggleVisibility={() => setShowDataEditor(!showDataEditor)}
          />
        )}

        {/* Model Information */}
        <ModelInfo />

        {/* Chat Interface - Now with dynamic height */}
        <Card className="flex flex-col shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2 text-xl">
              <DollarSign className="w-6 h-6" />
              AI Financial Advisor
              {financialText && (
                <div className="flex items-center gap-2">
                  <span className="text-sm bg-blue-500 px-2 py-1 rounded-full">
                    Data loaded ({Math.round(financialText.length / 1000)}k chars)
                  </span>
                  {dataUpdateHistory.length > 0 && (
                    <span className="text-xs bg-green-500 px-2 py-1 rounded-full">
                      {dataUpdateHistory.length} updates
                    </span>
                  )}
                  <span className="text-xs bg-purple-500 px-2 py-1 rounded-full">
                    <Database className="w-3 h-3 mr-1 inline" />
                    Full Database
                  </span>
                </div>
              )}
            </CardTitle>
            <div className="flex items-center justify-between">
              <p className="text-blue-100 text-sm">
                {financialText
                  ? "Get personalized advice with access to your complete financial database (transactions, budgets, goals)"
                  : "Upload your financial information for comprehensive insights with full database tracking"}
              </p>
              <div className="flex gap-2">
                {financialText && (
                  <Button
                    onClick={handleExportFinancialReport}
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-blue-700 bg-transparent"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Export Report
                  </Button>
                )}
                {messages.length > 0 && (
                  <Button
                    onClick={handleExportConversation}
                    variant="outline"
                    size="sm"
                    className="text-white border-white hover:bg-white hover:text-blue-700 bg-transparent"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Transcript
                  </Button>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col p-0">
            {/* Messages Area - Dynamic height with constraints */}
            <div
              ref={messagesContainerRef}
              className="overflow-y-auto p-6 space-y-4 min-h-[400px] max-h-[80vh]"
              style={{
                // Dynamic height based on content, with reasonable bounds
                height: messages.length > 0 ? "auto" : "400px",
              }}
            >
              {messages.length === 0 && !error && (
                <div className="text-center py-12">
                  <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">Welcome to your AI Financial Advisor</h3>
                  <p className="text-gray-600 mb-6">
                    {financialText
                      ? "Your financial information is loaded with full database access. Ask me about transactions, budgets, goals, or update your data!"
                      : "Upload your financial information above, then ask me anything about your finances"}
                  </p>
                </div>
              )}

              {messages.map((message) => (
                <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-gray-100 text-gray-800 rounded-bl-sm shadow-sm"
                    }`}
                  >
                    {message.parts &&
                      message.parts.map((part, i) => {
                        switch (part.type) {
                          case "text":
                            return (
                              <div key={`${message.id}-${i}`} className="whitespace-pre-wrap leading-relaxed">
                                <FormattedText content={part.text} />
                              </div>
                            )
                          default:
                            return null
                        }
                      })}
                    {/* Fallback for messages without parts structure */}
                    {!message.parts && message.content && (
                      <div className="whitespace-pre-wrap leading-relaxed">
                        <FormattedText content={message.content} />
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 max-w-[85%] shadow-sm">
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-gray-600 text-sm">
                        {financialText
                          ? "Analyzing your complete financial database..."
                          : "Processing your question..."}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Invisible div to scroll to */}
              <div ref={messagesEndRef} />
            </div>

            {/* Premade Prompts */}
            <div className="border-t bg-gray-50 p-4">
              <div className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Quick Financial Questions:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {premadePrompts.map((prompt, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => handlePromptClick(prompt.text)}
                        disabled={isLoading}
                        className={`${prompt.color} border-0 justify-start text-left h-auto py-2 px-3 transition-all duration-200`}
                      >
                        <div className="flex items-center gap-2">
                          {prompt.icon}
                          <span className="text-xs font-medium">{prompt.text}</span>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>

                {financialText && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Update Your Data:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {dataUpdatePrompts.map((prompt, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => handleInputChange({ target: { value: prompt.example } })}
                          disabled={isLoading}
                          className={`${prompt.color} border-0 justify-start text-left h-auto py-2 px-3 transition-all duration-200`}
                          title={prompt.example}
                        >
                          <div className="flex items-center gap-2">
                            {prompt.icon}
                            <span className="text-xs font-medium">{prompt.text}</span>
                          </div>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Try: "Add $50 monthly Netflix", "Update salary to $6000", "Create budget $400 groceries", "Add
                      vacation savings goal $3000"
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Input Form */}
            <div className="border-t p-4 bg-white">
              <form onSubmit={handleCustomSubmit} className="flex gap-2">
                <Input
                  value={input}
                  onChange={handleInputChange}
                  placeholder={
                    financialText
                      ? "Ask about finances, budgets, goals, or update your data (e.g., 'Create $400 grocery budget')..."
                      : "Ask me about finances..."
                  }
                  disabled={isLoading}
                  className="flex-1 rounded-full border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="rounded-full bg-blue-600 hover:bg-blue-700 px-6"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Debug Panel */}
        <DebugPanel />
      </div>
    </div>
  )
}
