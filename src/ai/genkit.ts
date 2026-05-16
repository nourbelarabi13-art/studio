import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openai } from 'genkitx-openai';

/**
 * Global Genkit instance for the Rosaline Bela sanctuary.
 * Configured with Google AI and OpenAI (ChatGPT) plugins.
 * Uses a defensive initialization pattern to prevent "undefined" plugin errors.
 */

// Initialize plugins with safety checks to avoid runtime crashes
const initializedPlugins = [
  googleAI(),
  // Check if openai is available and initialize it correctly based on its export type
  openai ? (typeof openai === 'function' ? (openai as any)() : openai) : null
].filter(Boolean); // Ensure no "undefined" or "null" entries reach the Genkit engine

export const ai = genkit({
  plugins: initializedPlugins,
  model: 'openai/gpt-4o',
});
