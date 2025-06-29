import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  Calendar, 
  MessageSquare, 
  Award, 
  CreditCard, 
  PiggyBank, 
  AlertCircle,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  Home,
  BarChart3,
  Settings
} from 'lucide-react';

// Mock data for development
const mockData = {
  user: {
    name: "Alex Johnson",
    totalBalance: 12580.45,
    monthlyIncome: 5200.00,
    monthlyExpenses: 3840.25,
    healthScore: 78
  },
  transactions: [
    { id: 1, description: "Salary Deposit", amount: 5200.00, type: "income", date: "2024-06-01", category: "Salary" },
    { id: 2, description: "Grocery Store", amount: -120.50, type: "expense", date: "2024-06-02", category: "Food" },
    { id: 3, description: "Gas Station", amount: -65.00, type: "expense", date: "2024-06-03", category: "Transportation" },
    { id: 4, description: "Freelance Work", amount: 800.00, type: "income", date: "2024-06-04", category: "Freelance" },
    { id: 5, description: "Restaurant", amount: -85.30, type: "expense", date: "2024-06-05", category: "Food" }
  ],
  budgets: [
    { id: 1, category: "Food", allocated: 600, spent: 340.80, color: "#FF6B6B" },
    { id: 2, category: "Transportation", allocated: 300, spent: 180.50, color: "#4ECDC4" },
    { id: 3, category: "Entertainment", allocated: 200, spent: 125.00, color: "#45B7D1" },
    { id: 4, category: "Shopping", allocated: 400, spent: 280.30, color: "#96CEB4" }
  ],
  goals: [
    { id: 1, title: "Emergency Fund", target: 10000, current: 6500, deadline: "2024-12-31" },
    { id: 2, title: "Vacation Fund", target: 3000, current: 1200, deadline: "2024-08-15" },
    { id: 3, title: "New Car", target: 25000, current: 8500, deadline: "2025-06-01" }
  ]
};

// Layout Component
const Layout = ({ children, activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'budget', label: 'Budget', icon: BarChart3 },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'transactions', label: 'Transactions', icon: CreditCard },
    { id: 'ai', label: 'AI Assistant', icon: MessageSquare }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#f8fafc' }}>
      {/* Sidebar */}
      <nav style={{
        width: '250px',
        backgroundColor: '#1e293b',
        padding: '20px',
        boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <h1 style={{ 
            color: '#white', 
            fontSize: '24px', 
            fontWeight: 'bold',
            margin: 0,
            color: '#fff'
          }}>
            💸 FinanceApp
          </h1>
        </div>
        
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <li key={item.id} style={{ marginBottom: '8px' }}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    backgroundColor: activeTab === item.id ? '#3b82f6' : 'transparent',
                    color: activeTab === item.id ? '#fff' : '#cbd5e1',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    fontWeight: '500',
                    transition: 'all 0.2s'
                  }}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
        {children}
      </main>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ data }) => {
  const netIncome = data.user.monthlyIncome - data.user.monthlyExpenses;
  const savingsRate = ((netIncome / data.user.monthlyIncome) * 100).toFixed(1);

  return (
    <div>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          Welcome back, {data.user.name}!
        </h2>
        <p style={{ color: '#64748b', margin: '8px 0 0 0' }}>
          Here's your financial overview for this month
        </p>
      </div>

      {/* Key Metrics */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px',
        marginBottom: '30px'
      }}>
        <MetricCard
          title="Total Balance"
          value={`$${data.user.totalBalance.toLocaleString()}`}
          icon={DollarSign}
          color="#22c55e"
        />
        <MetricCard
          title="Monthly Income"
          value={`$${data.user.monthlyIncome.toLocaleString()}`}
          icon={TrendingUp}
          color="#3b82f6"
        />
        <MetricCard
          title="Monthly Expenses"
          value={`$${data.user.monthlyExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="#ef4444"
        />
        <MetricCard
          title="Savings Rate"
          value={`${savingsRate}%`}
          icon={PiggyBank}
          color="#8b5cf6"
        />
      </div>

      {/* Charts and Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
        <Card title="Recent Transactions">
          <TransactionsList transactions={data.transactions.slice(0, 5)} />
        </Card>
        
        <Card title="Financial Health">
          <div style={{ textAlign: 'center', padding: '20px' }}>
            <div style={{
              width: '120px',
              height: '120px',
              borderRadius: '50%',
              background: `conic-gradient(#22c55e 0deg ${data.user.healthScore * 3.6}deg, #e5e7eb ${data.user.healthScore * 3.6}deg 360deg)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <div style={{
                width: '90px',
                height: '90px',
                borderRadius: '50%',
                backgroundColor: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#1e293b'
              }}>
                {data.user.healthScore}
              </div>
            </div>
            <p style={{ color: '#64748b', margin: 0 }}>
              Your financial health score is looking good!
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

// Budget Component
const Budget = ({ data }) => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          Budget Overview
        </h2>
        <button style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <Plus size={16} />
          Add Budget
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {data.budgets.map(budget => (
          <BudgetCard key={budget.id} budget={budget} />
        ))}
      </div>
    </div>
  );
};

// Goals Component
const Goals = ({ data }) => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          Financial Goals
        </h2>
        <button style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <Plus size={16} />
          New Goal
        </button>
      </div>

      <div style={{ display: 'grid', gap: '20px' }}>
        {data.goals.map(goal => (
          <GoalCard key={goal.id} goal={goal} />
        ))}
      </div>
    </div>
  );
};

// Transactions Component
const Transactions = ({ data }) => {
  return (
    <div>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px'
      }}>
        <h2 style={{ fontSize: '32px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>
          Transactions
        </h2>
        <button style={{
          padding: '12px 24px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          <Plus size={16} />
          Add Transaction
        </button>
      </div>

      <Card>
        <TransactionsList transactions={data.transactions} showAll={true} />
      </Card>
    </div>
  );
};

// AI Assistant Component
const AIAssistant = () => {
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello! I'm your AI financial assistant. How can I help you today?", sender: 'ai' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    const newMessage = { id: Date.now(), text: input, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: "I understand you're asking about your finances. Let me analyze your data and provide some insights...", 
        sender: 'ai' 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div>
      <h2 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '30px', color: '#1e293b' }}>
        AI Assistant
      </h2>
      
      <Card style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', marginBottom: '20px' }}>
          {messages.map(message => (
            <div key={message.id} style={{
              marginBottom: '16px',
              display: 'flex',
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: message.sender === 'user' ? '#3b82f6' : '#f1f5f9',
                color: message.sender === 'user' ? 'white' : '#1e293b'
              }}>
                {message.text}
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: '12px', padding: '0 20px 20px' }}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask me about your finances..."
            style={{
              flex: 1,
              padding: '12px',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px'
            }}
          />
          <button
            onClick={handleSend}
            style={{
              padding: '12px 24px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Send
          </button>
        </div>
      </Card>
    </div>
  );
};

// Utility Components
const Card = ({ children, title, style = {} }) => (
  <div style={{
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '24px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    ...style
  }}>
    {title && (
      <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '20px', color: '#1e293b' }}>
        {title}
      </h3>
    )}
    {children}
  </div>
);

const MetricCard = ({ title, value, icon: Icon, color }) => (
  <Card>
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <div>
        <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 8px 0' }}>{title}</p>
        <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1e293b' }}>{value}</p>
      </div>
      <div style={{
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        backgroundColor: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={24} color="white" />
      </div>
    </div>
  </Card>
);

const BudgetCard = ({ budget }) => {
  const percentage = (budget.spent / budget.allocated) * 100;
  const remaining = budget.allocated - budget.spent;
  
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
          {budget.category}
        </h4>
        <span style={{ fontSize: '14px', color: '#64748b' }}>
          ${budget.spent.toLocaleString()} / ${budget.allocated.toLocaleString()}
        </span>
      </div>
      
      <div style={{ 
        width: '100%', 
        height: '8px', 
        backgroundColor: '#f1f5f9', 
        borderRadius: '4px',
        marginBottom: '12px'
      }}>
        <div style={{
          width: `${Math.min(percentage, 100)}%`,
          height: '100%',
          backgroundColor: percentage > 90 ? '#ef4444' : budget.color,
          borderRadius: '4px',
          transition: 'width 0.3s ease'
        }} />
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
        <span style={{ color: remaining > 0 ? '#22c55e' : '#ef4444' }}>
          ${remaining.toLocaleString()} remaining
        </span>
        <span style={{ color: '#64748b' }}>
          {percentage.toFixed(1)}%
        </span>
      </div>
    </Card>
  );
};

const GoalCard = ({ goal }) => {
  const percentage = (goal.current / goal.target) * 100;
  const remaining = goal.target - goal.current;
  
  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '16px', fontWeight: '600', margin: 0, color: '#1e293b' }}>
          {goal.title}
        </h4>
        <span style={{ fontSize: '14px', color: '#64748b' }}>
          Due: {new Date(goal.deadline).toLocaleDateString()}
        </span>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <span style={{ fontSize: '14px', color: '#64748b' }}>Progress</span>
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>
            ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
          </span>
        </div>
        
        <div style={{ 
          width: '100%', 
          height: '8px', 
          backgroundColor: '#f1f5f9', 
          borderRadius: '4px',
          marginBottom: '8px'
        }}>
          <div style={{
            width: `${Math.min(percentage, 100)}%`,
            height: '100%',
            backgroundColor: '#22c55e',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
          <span style={{ color: '#64748b' }}>
            ${remaining.toLocaleString()} to go
          </span>
          <span style={{ color: '#22c55e', fontWeight: '600' }}>
            {percentage.toFixed(1)}%
          </span>
        </div>
      </div>
    </Card>
  );
};

const TransactionsList = ({ transactions, showAll = false }) => (
  <div>
    {transactions.map(transaction => (
      <div key={transaction.id} style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f1f5f9'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '8px',
            backgroundColor: transaction.type === 'income' ? '#dcfce7' : '#fef2f2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {transaction.type === 'income' ? 
              <TrendingUp size={16} color="#22c55e" /> : 
              <TrendingDown size={16} color="#ef4444" />
            }
          </div>
          <div>
            <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#1e293b' }}>
              {transaction.description}
            </p>
            <p style={{ fontSize: '12px', color: '#64748b', margin: '2px 0 0 0' }}>
              {transaction.category} • {new Date(transaction.date).toLocaleDateString()}
            </p>
          </div>
        </div>
        <span style={{
          fontSize: '14px',
          fontWeight: '600',
          color: transaction.type === 'income' ? '#22c55e' : '#ef4444'
        }}>
          {transaction.type === 'income' ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
        </span>
      </div>
    ))}
  </div>
);

// Main App Component
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [data, setData] = useState(mockData);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard data={data} />;
      case 'budget':
        return <Budget data={data} />;
      case 'goals':
        return <Goals data={data} />;
      case 'transactions':
        return <Transactions data={data} />;
      case 'ai':
        return <AIAssistant />;
      default:
        return <Dashboard data={data} />;
    }
  };

  return (
    <div style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
        {renderContent()}
      </Layout>
    </div>
  );
};

export default App;