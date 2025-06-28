// server/services/geminiService.js

// You can paste your API key directly here for development/testing,
// but it's generally recommended to keep it in a .env file for security in production.
const API_KEY = "AIzaSyDBa0-0Vsg227b5oxXUnMKxbjcUQjFrQLA"; // <--- PASTE YOUR API KEY HERE

/**
 * Generates text using the Gemini API.
 * @param {string} prompt - The text prompt for the AI.
 * @returns {Promise<string>} - The AI's generated text response.
 */
async function generateText(prompt) {
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });
    const payload = { contents: chatHistory };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            return result.candidates[0].content.parts[0].text;
        } else {
            console.warn('Unexpected Gemini API response structure for text generation:', result);
            return "Could not generate a response from the AI.";
        }
    } catch (error) {
        console.error('Error calling Gemini API for text generation:', error);
        throw new Error('Failed to get AI response: ' + error.message);
    }
}

/**
 * Generates structured JSON data using the Gemini API.
 * @param {string} prompt - The text prompt for the AI.
 * @param {object} generationConfig - Configuration for structured response schema.
 * @returns {Promise<object | Array>} - The AI's generated structured data.
 */
async function generateStructuredData(prompt, generationConfig) {
    let chatHistory = [];
    chatHistory.push({ role: "user", parts: [{ text: prompt }] });

    const payload = {
        contents: chatHistory,
        generationConfig: generationConfig
    };

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Gemini API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const result = await response.json();
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonString = result.candidates[0].content.parts[0].text;
            try {
                return JSON.parse(jsonString);
            } catch (parseError) {
                console.error('Failed to parse JSON response from Gemini:', parseError);
                throw new Error('AI returned malformed JSON.');
            }
        } else {
            console.warn('Unexpected Gemini API response structure for structured data generation:', result);
            return {};
        }
    } catch (error) {
        console.error('Error calling Gemini API for structured data generation:', error);
        throw new Error('Failed to get structured AI response: ' + error.message);
    }
}


module.exports = {
    generateText,
    generateStructuredData
};
