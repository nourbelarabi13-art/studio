
'use server';
/**
 * @fileOverview The core AI Assistant Oracle for Rosaline Bela.
 * 
 * - Handles story writing assistance, reading recommendations, and global sanctuary search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AppLanguage } from '@/lib/types';

const AiAssistantInputSchema = z.object({
  uid: z.string(),
  username: z.string().optional(),
  language: z.string().describe('The user\'s current language code (en, ar, fr)'),
  message: z.string(),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional(),
});
export type AiAssistantInput = z.infer<typeof AiAssistantInputSchema>;

const AiAssistantOutputSchema = z.object({
  response: z.string(),
  suggestedActions: z.array(z.string()).optional(),
});
export type AiAssistantOutput = z.infer<typeof AiAssistantOutputSchema>;

export async function askOracle(input: AiAssistantInput): Promise<AiAssistantOutput> {
  return aiAssistantFlow(input);
}

const aiAssistantFlow = ai.defineFlow(
  {
    name: 'aiAssistantFlow',
    inputSchema: AiAssistantInputSchema,
    outputSchema: AiAssistantOutputSchema,
  },
  async (input) => {
    const { response } = await ai.generate({
      system: `You are the "Celestial Oracle" of Rosaline Bela, a dreamy and soft fantasy literature sanctuary.
      
      Your personality is:
      - Elegant, soft, and atmospheric.
      - Encouraging and helpful to both writers and readers.
      - Culturaly sensitive and knowledgeable about literary traditions in English, Arabic, and French.
      
      Your tasks:
      1. Help writers forge stories: suggest plot twists, expand on fragments, fix style/tone.
      2. Help readers find chronicles: recommend stories based on their tastes (using user context).
      3. Explain difficult literary fragments.
      4. Support Arabic, English, and French seamlessly.
      
      Current User: ${input.username || 'Traveler'}
      Current Language: ${input.language}
      
      Guidelines:
      - Never overwrite user text without being asked to "improve" it.
      - If searching for stories, suggest genre tags.
      - Keep the tone soft and "comfortable" (eye-friendly aesthetic).`,
      prompt: input.message,
      history: input.history?.map(h => ({
        role: h.role,
        content: [{ text: h.content }]
      })),
    });

    const responseText = response.text;

    // Dynamically suggest actions based on context
    const suggestedActions = [];
    if (responseText.toLowerCase().includes('write') || responseText.toLowerCase().includes('forge')) {
      suggestedActions.push('Continue this fragment', 'Generate a plot twist');
    } else {
      suggestedActions.push('Recommend a story', 'Summarize a genre');
    }

    return {
      response: responseText,
      suggestedActions,
    };
  }
);
