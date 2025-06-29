"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, PieChart } from "lucide-react"

export function FinancialSummary({ transactions }) {
  if (transactions.length === 0) return null

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses

  // Category breakdown for expenses
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce(
      (acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount
        return acc
      },
      {},
    )

  const topCategories = Object.entries(expensesByCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
            {formatCurrency(netIncome)}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <PieChart className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">{transactions.length}</div>
        </CardContent>
      </Card>

      {topCategories.length > 0 && (
        <Card className="md:col-span-2 lg:col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">Top Spending Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCategories.map(([category, amount]) => {
                const percentage = (amount / totalExpenses) * 100
                return (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                      <span className="text-sm font-medium min-w-0 flex-1">{category}</span>
                      <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-32">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <div className="text-sm font-semibold">{formatCurrency(amount)}</div>
                      <div className="text-xs text-gray-500">{percentage.toFixed(1)}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
