# 💸 Personal Finance App

An intuitive, **AI-assisted personal finance platform** that helps users track spending, set budgets, manage savings goals, and forecast future finances — all in one place. Whether you're new to budgeting or aiming to level up your financial planning, this app adapts to your financial behavior and guides you toward smarter money decisions.

Built with a modern tech stack and powered by AI via Google Gemini, our goal is to make managing money simpler, smarter, and more personalized.

---

## 🚀 Features

- 📊 **Dashboard**: Real-time overview of income, expenses, net worth, and recent activity  
- 💼 **Budgets**: Set, track, and edit budget rules with AI-generated suggestions  
- 💰 **Goals**: Create and manage savings targets, debt plans, and financial forecasts  
- 📆 **Reminders**: Subscription tracker, bill alerts, and calendar view  
- 🤖 **AI Assistant**: Chat interface for insights, spending advice, and predictive analysis  
- 🏆 **Gamification**: Health score, achievement badges, and monthly financial reports  

---

## 🛠️ Tech Stack

| Layer       | Technology                       |
|-------------|----------------------------------|
| Frontend    | React.js + Tailwind CSS + Vite   |
| Backend     | Node.js + Express.js             |
| AI Engine   | Google Gemini API                |
| Database    | JSON files *(upgradable to MongoDB/PostgreSQL)*

---

## 🗂️ Project Structure

```plaintext
finance-app/
├── README.md
├── package.json
├── .env.example
├── .gitignore
│
├── client/                    # React Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   │
│   ├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Layout.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── LoadingSpinner.jsx
│   │   ├── dashboard/
│   │   │   ├── ExpenseChart.jsx
│   │   │   ├── IncomeExpenseGraph.jsx
│   │   │   ├── RecentActivity.jsx
│   │   │   └── NetWorthTracker.jsx
│   │   ├── budget/
│   │   │   ├── BudgetOverview.jsx
│   │   │   ├── BudgetRuleEditor.jsx
│   │   │   ├── AIBudgetSuggestions.jsx
│   │   │   └── SharedBudgets.jsx
│   │   ├── transactions/
│   │   │   ├── TransactionList.jsx
│   │   │   ├── TransactionForm.jsx
│   │   │   ├── CategoryManager.jsx
│   │   │   └── SpendingTrends.jsx
│   │   ├── goals/
│   │   │   ├── SavingsGoals.jsx
│   │   │   ├── DebtPlanner.jsx
│   │   │   ├── ForecastChart.jsx
│   │   │   └── WhatIfScenarios.jsx
│   │   ├── reminders/
│   │   │   ├── CalendarView.jsx
│   │   │   ├── SubscriptionTracker.jsx
│   │   │   └── AlertsList.jsx
│   │   ├── ai-assistant/
│   │   │   ├── ChatInterface.jsx
│   │   │   ├── PromptSuggestions.jsx
│   │   │   └── AIInsights.jsx
│   │   └── gamification/
│   │       ├── HealthScore.jsx
│   │       ├── AchievementBadges.jsx
│   │       └── MonthlyReport.jsx
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Budget.jsx
│   │   ├── Transactions.jsx
│   │   ├── Goals.jsx
│   │   ├── Reminders.jsx
│   │   ├── Assistant.jsx
│   │   └── Profile.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useTransactions.js
│   │   ├── useBudget.js
│   │   ├── useGoals.js
│   │   └── useAI.js
│   ├── services/
│   │   ├── api.js
│   │   ├── geminiAPI.js
│   │   ├── transactionService.js
│   │   ├── budgetService.js
│   │   └── storageService.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── formatters.js
│   │   ├── calculations.js
│   │   └── validators.js
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ThemeContext.jsx
│   │   └── AppContext.jsx
│   ├── styles/
│   │   ├── globals.css
│   │   ├── components.css
│   │   └── themes.css
│   ├── data/
│   │   ├── mockData.js
│   │   └── categories.js
│   ├── App.jsx
│   └── main.jsx
│
├── public/
│   ├── index.html
│   ├── favicon.ico
│   └── icons/
│
└── docs/
    ├── API.md
    ├── FEATURES.md
    └── DEPLOYMENT.md
```

## 📦 Getting Started

### ✅ Prerequisites

- Node.js (v18 or later)
- npm or yarn
- Vite globally installed *(optional, for local builds)*

### 🚀 Setup Instructions

```bash
# 1. Clone the repository
git clone https://github.com/your-username/finance-app.git
cd finance-app

# 2. Navigate to the frontend
cd client

# 3. Install dependencies
npm install

# 4. Run the development server
npm run dev
```

---

## 📄 License

This project is licensed under the MIT License.

