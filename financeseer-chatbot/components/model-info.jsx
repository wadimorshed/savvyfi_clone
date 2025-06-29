"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, Zap } from "lucide-react"

export function ModelInfo() {
  return (
    <Card
      style={{
        marginBottom: "1rem",
        background: "linear-gradient(to right, var(--purple-50), var(--blue-50))",
        borderColor: "var(--purple-200)",
      }}
    >
      <CardHeader style={{ paddingBottom: "0.75rem" }}>
        <CardTitle
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            fontWeight: "500",
            color: "var(--purple-800)",
          }}
        >
          <Brain style={{ width: "1rem", height: "1rem" }} />
          FinanceSeer AI Model Information
        </CardTitle>
      </CardHeader>
      <CardContent style={{ paddingTop: "0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            fontSize: "0.875rem",
            color: "var(--purple-700)",
          }}
        >
          <Zap style={{ width: "0.75rem", height: "0.75rem" }} />
          <span>Powered by Google Gemini 2.5 Flash</span>
          <span
            style={{
              fontSize: "0.75rem",
              backgroundColor: "var(--purple-100)",
              padding: "0.25rem 0.5rem",
              borderRadius: "9999px",
            }}
          >
            Fast & Accurate
          </span>
        </div>
        <p style={{ fontSize: "0.75rem", color: "var(--purple-600)", marginTop: "0.5rem" }}>
          Advanced AI model optimized for financial analysis and personalized educational insights
        </p>
      </CardContent>
    </Card>
  )
}
