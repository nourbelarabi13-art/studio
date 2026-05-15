'use server';
/**
 * @fileOverview An AI agent for suggesting appropriate genre tags for a novel.
 *
 * - suggestGenres - A function that handles the genre suggestion process.
 * - AiGenreSuggestionInput - The input type for the suggestGenres function.
 * - AiGenreSuggestionOutput - The return type for the suggestGenres function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AiGenreSuggestionInputSchema = z.object({
  title: z.string().describe('The title of the novel.'),
  storyContent: z.string().describe('The full content of the novel to be analyzed.'),
});
export type AiGenreSuggestionInput = z.infer<typeof AiGenreSuggestionInputSchema>;

const AiGenreSuggestionOutputSchema = z.object({
  suggestedGenres: z.array(z.string()).describe('An array of suggested genre tags for the novel.'),
});
export type AiGenreSuggestionOutput = z.infer<typeof AiGenreSuggestionOutputSchema>;

export async function suggestGenres(input: AiGenreSuggestionInput): Promise<AiGenreSuggestionOutput> {
  return aiGenreSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'aiGenreSuggestionPrompt',
  input: { schema: AiGenreSuggestionInputSchema },
  output: { schema: AiGenreSuggestionOutputSchema },
  prompt: `You are an expert literary analyst. Your task is to analyze the provided novel content and suggest up to three appropriate genre tags from the following list:

Available Genres: Fantasy, Horror, Romance, Mystery, Drama, Sci-Fi

Analyze the novel's title and story content to determine the most fitting genres. Respond with a JSON object containing an array of the suggested genres. Ensure the genres are from the provided list and avoid including any other text or explanation.

Novel Title: {{{title}}}
Novel Content:
{{{storyContent}}}`,
});

const aiGenreSuggestionFlow = ai.defineFlow(
  {
    name: 'aiGenreSuggestionFlow',
    inputSchema: AiGenreSuggestionInputSchema,
    outputSchema: AiGenreSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
