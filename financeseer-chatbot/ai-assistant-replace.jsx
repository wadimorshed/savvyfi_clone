"use client"

import { useState, useEffect, useRef } from "react"
import {
  MessageSquare,
  Send,
  DollarSign,
  TrendingUp,
  PiggyBank,
  Calculator,
  Calendar,
  Wallet,
  Edit3,
  Loader2,
  AlertCircle,
} from "lucide-react"

const AIAssistantInterface = ({
  financialText = null,
  userEmail = "user@example.com",
  sessionId = `session_${Date.now()}`,
  onDataUpdate = null,
  hasAcknowledgedDisclaimer = true,
}) => {
  const messagesEndRef = useRef(null)
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! I'm your FinanceSeer AI assistant. I can help you analyze your finances, create budgets, track expenses, and provide educational insights. How can I help you today?",
      role: "assistant",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    const scrollToBottom = () => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }
    const timeoutId = setTimeout(scrollToBottom, 100)
    return () => clearTimeout(timeoutId)
  }, [messages, isLoading])

  // Quick prompts for financial questions
  const quickPrompts = [
    {
      text: "Show me my spending trends",
      icon: <TrendingUp size={16} />,
      color: "#3b82f6",
    },
    {
      text: "How has my savings rate changed?",
      icon: <PiggyBank size={16} />,
      color: "#22c55e",
    },
    {
      text: "What's my biggest expense category?",
      icon: <Calculator size={16} />,
      color: "#8b5cf6",
    },
    {
      text: "Compare this month vs last month",
      icon: <Calendar size={16} />,
      color: "#f59e0b",
    },
    {
      text: "How am I doing with my budgets?",
      icon: <Wallet size={16} />,
      color: "#06b6d4",
    },
    {
      text: "Show me my goal progress",
      icon: <DollarSign size={16} />,
      color: "#10b981",
    },
  ]

  const dataUpdatePrompts = [
    {
      text: "Add new expense",
      icon: <Edit3 size={16} />,
      example: "Add $200 monthly gym membership to my expenses",
      color: "#ef4444",
    },
    {
      text: "Update income",
      icon: <TrendingUp size={16} />,
      example: "Update my salary to $5500 per month",
      color: "#22c55e",
    },
    {
      text: "Create budget",
      icon: <Calculator size={16} />,
      example: "Create a budget of $400 for groceries",
      color: "#3b82f6",
    },
    {
      text: "Add savings goal",
      icon: <PiggyBank size={16} />,
      example: "Add goal to save $5000 for vacation",
      color: "#8b5cf6",
    },
  ]

  // Simulate AI response (replace with actual API call)
  const simulateAIResponse = async (userMessage) => {
    setIsLoading(true)
    setError(null)

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500))

      let response = ""

      if (financialText) {
        if (userMessage.toLowerCase().includes("spending") || userMessage.toLowerCase().includes("expense")) {
          response = `Based on your financial data, I can see several spending patterns:

**Key Insights:**
• Your largest expense categories appear to be housing, food, and transportation
• Monthly spending has been relatively consistent
• There are opportunities to optimize your grocery and dining expenses

**Recommendations:**
• Consider setting a monthly budget for discretionary spending
• Track your food expenses more closely - this is often where savings can be found
• Review subscription services for potential cancellations

*Remember: This is educational analysis only, not professional financial advice.*`
        } else if (userMessage.toLowerCase().includes("savings") || userMessage.toLowerCase().includes("save")) {
          response = `Looking at your financial profile, here's what I can tell you about your savings:

**Savings Analysis:**
• Your current savings rate appears healthy
• Emergency fund status looks good
• You're making progress toward your financial goals

**Educational Tips:**
• Aim for 20% savings rate if possible
• Build 3-6 months of expenses in emergency fund
• Consider automating your savings

*This analysis is for educational purposes only.*`
        } else if (userMessage.toLowerCase().includes("budget")) {
          response = `Here's an educational overview of budgeting based on your data:

**Budget Recommendations:**
• 50% for needs (housing, utilities, groceries)
• 30% for wants (entertainment, dining out)
• 20% for savings and debt repayment

**Your Current Status:**
• Housing costs appear reasonable
• Food budget could be optimized
• Good progress on savings goals

*These are general educational guidelines, not personalized advice.*`
        } else {
          response = `I've analyzed your financial information. Here are some general educational insights:

**Financial Health Overview:**
• Your income and expense patterns show good financial discipline
• There are opportunities for optimization in several categories
• Your savings goals are realistic and achievable

**Next Steps to Consider:**
• Review monthly subscriptions and recurring charges
• Set up automatic transfers to savings accounts
• Track spending in high-variable categories like food and entertainment

Would you like me to dive deeper into any specific area of your finances?

*Remember: This is educational content only, not professional financial advice.*`
        }
      } else {
        response = `I'd be happy to help you with your financial questions! However, I notice you haven't uploaded any financial data yet.

**To get personalized insights:**
• Upload your financial information (CSV, bank statements, etc.)
• I can then analyze your spending patterns, savings rate, and budget allocation
• Provide educational insights based on your actual data

**General Financial Tips:**
• Track your expenses for at least a month
• Follow the 50/30/20 budgeting rule as a starting point
• Build an emergency fund of 3-6 months expenses
• Set specific, measurable financial goals

Would you like to upload your financial data to get started with personalized analysis?

*All insights provided are educational only, not professional financial advice.*`
      }

      const aiMessage = {
        id: Date.now(),
        text: response,
        role: "assistant",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, aiMessage])
    } catch (err) {
      setError({ message: "Failed to get AI response. Please try again." })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    if (!hasAcknowledgedDisclaimer) {
      alert("Please acknowledge the legal disclaimer before using the AI assistant.")
      return
    }

    const userMessage = {
      id: Date.now(),
      text: input.trim(),
      role: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input.trim()
    setInput("")

    // Check if this is a data update request
    const isDataUpdateRequest =
      currentInput.toLowerCase().includes("add ") ||
      currentInput.toLowerCase().includes("remove ") ||
      currentInput.toLowerCase().includes("update ") ||
      currentInput.toLowerCase().includes("change ") ||
      currentInput.toLowerCase().includes("delete ") ||
      currentInput.toLowerCase().includes("create ")

    if (isDataUpdateRequest && financialText && onDataUpdate) {
      // Handle data updates if callback is provided
      const updateDescription = `Updated based on: "${currentInput}"`
      onDataUpdate(financialText + `\n[UPDATE: ${currentInput}]`, updateDescription)

      const updateMessage = {
        id: Date.now() + 1,
        text: `✅ **Data Updated!** ${updateDescription}\n\nYour financial information has been updated. What would you like to analyze next?`,
        role: "assistant",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, updateMessage])
    } else {
      // Normal AI response
      await simulateAIResponse(currentInput)
    }
  }

  const handlePromptClick = (promptText) => {
    if (!hasAcknowledgedDisclaimer) {
      alert("Please acknowledge the legal disclaimer before using the AI assistant.")
      return
    }

    setInput(promptText)
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} })
    }, 100)
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  return (
    <div style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <div
        style={{
          padding: "20px",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "12px",
              backgroundColor: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MessageSquare size={20} color="white" />
          </div>
          <div>
            <h2
              style={{
                fontSize: "24px",
                fontWeight: "bold",
                margin: 0,
                color: "#1e293b",
              }}
            >
              FinanceSeer AI Assistant
            </h2>
            <p
              style={{
                fontSize: "14px",
                color: "#64748b",
                margin: 0,
              }}
            >
              {financialText
                ? "Get educational insights from your complete financial database"
                : "Upload your financial data to get personalized insights"}
            </p>
          </div>
        </div>

        {/* Status indicators */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          <span
            style={{
              fontSize: "12px",
              backgroundColor: "#fbbf24",
              color: "#92400e",
              padding: "4px 8px",
              borderRadius: "12px",
              fontWeight: "500",
            }}
          >
            Educational Only
          </span>
          {financialText && (
            <span
              style={{
                fontSize: "12px",
                backgroundColor: "#22c55e",
                color: "#fff",
                padding: "4px 8px",
                borderRadius: "12px",
                fontWeight: "500",
              }}
            >
              Data Loaded ({Math.round(financialText.length / 1000)}k chars)
            </span>
          )}
        </div>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px",
          backgroundColor: "#f8fafc",
        }}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              marginBottom: "16px",
              display: "flex",
              justifyContent: message.role === "user" ? "flex-end" : "flex-start",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: "16px",
                backgroundColor: message.role === "user" ? "#3b82f6" : "#fff",
                color: message.role === "user" ? "white" : "#1e293b",
                boxShadow: message.role === "user" ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
                border: message.role === "user" ? "none" : "1px solid #e2e8f0",
              }}
            >
              <div
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.5",
                }}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div style={{ display: "flex", justifyContent: "flex-start", marginBottom: "16px" }}>
            <div
              style={{
                maxWidth: "75%",
                padding: "12px 16px",
                borderRadius: "16px",
                backgroundColor: "#fff",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                border: "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} color="#3b82f6" />
              <span style={{ color: "#64748b", fontSize: "14px" }}>FinanceSeer is analyzing your data...</span>
            </div>
          </div>
        )}

        {error && (
          <div
            style={{
              backgroundColor: "#fef2f2",
              border: "1px solid #fecaca",
              borderRadius: "8px",
              padding: "12px",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <AlertCircle size={16} color="#ef4444" />
            <span style={{ color: "#dc2626", fontSize: "14px" }}>Error: {error.message}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions */}
      <div
        style={{
          padding: "16px 20px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#fff",
        }}
      >
        <div style={{ marginBottom: "16px" }}>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#374151",
              marginBottom: "8px",
            }}
          >
            Quick Questions:
          </h4>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "8px",
            }}
          >
            {quickPrompts.map((prompt, index) => (
              <button
                key={index}
                onClick={() => handlePromptClick(prompt.text)}
                disabled={isLoading}
                style={{
                  padding: "8px 12px",
                  backgroundColor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "12px",
                  fontWeight: "500",
                  color: "#374151",
                  transition: "all 0.2s",
                  textAlign: "left",
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = "#f1f5f9"
                  e.target.style.borderColor = prompt.color
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = "#f8fafc"
                  e.target.style.borderColor = "#e2e8f0"
                }}
              >
                <span style={{ color: prompt.color }}>{prompt.icon}</span>
                {prompt.text}
              </button>
            ))}
          </div>
        </div>

        {financialText && (
          <div style={{ marginBottom: "16px" }}>
            <h4
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "#374151",
                marginBottom: "8px",
              }}
            >
              Update Your Data:
            </h4>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "8px",
              }}
            >
              {dataUpdatePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => setInput(prompt.example)}
                  disabled={isLoading}
                  title={prompt.example}
                  style={{
                    padding: "8px 12px",
                    backgroundColor: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "12px",
                    fontWeight: "500",
                    color: "#374151",
                    transition: "all 0.2s",
                    textAlign: "left",
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.backgroundColor = "#f1f5f9"
                    e.target.style.borderColor = prompt.color
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.backgroundColor = "#f8fafc"
                    e.target.style.borderColor = "#e2e8f0"
                  }}
                >
                  <span style={{ color: prompt.color }}>{prompt.icon}</span>
                  {prompt.text}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "20px",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "#fff",
        }}
      >
        <form onSubmit={handleSubmit} style={{ display: "flex", gap: "12px" }}>
          <input
            type="text"
            value={input}
            onChange={handleInputChange}
            placeholder={
              financialText ? "Ask about finances, budgets, goals, or update your data..." : "Ask me about finances..."
            }
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 16px",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              fontSize: "14px",
              outline: "none",
              transition: "border-color 0.2s",
            }}
            onFocus={(e) => {
              e.target.style.borderColor = "#3b82f6"
            }}
            onBlur={(e) => {
              e.target.style.borderColor = "#e2e8f0"
            }}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSubmit(e)
              }
            }}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            style={{
              padding: "12px 20px",
              backgroundColor: isLoading || !input.trim() ? "#9ca3af" : "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "12px",
              cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "14px",
              fontWeight: "500",
              transition: "background-color 0.2s",
            }}
          >
            {isLoading ? <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> : <Send size={16} />}
          </button>
        </form>
      </div>

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}

export default AIAssistantInterface
