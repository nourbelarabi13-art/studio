
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openai } from 'genkitx-openai';

/**
 * Global Genkit instance for the Rosaline Bela sanctuary.
 * Configured with Google AI and OpenAI (ChatGPT) plugins.
 * Uses a defensive initialization pattern to prevent "undefined" or "not a function" errors.
 */

// Initialize plugins with safety checks to avoid runtime crashes during module load
const initializedPlugins = [
  googleAI(),
  // Defensive check for community plugins which may vary in export structure
  typeof openai === 'function' ? (openai as any)() : openai
].filter(Boolean);

export const ai = genkit({
  plugins: initializedPlugins,
  model: 'openai/gpt-4o',
});
