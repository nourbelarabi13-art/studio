
'use server';
/**
 * @fileOverview An AI agent for checking novel content for safety and appropriateness.
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
  // Removed Google-specific safety settings for model-agnostic operation
  prompt: `You are an AI content moderator for "Rosaline Bela", a sanctuary dedicated to safe and creative fantasy writing (ages 13+).

Analyze the following chronicle. Identify any toxic content, bullying, or unsafe material.

Novel Title: {{{novelTitle}}}
Novel Content:
{{{novelContent}}}

If the content is safe, set 'isSafe' to true. Otherwise, set it to false and provide reasons and suggestions for modification.`,
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
