
'use server';
/**
 * @fileOverview The core AI Assistant Oracle for Rosaline Bela.
 * 
 * - Handles story writing assistance, reading recommendations, and global sanctuary search.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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
    try {
      const response = await ai.generate({
        system: `You are the "Celestial Oracle" of Rosaline Bela, a dreamy and soft fantasy literature sanctuary.
        
        Personality:
        - Elegant, soft, and atmospheric.
        - Encouraging to both writers and readers.
        - Culturally knowledgeable about English, Arabic, and French literary traditions.
        
        Your Role:
        1. Co-Writer: Help writers forge stories. Suggest plot twists, refine style, and help overcome blocks.
        2. Reading Guide: Recommend stories based on genre tags and user tastes.
        3. Smart Search: Help users find chronicles by suggesting specific themes or genres.
        
        Current User Context:
        - Username: ${input.username || 'Traveler'}
        - Target Language: ${input.language}
        
        Safety Guidelines:
        - Always maintain a safe, kind, and non-toxic environment.
        - Never overwrite user text without being asked to "improve" it.
        - Keep the tone soft and "comfortable" for a dreamy aesthetic.
        
        Please respond in the language requested (${input.language}).`,
        prompt: input.message,
        history: input.history?.map(h => ({
          role: h.role,
          content: [{ text: h.content }]
        })),
      });

      const responseText = response.text || "The Oracle is currently contemplating the mists. Please try your whisper again.";

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
    } catch (e: any) {
      console.error("AI Assistant Flow error:", e);
      throw new Error(`The Oracle's manifestation failed: ${e.message || 'The link was interrupted'}`);
    }
  }
);
