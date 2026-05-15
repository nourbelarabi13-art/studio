
'use server';
/**
 * @fileOverview An AI agent for providing creative dark fantasy story prompts.
 *
 * - suggestStorySpark - A function that generates creative story prompts.
 * - AiStorySparkInput - The input type for the suggestStorySpark function.
 * - AiStorySparkOutput - The return type for the suggestStorySpark function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiStorySparkInputSchema = z.object({
  title: z.string().optional().describe('The current title of the novel (if any).'),
  currentContent: z.string().optional().describe('The current text of the novel to provide context for the spark.'),
});
export type AiStorySparkInput = z.infer<typeof AiStorySparkInputSchema>;

const AiStorySparkOutputSchema = z.object({
  spark: z.string().describe('A creative dark fantasy story prompt or plot twist.'),
  explanation: z.string().describe('A brief explanation of why this spark fits the current story context.'),
});
export type AiStorySparkOutput = z.infer<typeof AiStorySparkOutputSchema>;

export async function suggestStorySpark(input: AiStorySparkInput): Promise<AiStorySparkOutput> {
  return aiStorySparkFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiStorySparkPrompt',
  input: { schema: AiStorySparkInputSchema },
  output: { schema: AiStorySparkOutputSchema },
  prompt: `You are a dark fantasy literary consultant. Your role is to provide inspiring "sparks" — creative prompts or sudden plot twists — to help writers overcome blocks.

Analyze the title and content provided. Generate a spark that feels gothic, ethereal, or dark fantasy in nature.

Title: {{{title}}}
Content Context:
{{{currentContent}}}

Provide a unique spark that pushes the narrative into unexpected shadows.`,
});

const aiStorySparkFlow = ai.defineFlow(
  {
    name: 'aiStorySparkFlow',
    inputSchema: AiStorySparkInputSchema,
    outputSchema: AiStorySparkOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
