
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/google-genai';
import { openai } from 'genkitx-openai';

/**
 * Global Genkit instance for the Rosaline Bela sanctuary.
 * Configured with Google AI and OpenAI (ChatGPT) plugins.
 * The OpenAI plugin is initialized correctly based on its exported structure.
 */
export const ai = genkit({
  plugins: [
    googleAI(),
    // In some versions of genkitx-openai, the export is the plugin itself.
    // If it is not a function, we pass it directly.
    typeof openai === 'function' ? (openai as Function)() : openai,
  ],
  model: 'openai/gpt-4o',
});
