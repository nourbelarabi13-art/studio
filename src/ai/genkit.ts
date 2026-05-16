
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openai } from 'genkitx-openai';

/**
 * Global Genkit instance for the Rosaline Bela sanctuary.
 * Configured with Google AI and OpenAI (ChatGPT) plugins.
 */

// Defensive initialization to prevent crashes if a plugin fails to load or exports an unexpected structure
const plugins: any[] = [
  googleAI(),
];

// Robust OpenAI initialization
try {
  // Ensure we are calling the plugin correctly based on its export manifestation
  // Handle both standard function export and possible object-wrapped export
  if (typeof openai === 'function') {
    plugins.push(openai());
  } else if (openai && typeof (openai as any).openai === 'function') {
    plugins.push((openai as any).openai());
  }
} catch (e) {
  console.error("The Oracle's OpenAI link could not be manifested:", e);
}

export const ai = genkit({
  // Filter out any potential undefined/null plugins to prevent 'version' read errors
  plugins: plugins.filter(Boolean),
  model: 'openai/gpt-4o',
});
