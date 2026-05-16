
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
  if (typeof openai === 'function') {
    plugins.push(openai());
  } else if ((openai as any)?.openai && typeof (openai as any).openai === 'function') {
    plugins.push((openai as any).openai());
  } else if (openai && typeof openai === 'object') {
    // Handle cases where the plugin might be exported as a pre-initialized object or namespace
    plugins.push(openai);
  }
} catch (e) {
  console.error("The Oracle's OpenAI link could not be manifested:", e);
}

export const ai = genkit({
  // Filter out any potential undefined/null plugins to prevent 'version' read errors
  plugins: plugins.filter(Boolean),
  model: 'googleai/gemini-1.5-flash', // Fallback to reliable Gemini if OpenAI link is weak
});
