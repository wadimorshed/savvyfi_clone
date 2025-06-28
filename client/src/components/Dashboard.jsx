import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard, 
  Target,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3
} from 'lucide-react';

const Dashboard = () => {
  // Mock data - in real app this would come from API
  const financialData = {
    netWorth: 45750,
    monthlyIncome: 7500,
    monthlyExpenses: 4200,
    savingsRate: 44,
    budgetUsed: 68,
    emergencyFund: 15000,
    emergencyFundTarget: 22500
  };

  const recentTransactions = [
    { id: 1, description: 'Salary Deposit', amount: 7500, type: 'income', date: '2025-06-27', category: 'Salary' },
    { id: 2, description: 'Rent Payment', amount: -1800, type: 'expense', date: '2025-06-26', category: 'Housing' },
    { id: 3, description: 'Grocery Shopping', amount: -245, type: 'expense', date: '2025-06-25', category: 'Food' },
    { id: 4, description: 'Investment Transfer', amount: -2000, type: 'transfer', date: '2025-06-24', category: 'Investment' },
    { id: 5, description: 'Freelance Payment', amount: 1200, type: 'income', date: '2025-06-24', category: 'Freelance' }
  ];

  const budgetCategories = [
    { name: 'Housing', spent: 1800, budget: 2000, color: 'bg-blue-500' },
    { name: 'Food', spent: 680, budget: 800, color: 'bg-green-500' },
    { name: 'Transportation', spent: 320, budget: 400, color: 'bg-yellow-500' },
    { name: 'Entertainment', spent: 280, budget: 300, color: 'bg-purple-500' },
    { name: 'Utilities', spent: 150, budget: 200, color: 'bg-red-500' }
  ];

  const StatCard = ({ title, value, change, changeType, icon: Icon, prefix = '$' }) => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <div className={`flex items-center mt-2 text-sm ${
              changeType === 'positive' ? 'text-green-600' : 'text-red-600'
            }`}>
              {changeType === 'positive' ? (
                <ArrowUpRight className="w-4 h-4 mr-1" />
              ) : (
                <ArrowDownRight className="w-4 h-4 mr-1" />
              )}
              {change}
            </div>
          )}
        </div>
        <div className={`p-3 rounded-lg ${
          changeType === 'positive' ? 'bg-green-50' : 'bg-blue-50'
        }`}>
          <Icon className={`w-6 h-6 ${
            changeType === 'positive' ? 'text-green-600' : 'text-blue-600'
          }`} />
        </div>
      </div>
    </div>
  );

  const ProgressBar = ({ percentage, color = 'bg-blue-500' }) => (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`${color} h-2 rounded-full transition-all duration-300`}
        style={{ width: `${Math.min(percentage, 100)}%` }}
      ></div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
        <h2 className="text-2xl font-bold mb-2">Good morning, John! 👋</h2>
        <p className="text-blue-100">
          You're doing great! Your savings rate is {financialData.savingsRate}% this month.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Net Worth"
          value={financialData.netWorth}
          change="+12.5% from last month"
          changeType="positive"
          icon={TrendingUp}
        />
        <StatCard
          title="Monthly Income"
          value={financialData.monthlyIncome}
          change="+8.2% from last month"
          changeType="positive"
          icon={DollarSign}
        />
        <StatCard
          title="Monthly Expenses"
          value={financialData.monthlyExpenses}
          change="-3.1% from last month"
          changeType="positive"
          icon={CreditCard}
        />
        <StatCard
          title="Savings Rate"
          value={financialData.savingsRate}
          change="+5% from last month"
          changeType="positive"
          icon={Target}
          prefix=""
          suffix="%"
        />
      </div>

      {/* Budget Overview & Emergency Fund */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
            <div className="flex items-center text-sm text-gray-600">
              <PieChart className="w-4 h-4 mr-1" />
              {financialData.budgetUsed}% used
            </div>
          </div>
          
          <div className="space-y-4">
            {budgetCategories.map((category) => {
              const percentage = (category.spent / category.budget) * 100;
              return (
                <div key={category.name}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    <span className="text-sm text-gray-600">
                      ${category.spent} / ${category.budget}
                    </span>
                  </div>
                  <ProgressBar percentage={percentage} color={category.color} />
                </div>
              );
            })}
          </div>
        </div>

        {/* Emergency Fund */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Emergency Fund</h3>
            <AlertCircle className="w-5 h-5 text-orange-500" />
          </div>
          
          <div className="mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-600">
                ${financialData.emergencyFund.toLocaleString()} / ${financialData.emergencyFundTarget.toLocaleString()}
              </span>
            </div>
            <ProgressBar 
              percentage={(financialData.emergencyFund / financialData.emergencyFundTarget) * 100} 
              color="bg-orange-500" 
            />
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <p className="text-sm text-orange-800">
              You're ${(financialData.emergencyFundTarget - financialData.emergencyFund).toLocaleString()} away from your 3-month emergency fund goal!
            </p>
          </div>
        </div>
      </div>

      {/* Recent Transactions & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
            <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {recentTransactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'income' 
                      ? 'bg-green-100' 
                      : transaction.type === 'expense' 
                        ? 'bg-red-100' 
                        : 'bg-blue-100'
                  }`}>
                    {transaction.type === 'income' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : transaction.type === 'expense' ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : (
                      <ArrowUpRight className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-xs text-gray-500">{transaction.category} • {transaction.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-semibold ${
                  transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
          
          <div className="space-y-3">
            <button className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
              Add Transaction
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Create Budget
            </button>
            <button className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Set Goal
            </button>
            <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:opacity-90 transition-opacity">
              Ask AI Assistant
            </button>
          </div>

          {/* Financial Health Score */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Financial Health</span>
              <span className="text-sm font-bold text-green-600">82/100</span>
            </div>
            <ProgressBar percentage={82} color="bg-green-500" />
            <p className="text-xs text-gray-500 mt-2">Excellent! Keep up the good work.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;