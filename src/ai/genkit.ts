
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openai } from 'genkitx-openai';

/**
 * Global Genkit instance for the Rosaline Bela sanctuary.
 * Configured with Google AI and OpenAI (ChatGPT) plugins.
 */

const plugins: any[] = [
  googleAI(),
];

// Robust OpenAI initialization handling multiple potential export patterns
try {
  // Try treating it as a function first (common pattern in some versions)
  if (typeof openai === 'function') {
    plugins.push(openai());
  } 
  // If it's the pre-initialized plugin object (standard for some versions of genkitx-openai)
  else if (openai && typeof openai === 'object') {
    plugins.push(openai);
  }
} catch (e) {
  console.error("The Oracle's OpenAI link could not be manifested:", e);
}

export const ai = genkit({
  // Filter out any potential undefined/null plugins to prevent 'version' read errors
  plugins: plugins.filter(Boolean),
  model: 'googleai/gemini-1.5-flash', 
});
