import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  TrendingUp, 
  PieChart, 
  Target, 
  AlertCircle,
  Lightbulb,
  DollarSign,
  Calendar,
  BarChart3
} from 'lucide-react';

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: "Hello! I'm your AI financial assistant. I can help you with budgeting advice, spending analysis, goal planning, and financial insights. What would you like to know?",
      timestamp: new Date().toISOString()
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const quickQuestions = [
    {
      icon: TrendingUp,
      text: "How can I improve my spending habits?",
      category: "Spending Analysis"
    },
    {
      icon: PieChart,
      text: "Analyze my budget allocation",
      category: "Budget Review"
    },
    {
      icon: Target,
      text: "Help me set a realistic savings goal",
      category: "Goal Setting"
    },
    {
      icon: DollarSign,
      text: "What's my financial health score?",
      category: "Health Check"
    },
    {
      icon: Calendar,
      text: "Plan my monthly budget",
      category: "Planning"
    },
    {
      icon: BarChart3,
      text: "Show me spending trends",
      category: "Analytics"
    }
  ];

  const aiResponses = {
    "spending": "Based on your recent transactions, I notice you're spending 35% more on dining out compared to last month. Consider meal planning to reduce food expenses by $200-300 monthly. Your largest expense categories are Housing (42%), Food (23%), and Transportation (15%). Would you like specific strategies to optimize any of these areas?",
    
    "budget": "Your current budget allocation looks good overall! You're maintaining a healthy 44% savings rate, which is excellent. However, I recommend increasing your entertainment budget slightly from $300 to $400, as you've exceeded it for 3 consecutive months. This adjustment would be more realistic and sustainable.",
    
    "goal": "For emergency fund goals, I recommend starting with 3 months of expenses ($12,600 based on your current spending). You're currently saving $3,300 monthly, so you could reach this goal in about 4 months. After that, consider increasing to 6 months ($25,200). Would you like me to create an automated savings plan?",
    
    "health": "Your financial health score is 82/100 - Excellent! Here's the breakdown: Emergency Fund (15/20), Debt Management (18/20), Savings Rate (20/20), Budget Adherence (16/20), Investment Diversification (13/20). To improve, focus on building your emergency fund and diversifying investments.",
    
    "planning": "Based on your income of $7,500 and expenses of $4,200, here's an optimized monthly budget: Fixed Expenses (56%), Savings (30%), Variable Expenses (14%). This leaves you with $1,050 for discretionary spending while maintaining strong savings. Should I break this down by category?",
    
    "trends": "Your spending trends show interesting patterns: Weekends account for 40% of your dining expenses, and you spend 25% more in the first week of each month. Consider implementing a weekly spending limit and meal planning for weekends to optimize your budget."
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Simulate AI response delay
    setTimeout(() => {
      const responseKey = Object.keys(aiResponses).find(key => 
        messageText.toLowerCase().includes(key)
      );
      
      const aiResponse = responseKey 
        ? aiResponses[responseKey]
        : "I understand you're asking about your finances. While I don't have access to your specific data right now, I can help you with general financial advice, budgeting strategies, goal setting, and spending analysis. Could you be more specific about what you'd like to know?";

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: aiResponse,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsLoading(false);
    }, 1000);
  };

  const handleQuickQuestion = (question) => {
    handleSendMessage(question);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-full flex flex-col bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div className="ml-3">
            <h2 className="text-lg font-semibold text-gray-900">AI Financial Assistant</h2>
            <p className="text-sm text-green-600">● Online</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-sm text-gray-500">
            <Lightbulb className="w-4 h-4 mr-1" />
            Smart Insights Enabled
          </div>
        </div>
      </div>

      {/* Quick Questions */}
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Questions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickQuestions.map((question, index) => {
            const Icon = question.icon;
            return (
              <button
                key={index}
                onClick={() => handleQuickQuestion(question.text)}
                className="flex items-center p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all text-left"
              >
                <Icon className="w-4 h-4 text-blue-600 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-500">{question.category}</p>
                  <p className="text-sm text-gray-700 font-medium">{question.text}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: '600px' }}>
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              {/* Avatar */}
              <div className={`flex-shrink-0 ${message.type === 'user' ? 'ml-3' : 'mr-3'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' 
                    ? 'bg-blue-100' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-600'
                }`}>
                  {message.type === 'user' ? (
                    <User className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>

              {/* Message Content */}
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-2 ${
                  message.type === 'user' ? 'text-blue-200' : 'text-gray-500'
                }`}>
                  {formatTime(message.timestamp)}
                </p>
              </div>
            </div>
          </div>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex">
              <div className="flex-shrink-0 mr-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
              </div>
              <div className="bg-gray-100 rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask me about your finances..."
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={isLoading}
            />
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isLoading}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Capabilities */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <div className="flex items-start">
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
            <div>
              <p className="text-xs text-blue-800 font-medium">AI Assistant Capabilities:</p>
              <p className="text-xs text-blue-700 mt-1">
                Financial analysis, budget optimization, goal planning, spending insights, trend analysis, and personalized recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;