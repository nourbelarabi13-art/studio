
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openai } from 'genkitx-openai';

/**
 * Global Genkit instance for the Rosaline Bela sanctuary.
 * Configured with Google AI and OpenAI (ChatGPT) plugins.
 * Default model is set to GPT-4o.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
    openai(),
  ],
  model: 'openai/gpt-4o',
});
