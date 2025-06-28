import React, { useState } from 'react';
import { 
  Plus, 
  Edit2, 
  Trash2,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  TrendingDown,
  PieChart,
  DollarSign,
  Calendar,
  Target,
  Bot,
  X,
  Save
} from 'lucide-react';

const Budget = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [viewMode, setViewMode] = useState('monthly'); // monthly, weekly, yearly

  const [newBudget, setNewBudget] = useState({
    category: '',
    amount: '',
    period: 'monthly',
    alertThreshold: 80
  });

  // Mock budget data
  const [budgets, setBudgets] = useState([
    { 
      id: 1, 
      category: 'Housing', 
      budgeted: 2000, 
      spent: 1800, 
      period: 'monthly',
      alertThreshold: 80,
      color: 'bg-blue-500'
    },
    { 
      id: 2, 
      category: 'Food', 
      budgeted: 800, 
      spent: 680, 
      period: 'monthly',
      alertThreshold: 85,
      color: 'bg-green-500'
    },
    { 
      id: 3, 
      category: 'Transportation', 
      budgeted: 400, 
      spent: 320, 
      period: 'monthly',
      alertThreshold: 75,
      color: 'bg-yellow-500'
    },
    { 
      id: 4, 
      category: 'Entertainment', 
      budgeted: 300, 
      spent: 280, 
      period: 'monthly',
      alertThreshold: 90,
      color: 'bg-purple-500'
    },
    { 
      id: 5, 
      category: 'Shopping', 
      budgeted: 500, 
      spent: 120, 
      period: 'monthly',
      alertThreshold: 80,
      color: 'bg-pink-500'
    },
    { 
      id: 6, 
      category: 'Healthcare', 
      budgeted: 200, 
      spent: 190, 
      period: 'monthly',
      alertThreshold: 85,
      color: 'bg-red-500'
    }
  ]);

  const categories = [
    'Housing', 'Food', 'Transportation', 'Entertainment', 'Shopping', 
    'Healthcare', 'Utilities', 'Insurance', 'Education', 'Personal Care', 'Other'
  ];

  const aiSuggestions = [
    {
      category: 'Food',
      suggestion: 'Consider reducing dining out by $150/month. Your food spending is 15% above average.',
      savings: 150
    },
    {
      category: 'Entertainment',
      suggestion: 'Great job staying within budget! You could reallocate $50 to savings.',
      savings: 50
    },
    {
      category: 'Transportation',
      suggestion: 'Your gas spending is low. Consider increasing your transportation budget by $100 for maintenance.',
      savings: -100
    }
  ];

  const handleAddBudget = (e) => {
    e.preventDefault();
    const budget = {
      id: budgets.length + 1,
      category: newBudget.category,
      budgeted: parseFloat(newBudget.amount),
      spent: 0,
      period: newBudget.period,
      alertThreshold: newBudget.alertThreshold,
      color: `bg-${['blue', 'green', 'yellow', 'purple', 'pink', 'red', 'indigo', 'orange'][Math.floor(Math.random() * 8)]}-500`
    };
    
    setBudgets([...budgets, budget]);
    setNewBudget({ category: '', amount: '', period: 'monthly', alertThreshold: 80 });
    setShowAddModal(false);
  };

  const handleEditBudget = (budget) => {
    setEditingBudget({
      ...budget,
      amount: budget.budgeted.toString()
    });
    setShowEditModal(true);
  };

  const handleUpdateBudget = (e) => {
    e.preventDefault();
    setBudgets(budgets.map(budget => 
      budget.id === editingBudget.id 
        ? {
            ...budget,
            budgeted: parseFloat(editingBudget.amount),
            alertThreshold: editingBudget.alertThreshold
          }
        : budget
    ));
    setShowEditModal(false);
    setEditingBudget(null);
  };

  const handleDeleteBudget = (id) => {
    setBudgets(budgets.filter(budget => budget.id !== id));
  };

  const getBudgetStatus = (spent, budgeted, alertThreshold) => {
    const percentage = (spent / budgeted) * 100;
    if (percentage >= 100) return { status: 'exceeded', color: 'text-red-600', bgColor: 'bg-red-50' };
    if (percentage >= alertThreshold) return { status: 'warning', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    return { status: 'good', color: 'text-green-600', bgColor: 'bg-green-50' };
  };

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const budgetsOnTrack = budgets.filter(budget => {
    const percentage = (budget.spent / budget.budgeted) * 100;
    return percentage < budget.alertThreshold;
  }).length;

  const ProgressBar = ({ percentage, color = 'bg-blue-500', alertThreshold }) => {
    const alertPosition = alertThreshold;
    return (
      <div className="relative w-full bg-gray-200 rounded-full h-3">
        {/* Alert threshold indicator */}
        <div 
          className="absolute top-0 w-0.5 h-3 bg-yellow-400 z-10"
          style={{ left: `${alertPosition}%` }}
        />
        <div 
          className={`${
            percentage >= 100 ? 'bg-red-500' : 
            percentage >= alertPosition ? 'bg-yellow-500' : color
          } h-3 rounded-full transition-all duration-300`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
    );
  };

  const BudgetModal = ({ isEdit = false }) => (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-xl bg-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Budget' : 'Add New Budget'}
          </h3>
          <button
            onClick={() => {
              if (isEdit) {
                setShowEditModal(false);
                setEditingBudget(null);
              } else {
                setShowAddModal(false);
              }
            }}
            className="text-gray-400 hover:text-gray-600 p-1 rounded-md hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={isEdit ? handleUpdateBudget : handleAddBudget} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              required
              value={isEdit ? editingBudget?.category : newBudget.category}
              onChange={(e) => {
                if (isEdit) {
                  setEditingBudget({...editingBudget, category: e.target.value});
                } else {
                  setNewBudget({...newBudget, category: e.target.value});
                }
              }}
              disabled={isEdit}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
            >
              <option value="">Select a category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Amount
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={isEdit ? editingBudget?.amount : newBudget.amount}
              onChange={(e) => {
                if (isEdit) {
                  setEditingBudget({...editingBudget, amount: e.target.value});
                } else {
                  setNewBudget({...newBudget, amount: e.target.value});
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0.00"
            />
          </div>

          {!isEdit && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Period
              </label>
              <select
                value={newBudget.period}
                onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alert Threshold ({isEdit ? editingBudget?.alertThreshold : newBudget.alertThreshold}%)
            </label>
            <input
              type="range"
              min="50"
              max="95"
              value={isEdit ? editingBudget?.alertThreshold : newBudget.alertThreshold}
              onChange={(e) => {
                if (isEdit) {
                  setEditingBudget({...editingBudget, alertThreshold: parseInt(e.target.value)});
                } else {
                  setNewBudget({...newBudget, alertThreshold: parseInt(e.target.value)});
                }
              }}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>50%</span>
              <span>95%</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                if (isEdit) {
                  setShowEditModal(false);
                  setEditingBudget(null);
                } else {
                  setShowAddModal(false);
                }
              }}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {isEdit ? 'Update Budget' : 'Add Budget'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Budgeted</p>
              <p className="text-2xl font-bold text-gray-900">${totalBudgeted.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-blue-50">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-gray-900">${totalSpent.toLocaleString()}</p>
            </div>
            <div className="p-3 rounded-lg bg-red-50">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${totalBudgeted - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${(totalBudgeted - totalSpent).toLocaleString()}
              </p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Track</p>
              <p className="text-2xl font-bold text-green-600">{budgetsOnTrack}/{budgets.length}</p>
            </div>
            <div className="p-3 rounded-lg bg-green-50">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-semibold text-gray-900">Budget Overview</h2>
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('monthly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'monthly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setViewMode('weekly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'weekly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setViewMode('yearly')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'yearly' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600'
                }`}
              >
                Yearly
              </button>
            </div>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Budget
          </button>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200 p-6">
        <div className="flex items-center mb-4">
          <div className="p-2 bg-purple-100 rounded-lg mr-3">
            <Bot className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">AI Budget Suggestions</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {aiSuggestions.map((suggestion, index) => (
            <div key={index} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{suggestion.category}</span>
                <span className={`text-sm font-semibold ${
                  suggestion.savings > 0 ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {suggestion.savings > 0 ? '+' : ''}${Math.abs(suggestion.savings)}
                </span>
              </div>
              <p className="text-sm text-gray-600">{suggestion.suggestion}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Budget Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.budgeted) * 100;
          const status = getBudgetStatus(budget.spent, budget.budgeted, budget.alertThreshold);
          
          return (
            <div key={budget.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-3 h-3 ${budget.color} rounded-full mr-3`} />
                  <h3 className="text-lg font-semibold text-gray-900">{budget.category}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEditBudget(budget)}
                    className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteBudget(budget.id)}
                    className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">
                    ${budget.spent.toLocaleString()} / ${budget.budgeted.toLocaleString()}
                  </span>
                  <span className={`text-sm font-semibold ${status.color}`}>
                    {percentage.toFixed(1)}%
                  </span>
                </div>
                <ProgressBar 
                  percentage={percentage} 
                  color={budget.color}
                  alertThreshold={budget.alertThreshold}
                />
              </div>

              <div className={`flex items-center p-3 rounded-lg ${status.bgColor}`}>
                {status.status === 'exceeded' ? (
                  <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                ) : status.status === 'warning' ? (
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                ) : (
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                )}
                <span className={`text-sm font-medium ${status.color}`}>
                  {status.status === 'exceeded' 
                    ? `Over budget by $${(budget.spent - budget.budgeted).toLocaleString()}`
                    : status.status === 'warning'
                    ? 'Approaching limit'
                    : `$${(budget.budgeted - budget.spent).toLocaleString()} remaining`
                  }
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {budgets.length === 0 && (
        <div className="text-center py-12">
          <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No budgets created yet</h3>
          <p className="text-gray-500 mb-4">Create your first budget to start tracking your spending.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Budget
          </button>
        </div>
      )}

      {/* Modals */}
      {showAddModal && <BudgetModal />}
      {showEditModal && <BudgetModal isEdit={true} />}
    </div>
  );
};

export default Budget;