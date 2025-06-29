    // server/controllers/aiController.js

    const geminiService = require('../services/geminiService');
    const db = require('../services/databaseService'); // May need user's data for context

    // Placeholder for AI Assistant chat functionality
    exports.getAssistantResponse = async (req, res) => {
        const { userId, message } = req.body;

        if (!userId || !message) {
            return res.status(400).json({ message: 'User ID and message are required for AI assistant.' });
        }

        try {
            // In a real application, you would fetch relevant user data (transactions, budgets, goals)
            // to provide context to the AI model.
            // Example: Fetch recent transactions for the user
            const recentTransactions = await db.all('SELECT * FROM transactions WHERE userId = ? ORDER BY date DESC LIMIT 5', [userId]);
            const userBudgets = await db.all('SELECT * FROM budgets WHERE userId = ?', [userId]);

            // Construct a prompt for the AI, including user-specific context
            let aiPrompt = `User ID: ${userId}\n`;
            aiPrompt += `User's message: "${message}"\n\n`;
            if (recentTransactions.length > 0) {
                aiPrompt += 'Recent Transactions:\n' + JSON.stringify(recentTransactions, null, 2) + '\n\n';
            }
            if (userBudgets.length > 0) {
                aiPrompt += 'Current Budgets:\n' + JSON.stringify(userBudgets, null, 2) + '\n\n';
            }
            aiPrompt += 'As a personal finance AI assistant, provide helpful advice, analysis, or answer questions based on the provided context. Keep your response concise and actionable.';

            // Call your Gemini service
            const aiResponse = await geminiService.generateText(aiPrompt);

            res.status(200).json({ response: aiResponse });
        } catch (error) {
            console.error('Error getting AI assistant response:', error.message);
            res.status(500).json({ message: 'Error communicating with AI assistant: ' + error.message });
        }
    };

    // Placeholder for AI budget suggestions
    exports.getBudgetSuggestions = async (req, res) => {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required to get budget suggestions.' });
        }

        try {
            // Fetch user's spending habits (e.g., average spending per category over time)
            const spendingSummary = await db.all(`
                SELECT category, SUM(amount) as totalSpent
                FROM transactions
                WHERE userId = ? AND type = 'expense'
                GROUP BY category
                ORDER BY totalSpent DESC
                LIMIT 5
            `, [userId]);

            // Fetch existing budgets to avoid suggesting duplicates or conflicting budgets
            const existingBudgets = await db.all('SELECT category, limitAmount FROM budgets WHERE userId = ?', [userId]);

            let aiPrompt = `Generate budget suggestions for a user based on their recent spending habits and existing budgets.
            Existing Budgets: ${JSON.stringify(existingBudgets, null, 2)}
            Recent Spending Summary: ${JSON.stringify(spendingSummary, null, 2)}
            
            Suggest 2-3 new budget categories or adjustments to existing ones, along with a reasonable monthly limit.
            Provide the output as a JSON array of objects, each with 'category' and 'suggestedLimit'.`;

            // Configure generationConfig for structured JSON output
            const generationConfig = {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "category": { "type": "STRING" },
                            "suggestedLimit": { "type": "NUMBER" }
                        },
                        "propertyOrdering": ["category", "suggestedLimit"]
                    }
                }
            };

            const aiResponse = await geminiService.generateStructuredData(aiPrompt, generationConfig);

            res.status(200).json({ suggestions: aiResponse });
        } catch (error) {
            console.error('Error getting AI budget suggestions:', error.message);
            res.status(500).json({ message: 'Error communicating with AI for budget suggestions: ' + error.message });
        }
    };
    