const OpenAI = require('openai');
require('dotenv').config();

// Initialize the client with your OpenAI API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates or refines React component code using the OpenAI API.
 * @param {string} prompt - The user's instruction.
 * @param {string} existingJsx - The existing JSX code for context.
 * @param {string} existingCss - The existing CSS code for context.
 * @returns {Promise<{jsx: string, css: string}>} A promise that resolves to an object with the new JSX and CSS.
 */
async function generateComponentCode(prompt, existingJsx = '', existingCss = '') {
  const systemPrompt = `
    You are an expert React developer. Your task is to create or modify a single React component based on the user's request.
    - The component should be self-contained and named 'Component'.
    - **IMPORTANT**: You MUST respond with ONLY a single, valid JSON object. Do not include any other text, explanations, or markdown formatting like \`\`\`json.
    - The JSON object must have two keys: "jsx" and "css". The values should be strings containing the React JSX code and the corresponding CSS.
  `;
  
  const userMessage = `
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

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage }
      ],
      // Force the model to return a JSON object
      response_format: { type: "json_object" },
    });
    
    const jsonText = response.choices[0].message.content;
    const parsedContent = JSON.parse(jsonText);

    if (!parsedContent.jsx || typeof parsedContent.css !== 'string') {
      throw new Error('AI response did not contain the expected JSON format.');
    }

    return parsedContent;

  } catch (error) {
    console.error('Error calling OpenAI service:', error);
    return {
      jsx: `// AI failed to respond. Error: ${error.message}`,
      css: '/* Please try again. */'
    };
  }
}

module.exports = { generateComponentCode };