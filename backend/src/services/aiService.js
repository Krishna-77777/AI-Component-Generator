const OpenAI = require('openai'); // Corrected import line
require('dotenv').config();

// Initialize the OpenAI client with credentials from the .env file
const openai = new OpenAI({
  baseURL: process.env.OPENAI_API_BASE_URL,
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates or refines React component code using an AI model.
 * @param {string} prompt - The user's instruction (e.g., "make the button red").
 * @param {string} existingJsx - The existing JSX code for context.
 * @param {string} existingCss - The existing CSS code for context.
 * @returns {Promise<{jsx: string, css: string}>} A promise that resolves to an object with the new JSX and CSS.
 */
async function generateComponentCode(prompt, existingJsx = '', existingCss = '') {
  // Construct a detailed system prompt for the AI.
  // This sets the context and rules for the AI's response.
  const systemPrompt = `You are an expert React developer. Your task is to create or modify a single React component based on the user's request.
- You will receive a prompt, and optionally, the existing JSX and CSS code for the component.
- If existing code is provided, you must modify it. If not, create it from scratch.
- The component should be self-contained.
- **IMPORTANT**: You MUST respond with ONLY a single, valid JSON object. Do not include any other text, explanations, or markdown formatting.
- The JSON object must have two keys: "jsx" and "css". The values should be strings containing the React JSX code and the corresponding CSS.

Example Response:
{
  "jsx": "const MyComponent = () => (\\n  <div className=\\"container\\">\\n    <h1>Hello World</h1>\\n  </div>\\n);",
  "css": ".container {\\n  padding: 20px;\\n  background-color: #f0f0f0;\\n}"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: 'openai/gpt-4o-mini', // Or another model like 'llama3', 'gemma', etc.
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: `Prompt: "${prompt}"\n\nExisting JSX:\n\`\`\`jsx\n${existingJsx}\n\`\`\`\n\nExisting CSS:\n\`\`\`css\n${existingCss}\n\`\`\``,
        },
      ],
      // Ensure the response is in JSON format
      response_format: { type: 'json_object' },
    });

    const content = response.choices[0].message.content;

    // Parse the JSON response from the AI
    const parsedContent = JSON.parse(content);

    if (!parsedContent.jsx || typeof parsedContent.css !== 'string') {
      throw new Error('AI response did not contain the expected JSON format.');
    }

    return parsedContent;
    
  } catch (error) {
    console.error('Error calling AI service:', error);
    // Provide a fallback in case of an error
    return {
        jsx: `// AI failed to respond. Error: ${error.message}`,
        css: '/* Please try again. */'
    };
  }
}

module.exports = { generateComponentCode };