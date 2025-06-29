"use client"

import { useChat } from "@ai-sdk/react"
import { useState, useEffect, useRef } from "react"
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
import { LegalDisclaimer } from "@/components/legal-disclaimer"
import { Alert, AlertDescription } from "@/components/ui/alert"
import React from "react"
import { FormattedText } from "@/components/formatted-text"
import { DataUpdatePanel } from "@/components/data-update-panel"
import { generateFinancialReportPDF, generateConversationPDF } from "@/utils/pdf-generator"
import { ExportOptionsModal } from "@/components/export-options-modal"

export default function FinancialAdvisorChat() {
  const [financialText, setFinancialText] = useState("")
  const [selectedPrompt, setSelectedPrompt] = useState(null)
  const [showDataEditor, setShowDataEditor] = useState(false)
  const [dataUpdateHistory, setDataUpdateHistory] = useState([])
  const [userEmail] = useState("default@example.com") // Use email as identifier
  const [sessionId] = useState(`session_${Date.now()}`)
  const [hasAcknowledgedDisclaimer, setHasAcknowledgedDisclaimer] = useState(false)
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)

  const [exportModal, setExportModal] = useState({
    isOpen: false,
    type: null, // 'report' or 'conversation'
    title: "",
    description: "",
  })

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

  // Check if user has acknowledged disclaimer
  useEffect(() => {
    const acknowledged = localStorage.getItem("financial-ai-disclaimer-acknowledged")
    setHasAcknowledgedDisclaimer(acknowledged === "true")
  }, [])

  const handleAcknowledgeDisclaimer = () => {
    localStorage.setItem("financial-ai-disclaimer-acknowledged", "true")
    setHasAcknowledgedDisclaimer(true)
  }

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
    if (financialText && messages.length === 0 && hasAcknowledgedDisclaimer) {
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
  }, [financialText, messages.length, hasAcknowledgedDisclaimer, handleInputChange, handleSubmit])

  // Custom submit handler to ensure financial data is always sent
  const handleCustomSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    // Check if disclaimer has been acknowledged
    if (!hasAcknowledgedDisclaimer) {
      alert("Please acknowledge the legal disclaimer before using the AI assistant.")
      return
    }

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
      color: "prompt-blue",
    },
    {
      text: "How has my savings rate changed?",
      icon: <PiggyBank className="w-4 h-4" />,
      color: "prompt-green",
    },
    {
      text: "What's my biggest expense category?",
      icon: <Calculator className="w-4 h-4" />,
      color: "prompt-purple",
    },
    {
      text: "Compare this month vs last month",
      icon: <Calendar className="w-4 h-4" />,
      color: "prompt-orange",
    },
    {
      text: "How am I doing with my budgets?",
      icon: <Wallet className="w-4 h-4" />,
      color: "prompt-indigo",
    },
    {
      text: "Show me my goal progress",
      icon: <DollarSign className="w-4 h-4" />,
      color: "prompt-emerald",
    },
    {
      text: "What are my income trends?",
      icon: <History className="w-4 h-4" />,
      color: "prompt-cyan",
    },
    {
      text: "Analyze my financial patterns",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "prompt-violet",
    },
  ]

  const dataUpdatePrompts = [
    {
      text: "Add a new expense",
      icon: <Edit3 className="w-4 h-4" />,
      color: "prompt-red",
      example: "Add $200 monthly gym membership to my expenses",
    },
    {
      text: "Update income",
      icon: <TrendingUp className="w-4 h-4" />,
      color: "prompt-green",
      example: "Update my salary to $5500 per month",
    },
    {
      text: "Create a budget",
      icon: <Calculator className="w-4 h-4" />,
      color: "prompt-blue",
      example: "Create a budget of $400 for groceries",
    },
    {
      text: "Add savings goal",
      icon: <PiggyBank className="w-4 h-4" />,
      color: "prompt-purple",
      example: "Add goal to save $5000 for vacation",
    },
  ]

  const handlePromptClick = (promptText) => {
    if (!hasAcknowledgedDisclaimer) {
      alert("Please acknowledge the legal disclaimer before using the AI assistant.")
      return
    }

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

    setExportModal({
      isOpen: true,
      type: "report",
      title: "Export Financial Report",
      description: "Choose how you'd like to receive your comprehensive financial report.",
    })
  }

  const handleExportConversation = () => {
    if (messages.length === 0) {
      alert("No conversation to export. Start chatting with the AI first!")
      return
    }

    setExportModal({
      isOpen: true,
      type: "conversation",
      title: "Export Conversation Transcript",
      description: "Choose how you'd like to receive your AI conversation transcript.",
    })
  }

  const handleDownloadPDF = () => {
    try {
      if (exportModal.type === "report") {
        const doc = generateFinancialReportPDF(financialText, userEmail)
        doc.save(`Financial_Report_${new Date().toISOString().split("T")[0]}.pdf`)
      } else if (exportModal.type === "conversation") {
        const doc = generateConversationPDF(messages, userEmail)
        doc.save(`AI_Conversation_${new Date().toISOString().split("T")[0]}.pdf`)
      }
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Failed to generate PDF. Please try again.")
    }
  }

  const handleEmailReport = async (email, message) => {
    try {
      let doc, filename, subject, emailBody

      if (exportModal.type === "report") {
        doc = generateFinancialReportPDF(financialText, userEmail)
        filename = `Financial_Report_${new Date().toISOString().split("T")[0]}.pdf`
        subject = "Your FinanceSeer Financial Analysis Report"
        emailBody =
          message ||
          `Hi there!

Please find your FinanceSeer AI-generated financial analysis report attached.

IMPORTANT DISCLAIMER: This report was generated by FinanceSeer AI tool for educational purposes only. It is NOT professional financial advice and should not be used as the sole basis for financial decisions.

This report contains:
- Income and expense breakdown
- Spending trends and patterns  
- Budget analysis
- Financial goal progress
- Educational insights and suggestions

Please consult with licensed financial professionals before making significant financial decisions.

Best regards,
FinanceSeer AI Assistant

---
Generated on: ${new Date().toLocaleDateString()}
Report Date: ${new Date().toISOString().split("T")[0]}
Disclaimer: This is educational content, not professional financial advice.`
      } else if (exportModal.type === "conversation") {
        doc = generateConversationPDF(messages, userEmail)
        filename = `AI_Conversation_${new Date().toISOString().split("T")[0]}.pdf`
        subject = "Your FinanceSeer Conversation"
        emailBody =
          message ||
          `Hi there!

Please find your FinanceSeer conversation transcript attached.

IMPORTANT DISCLAIMER: This conversation contains FinanceSeer AI-generated responses for educational purposes only. FinanceSeer is NOT a licensed financial advisor and the content should not be considered professional financial advice.

This transcript contains your complete conversation with FinanceSeer, including all questions asked and educational responses received.

Please consult with licensed financial professionals for personalized financial advice.

Best regards,
FinanceSeer AI Assistant

---
Generated on: ${new Date().toLocaleDateString()}
Conversation Date: ${new Date().toISOString().split("T")[0]}
Total Messages: ${messages.length}
Disclaimer: This is educational content, not professional financial advice.`
      }

      // Download the PDF first (so user has it locally)
      doc.save(filename)

      // Create mailto link with pre-filled content
      const mailtoLink = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(emailBody + "\n\nNote: Please attach the downloaded PDF file (" + filename + ") to this email before sending.")}`

      // Open the mailto link
      window.location.href = mailtoLink

      console.log("✅ Email client opened and PDF downloaded")
      return { success: true }
    } catch (error) {
      console.error("❌ Email preparation failed:", error)
      throw error
    }
  }

  return (
    <div className="financial-app">
      <div className="financial-app-container">
        {/* Legal Disclaimer - Always visible at top */}
        {!hasAcknowledgedDisclaimer ? (
          <div className="card" style={{ borderColor: "var(--red-200)", backgroundColor: "var(--red-50)" }}>
            <div className="card-content" style={{ padding: "1.5rem" }}>
              <LegalDisclaimer variant="full" />
              <div style={{ marginTop: "1rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <button
                  onClick={handleAcknowledgeDisclaimer}
                  className="button button-primary"
                  style={{ backgroundColor: "var(--red-600)", color: "var(--white)" }}
                >
                  I Understand - This is Educational Only
                </button>
              </div>
            </div>
          </div>
        ) : (
          <LegalDisclaimer variant="compact" />
        )}

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="w-4 h-4" />
            <AlertDescription>
              <strong>Error:</strong> {error.message}
              <br />
              <span className="text-xs">Check the debug panel below for troubleshooting steps.</span>
            </AlertDescription>
          </Alert>
        )}

        {/* Financial Upload Section */}
        {hasAcknowledgedDisclaimer && (
          <FinancialUpload onDataUploaded={handleDataUploaded} financialText={financialText} userId={userEmail} />
        )}

        {/* Data Update Panel */}
        {financialText && hasAcknowledgedDisclaimer && (
          <DataUpdatePanel
            financialText={financialText}
            onDataUpdate={handleDataUpdate}
            updateHistory={dataUpdateHistory}
            isVisible={showDataEditor}
            onToggleVisibility={() => setShowDataEditor(!showDataEditor)}
          />
        )}

        {/* Model Information */}
        {hasAcknowledgedDisclaimer && <ModelInfo />}

        {/* Chat Interface - Only show if disclaimer acknowledged */}
        {hasAcknowledgedDisclaimer && (
          <div className="card" style={{ display: "flex", flexDirection: "column", boxShadow: "var(--shadow-xl)" }}>
            <div
              className="card-header"
              style={{
                background: "linear-gradient(to right, var(--blue-600), var(--blue-700))",
                color: "var(--white)",
                borderTopLeftRadius: "0.5rem",
                borderTopRightRadius: "0.5rem",
                borderBottom: "none",
              }}
            >
              <div
                className="card-title"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "1.25rem",
                  color: "var(--white)",
                }}
              >
                <DollarSign className="w-6 h-6" />
                FinanceSeer
                <span
                  className="badge"
                  style={{
                    fontSize: "0.75rem",
                    backgroundColor: "var(--amber-500)",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "9999px",
                    color: "var(--white)",
                  }}
                >
                  Educational Only
                </span>
                {financialText && (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span
                      className="badge"
                      style={{
                        fontSize: "0.875rem",
                        backgroundColor: "var(--blue-500)",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "9999px",
                        color: "var(--white)",
                      }}
                    >
                      Data loaded ({Math.round(financialText.length / 1000)}k chars)
                    </span>
                    {dataUpdateHistory.length > 0 && (
                      <span
                        className="badge"
                        style={{
                          fontSize: "0.75rem",
                          backgroundColor: "var(--green-500)",
                          padding: "0.25rem 0.5rem",
                          borderRadius: "9999px",
                          color: "var(--white)",
                        }}
                      >
                        {dataUpdateHistory.length} updates
                      </span>
                    )}
                    <span
                      className="badge"
                      style={{
                        fontSize: "0.75rem",
                        backgroundColor: "var(--purple-500)",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "9999px",
                        color: "var(--white)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.25rem",
                      }}
                    >
                      <Database className="w-3 h-3" />
                      Full Database
                    </span>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <p style={{ color: "var(--blue-100)", fontSize: "0.875rem" }}>
                  {financialText
                    ? "Get educational insights with FinanceSeer's access to your complete financial database (transactions, budgets, goals)"
                    : "Upload your financial information for educational insights with FinanceSeer's full database tracking"}
                </p>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  {financialText && (
                    <button
                      onClick={handleExportFinancialReport}
                      className="button button-outline button-sm"
                      style={{
                        color: "var(--white)",
                        borderColor: "var(--white)",
                        backgroundColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <FileText className="w-4 h-4" />
                      Export Report
                    </button>
                  )}
                  {messages.length > 0 && (
                    <button
                      onClick={handleExportConversation}
                      className="button button-outline button-sm"
                      style={{
                        color: "var(--white)",
                        borderColor: "var(--white)",
                        backgroundColor: "transparent",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download Transcript
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="card-content" style={{ display: "flex", flexDirection: "column", padding: "0" }}>
              {/* Messages Area - Dynamic height with constraints */}
              <div
                ref={messagesContainerRef}
                style={{
                  overflowY: "auto",
                  padding: "1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                  minHeight: "400px",
                  maxHeight: "80vh",
                  height: messages.length > 0 ? "auto" : "400px",
                }}
              >
                {messages.length === 0 && !error && (
                  <div style={{ textAlign: "center", padding: "3rem 0" }}>
                    <div
                      style={{
                        backgroundColor: "var(--blue-50)",
                        borderRadius: "50%",
                        width: "4rem",
                        height: "4rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 1rem",
                      }}
                    >
                      <DollarSign style={{ width: "2rem", height: "2rem", color: "var(--blue-600)" }} />
                    </div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: "600",
                        color: "var(--gray-800)",
                        marginBottom: "0.5rem",
                      }}
                    >
                      Welcome to FinanceSeer
                    </h3>
                    <p style={{ color: "var(--gray-600)", marginBottom: "0.5rem" }}>
                      {financialText
                        ? "Your financial information is loaded with full database access. Ask me about transactions, budgets, goals, or update your data!"
                        : "Upload your financial information above, then ask me anything about your finances"}
                    </p>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--amber-700)",
                        backgroundColor: "var(--amber-100)",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "0.5rem",
                        display: "inline-block",
                      }}
                    >
                      ⚠️ Remember: This provides educational insights only, not professional financial advice
                    </p>
                  </div>
                )}

                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`message-container ${message.role === "user" ? "message-user" : "message-assistant"}`}
                  >
                    <div
                      className={`message-bubble ${message.role === "user" ? "message-bubble-user" : "message-bubble-assistant"}`}
                    >
                      {message.parts &&
                        message.parts.map((part, i) => {
                          switch (part.type) {
                            case "text":
                              return (
                                <div key={`${message.id}-${i}`} style={{ whiteSpace: "pre-wrap", lineHeight: "1.625" }}>
                                  <FormattedText content={part.text} />
                                </div>
                              )
                            default:
                              return null
                          }
                        })}
                      {/* Fallback for messages without parts structure */}
                      {!message.parts && message.content && (
                        <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.625" }}>
                          <FormattedText content={message.content} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="message-container message-assistant">
                    <div className="message-bubble message-bubble-assistant">
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <div className="loading-dots">
                          <div className="loading-dot"></div>
                          <div className="loading-dot"></div>
                          <div className="loading-dot"></div>
                        </div>
                        <span style={{ color: "var(--gray-600)", fontSize: "0.875rem" }}>
                          {financialText
                            ? "FinanceSeer is analyzing your complete financial database..."
                            : "FinanceSeer is processing your question..."}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Invisible div to scroll to */}
                <div ref={messagesEndRef} />
              </div>

              {/* Premade Prompts */}
              <div
                style={{ borderTop: "1px solid var(--gray-200)", backgroundColor: "var(--gray-50)", padding: "1rem" }}
              >
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  <div>
                    <h4
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: "500",
                        color: "var(--gray-700)",
                        marginBottom: "0.75rem",
                      }}
                    >
                      Quick Financial Questions:
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "0.5rem" }}>
                      {premadePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handlePromptClick(prompt.text)}
                          disabled={isLoading}
                          className={`prompt-button ${prompt.color}`}
                          title={prompt.text}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            {prompt.icon}
                            <span style={{ fontSize: "0.75rem", fontWeight: "500" }}>{prompt.text}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {financialText && (
                    <div>
                      <h4
                        style={{
                          fontSize: "0.875rem",
                          fontWeight: "500",
                          color: "var(--gray-700)",
                          marginBottom: "0.75rem",
                        }}
                      >
                        Update Your Data:
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4" style={{ gap: "0.5rem" }}>
                        {dataUpdatePrompts.map((prompt, index) => (
                          <button
                            key={index}
                            onClick={() => handleInputChange({ target: { value: prompt.example } })}
                            disabled={isLoading}
                            className={`prompt-button ${prompt.color}`}
                            title={prompt.example}
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                              {prompt.icon}
                              <span style={{ fontSize: "0.75rem", fontWeight: "500" }}>{prompt.text}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                      <p style={{ fontSize: "0.75rem", color: "var(--gray-500)", marginTop: "0.5rem" }}>
                        💡 Try: "Add $50 monthly Netflix", "Update salary to $6000", "Create budget $400 groceries",
                        "Add vacation savings goal $3000"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Form */}
              <div style={{ borderTop: "1px solid var(--gray-200)", padding: "1rem", backgroundColor: "var(--white)" }}>
                <form onSubmit={handleCustomSubmit} style={{ display: "flex", gap: "0.5rem" }}>
                  <input
                    value={input}
                    onChange={handleInputChange}
                    placeholder={
                      financialText
                        ? "Ask about finances, budgets, goals, or update your data (e.g., 'Create $400 grocery budget')..."
                        : "Ask me about finances..."
                    }
                    disabled={isLoading}
                    className="input"
                    style={{
                      flex: "1",
                      borderRadius: "9999px",
                      borderColor: "var(--gray-300)",
                      fontSize: "0.875rem",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !input.trim()}
                    className="button button-primary"
                    style={{
                      borderRadius: "9999px",
                      backgroundColor: "var(--blue-600)",
                      padding: "0.5rem 1.5rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Export Options Modal */}
        <ExportOptionsModal
          isOpen={exportModal.isOpen}
          onClose={() => setExportModal({ isOpen: false, type: null, title: "", description: "" })}
          onDownload={handleDownloadPDF}
          onEmail={handleEmailReport}
          title={exportModal.title}
          description={exportModal.description}
          defaultEmail={userEmail}
        />

        {/* Debug Panel */}
        <DebugPanel />
      </div>
    </div>
  )
}
