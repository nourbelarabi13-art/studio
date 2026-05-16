
'use server';
/**
 * @fileOverview An AI agent for translating novel content into other supported languages.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { AppLanguage } from '@/lib/types';

const TranslateStoryInputSchema = z.object({
  title: z.string(),
  content: z.string(),
  targetLanguages: z.array(z.string().describe('Language codes like ar, en, fr')),
});
export type TranslateStoryInput = z.infer<typeof TranslateStoryInputSchema>;

const TranslateStoryOutputSchema = z.object({
  translations: z.record(z.object({
    title: z.string(),
    content: z.string(),
  })),
});
export type TranslateStoryOutput = z.infer<typeof TranslateStoryOutputSchema>;

export async function translateStory(input: TranslateStoryInput): Promise<TranslateStoryOutput> {
  return translateStoryFlow(input);
}

const prompt = ai.definePrompt({
  name: 'translateStoryPrompt',
  input: { schema: TranslateStoryInputSchema },
  output: { schema: TranslateStoryOutputSchema },
  prompt: `You are an expert literary translator specialized in dreamy and soft fantasy literature.
  
  Translate the following story title and content into the requested target languages: {{#each targetLanguages}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}.
  
  Maintain the soft, elegant, and atmospheric tone of the original text.
  
  Original Title: {{{title}}}
  Original Content:
  {{{content}}}`,
});

const translateStoryFlow = ai.defineFlow(
  {
    name: 'translateStoryFlow',
    inputSchema: TranslateStoryInputSchema,
    outputSchema: TranslateStoryOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
