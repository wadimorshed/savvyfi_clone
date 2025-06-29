"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Shield, ChevronDown, ChevronUp, Info } from "lucide-react"

export function LegalDisclaimer({ variant = "full" }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (variant === "compact") {
    return (
      <div className="alert" style={{ borderColor: "var(--amber-200)", backgroundColor: "var(--amber-50)" }}>
        <AlertTriangle style={{ height: "1rem", width: "1rem", color: "var(--amber-600)" }} />
        <div style={{ color: "var(--amber-800)" }}>
          <strong>Important:</strong> This AI tool provides educational information only and is not a substitute for
          professional financial advice.
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            style={{
              color: "var(--amber-700)",
              textDecoration: "underline",
              marginLeft: "0.25rem",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            {isExpanded ? "Show less" : "Read full disclaimer"}
          </button>
        </div>
      </div>
    )
  }

  return (
    <Card style={{ borderColor: "var(--amber-200)", backgroundColor: "var(--amber-50)" }}>
      <CardHeader style={{ paddingBottom: "0.75rem" }}>
        <CardTitle style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "var(--amber-800)" }}>
          <Shield style={{ width: "1.25rem", height: "1.25rem" }} />
          Important Legal Disclaimer
          {variant === "collapsible" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                marginLeft: "auto",
                color: "var(--amber-700)",
                backgroundColor: "transparent",
              }}
            >
              {isExpanded ? (
                <ChevronUp style={{ width: "1rem", height: "1rem" }} />
              ) : (
                <ChevronDown style={{ width: "1rem", height: "1rem" }} />
              )}
            </Button>
          )}
        </CardTitle>
      </CardHeader>

      {(variant === "full" || isExpanded) && (
        <CardContent style={{ color: "var(--amber-800)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
            <AlertTriangle
              style={{
                width: "1.25rem",
                height: "1.25rem",
                color: "var(--amber-600)",
                marginTop: "0.125rem",
                flexShrink: 0,
              }}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontWeight: "600" }}>
                FinanceSeer is NOT a licensed financial advisor, certified financial planner, or investment
                professional.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.875rem" }}>
                <p>
                  <strong>Educational Purpose Only:</strong> All information, analysis, and suggestions provided are for
                  educational and informational purposes only.
                </p>

                <p>
                  <strong>Not Financial Advice:</strong> Nothing provided by this AI constitutes financial, investment,
                  tax, legal, or professional advice.
                </p>

                <p>
                  <strong>No Guarantees:</strong> We make no representations about the accuracy, completeness, or
                  suitability of any information provided.
                </p>

                <p>
                  <strong>Your Responsibility:</strong> You are solely responsible for your financial decisions. Always
                  consult with qualified professionals before making significant financial choices.
                </p>

                <p>
                  <strong>Data Privacy:</strong> While we process your financial data to provide insights, ensure you're
                  comfortable sharing this information.
                </p>

                <p>
                  <strong>No Liability:</strong> We disclaim all liability for any financial losses or damages resulting
                  from use of this tool.
                </p>
              </div>

              <div
                style={{
                  backgroundColor: "var(--amber-100)",
                  padding: "0.75rem",
                  borderRadius: "0.5rem",
                  border: "1px solid var(--amber-200)",
                }}
              >
                <p style={{ fontSize: "0.875rem", fontWeight: "500" }}>
                  <Info style={{ width: "1rem", height: "1rem", display: "inline", marginRight: "0.25rem" }} />
                  <strong>Recommendation:</strong> Use FinanceSeer as a starting point for financial awareness, then
                  consult with licensed financial professionals for personalized advice.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
