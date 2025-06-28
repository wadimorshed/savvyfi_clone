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

| Layer       | Technology                      |
|-------------|---------------------------------|
| Frontend        | React.js + Tailwind CSS     |
| Backend         | Node.js + Express.js        |
| AI Integration  | Google Gemini API           |
| Database        | SQLite                      |

---

## File Structure:
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

## 🧑‍💻 Getting Started

Follow these instructions to set up and run the Personal Finance App locally for development or testing.

### ✅ Prerequisites

Before you begin, make sure you have the following installed:

- [Node.js](https://nodejs.org/en/) (v18 or later recommended)
- [npm](https://www.npmjs.com/)
- [Git](https://git-scm.com/)
- [SQLite](https://www.sqlite.org/index.html)

---

### ⚙️ Setup Instructions

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/finance-app.git
   cd finance-app
   ```

2. **Install backend dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install frontend dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Environment variables**

   - Create a `.env` file in the root directory and configure the following (example):

     ```env
     GEMINI_API_KEY=your_google_gemini_api_key
     PORT=5000
     ```

5. **Run the development servers**

   - **Backend**

     ```bash
     cd ../server
     npm run dev
     ```

   - **Frontend (in a new terminal tab/window)**

     ```bash
     cd ../client
     npm run dev
     ```

6. **Access the app**

   Open your browser and navigate to:  
   👉 [http://localhost:5173](http://localhost:5173)

---

### 🧪 Optional: Seed or reset data

Sample JSON data for transactions, budgets, and goals are located in:

```bash
server/data/
```

Feel free to modify or reset the content for testing purposes.


---

## 📄 License

This project is licensed under the MIT License.

