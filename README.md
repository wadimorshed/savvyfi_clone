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
# Personal Finance App - Simplified File Structure

## Tech Stack:
- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **AI Integration**: Google Gemini API

```
finance-app/
├── package.json
├── .env
├── .gitignore
│
├── client/                    # React Frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Budget.jsx
│   │   │   ├── Transactions.jsx
│   │   │   ├── Goals.jsx
│   │   │   ├── AIAssistant.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── services/
│   │   │   └── api.js
│   │   │
│   │   ├── utils/
│   │   │   └── helpers.js
│   │   │
│   │   ├── App.jsx
│   │   └── main.jsx
│   │
│   ├── public/
│   │   └── index.html
│   │
│   └── src/index.css
│
├── server/                    # Node.js + Express Backend
│   ├── package.json
│   ├── server.js
│   │
│   ├── routes/
│   │   ├── transactions.js
│   │   ├── budgets.js
│   │   ├── goals.js
│   │   └── ai.js
│   │
│   ├── controllers/
│   │   ├── transactionController.js
│   │   ├── budgetController.js
│   │   ├── goalController.js
│   │   └── aiController.js
│   │
│   ├── services/
│   │   └── geminiService.js
│   │
│   └── data/
│       ├── transactions.json
│       ├── budgets.json
│       └── goals.json
│
└── README.md
```

## Key Features:
- **Simple structure**: Only essential files and folders
- **Clear separation**: Frontend in `client/`, backend in `server/`
- **JSON storage**: Simple file-based data storage for hackathon speed
- **Modular components**: One component per major feature
- **RESTful API**: Clean API endpoints for each data type
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

