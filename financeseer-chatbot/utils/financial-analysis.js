export function analyzeFinancialData(transactions) {
  if (transactions.length === 0) {
    return {
      summary: "No financial data available",
      insights: [],
      recommendations: [],
    }
  }

  const totalIncome = transactions.filter((t) => t.type === "income").reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions.filter((t) => t.type === "expense").reduce((sum, t) => sum + t.amount, 0)

  const netIncome = totalIncome - totalExpenses
  const savingsRate = totalIncome > 0 ? (netIncome / totalIncome) * 100 : 0

  // Category analysis
  const expensesByCategory = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount
      return acc
    }, {})

  const topSpendingCategory = Object.entries(expensesByCategory).sort(([, a], [, b]) => b - a)[0]

  // Monthly analysis
  const monthlyData = transactions.reduce((acc, t) => {
    const month = t.date.substring(0, 7) // YYYY-MM
    if (!acc[month]) {
      acc[month] = { income: 0, expenses: 0 }
    }
    if (t.type === "income") {
      acc[month].income += t.amount
    } else {
      acc[month].expenses += t.amount
    }
    return acc
  }, {})

  const avgMonthlyIncome =
    Object.values(monthlyData).reduce((sum, m) => sum + m.income, 0) / Object.keys(monthlyData).length

  const avgMonthlyExpenses =
    Object.values(monthlyData).reduce((sum, m) => sum + m.expenses, 0) / Object.keys(monthlyData).length

  // Generate insights
  const insights = []
  const recommendations = []

  if (savingsRate < 10) {
    insights.push(`Your savings rate is ${savingsRate.toFixed(1)}%, which is below the recommended 20%`)
    recommendations.push("Consider reducing expenses or increasing income to improve your savings rate")
  } else if (savingsRate >= 20) {
    insights.push(`Excellent! Your savings rate is ${savingsRate.toFixed(1)}%`)
  }

  if (topSpendingCategory) {
    insights.push(
      `Your highest spending category is ${topSpendingCategory[0]} at $${topSpendingCategory[1].toFixed(2)}`,
    )

    if (topSpendingCategory[1] / totalExpenses > 0.3) {
      recommendations.push(
        `Consider reviewing your ${topSpendingCategory[0]} expenses as they represent over 30% of your total spending`,
      )
    }
  }

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount)

  const summary = `
Financial Overview:
- Total Income: ${formatCurrency(totalIncome)}
- Total Expenses: ${formatCurrency(totalExpenses)}
- Net Income: ${formatCurrency(netIncome)}
- Savings Rate: ${savingsRate.toFixed(1)}%
- Average Monthly Income: ${formatCurrency(avgMonthlyIncome)}
- Average Monthly Expenses: ${formatCurrency(avgMonthlyExpenses)}
- Number of Transactions: ${transactions.length}

Top Spending Categories:
${Object.entries(expensesByCategory)
  .sort(([, a], [, b]) => b - a)
  .slice(0, 5)
  .map(([cat, amt]) => `- ${cat}: ${formatCurrency(amt)}`)
  .join("\n")}
`

  return {
    summary,
    insights,
    recommendations,
    totalIncome,
    totalExpenses,
    netIncome,
    savingsRate,
    expensesByCategory,
    monthlyData,
  }
}
