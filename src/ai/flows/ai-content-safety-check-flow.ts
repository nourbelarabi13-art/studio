'use server';
/**
 * @fileOverview An AI agent for checking novel content for safety and appropriateness.
 *
 * - checkContentSafety - A function that handles the content safety check process.
 * - AiContentSafetyCheckInput - The input type for the checkContentSafety function.
 * - AiContentSafetyCheckOutput - The return type for the checkContentSafety function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiContentSafetyCheckInputSchema = z.object({
  novelTitle: z.string().optional().describe('The title of the novel.'),
  novelContent: z.string().describe('The full text content of the novel to be checked for safety.'),
});
export type AiContentSafetyCheckInput = z.infer<typeof AiContentSafetyCheckInputSchema>;

const AiContentSafetyCheckOutputSchema = z.object({
  isSafe: z.boolean().describe('True if the content adheres to platform safety guidelines, false otherwise.'),
  reasons: z.array(z.string()).describe('A list of reasons if the content is not safe, explaining the violations. Empty if isSafe is true.'),
  suggestions: z.array(z.string()).describe('A list of suggestions on how to modify the content to meet safety guidelines. Empty if isSafe is true.'),
});
export type AiContentSafetyCheckOutput = z.infer<typeof AiContentSafetyCheckOutputSchema>;

export async function checkContentSafety(input: AiContentSafetyCheckInput): Promise<AiContentSafetyCheckOutput> {
  return aiContentSafetyCheckFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiContentSafetyCheckPrompt',
  input: { schema: AiContentSafetyCheckInputSchema },
  output: { schema: AiContentSafetyCheckOutputSchema },
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
    ],
  },
  prompt: `You are an AI content moderator for a platform called "Rosa Novara" which is dedicated to creating a safe and creative space for writers and readers aged 13 and above.

Your primary goal is to ensure that all novel content adheres to the platform's strict safety guidelines:
- No toxic content
- No bullying
- Foster a safe community environment

Analyze the provided novel content thoroughly. If the content contains any material that violates these rules, you must identify it. If it is safe, set 'isSafe' to true.

If the content is NOT safe, set 'isSafe' to false. Then, provide a detailed list of 'reasons' for each identified violation and offer specific 'suggestions' on how the writer can modify the content to comply with the platform's guidelines.

Novel Title: {{{novelTitle}}}
Novel Content:
{{{novelContent}}}`,
});

const aiContentSafetyCheckFlow = ai.defineFlow(
  {
    name: 'aiContentSafetyCheckFlow',
    inputSchema: AiContentSafetyCheckInputSchema,
    outputSchema: AiContentSafetyCheckOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
