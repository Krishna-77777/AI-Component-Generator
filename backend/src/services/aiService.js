const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config();

// Initialize the Google AI Client with your API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateComponentCode(prompt, existingJsx = '', existingCss = '') {
  try {
    // Using the more stable "gemini-1.5-pro-latest" model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro-latest" });

    const fullPrompt = `
      You are an expert React developer. Your task is to create or modify a single React component based on the user's request.
      - The component must be self-contained and named 'Component'.
      - **IMPORTANT**: You MUST respond with ONLY a single, valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
      - The JSON object must have two keys: "jsx" and "css". The values should be strings containing the React JSX code and the corresponding CSS.

      ---
      User Prompt: "${prompt}"

      Existing JSX:
      \`\`\`jsx
      ${existingJsx}
      \`\`\`

      Existing CSS:
      \`\`\`css
      ${existingCss}
      \`\`\`
    `;
    
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    let jsonText = response.text();

    // 1. FIX: Clean the response to remove Markdown formatting
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.substring(7, jsonText.length - 3).trim();
    }

    const parsedContent = JSON.parse(jsonText);

    if (!parsedContent.jsx || typeof parsedContent.css !== 'string') {
      throw new Error('AI response did not contain the expected JSON format.');
    }

    return parsedContent;

  } catch (error) {
    console.error('Error calling Google AI service:', error);
    return {
      jsx: `// AI failed to respond. Error: ${error.message}`,
      css: '/* Please try again. */'
    };
  }
}

module.exports = { generateComponentCode };