'use server';
/**
 * @fileOverview An AI agent for generating dreamy cover illustrations for novels.
 *
 * - generateCover - A function that generates a custom cover image based on story details.
 * - GenerateCoverInput - The input type for the generateCover function.
 * - GenerateCoverOutput - The return type for the generateCover function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateCoverInputSchema = z.object({
  title: z.string().describe('The title of the novel.'),
  prompt: z.string().describe('A brief description of the desired visual atmosphere.'),
});
export type GenerateCoverInput = z.infer<typeof GenerateCoverInputSchema>;

const GenerateCoverOutputSchema = z.object({
  imageUrl: z.string().describe('The generated image as a data URI.'),
});
export type GenerateCoverOutput = z.infer<typeof GenerateCoverOutputSchema>;

export async function generateCover(input: GenerateCoverInput): Promise<GenerateCoverOutput> {
  return generateCoverFlow(input);
}

const generateCoverFlow = ai.defineFlow(
  {
    name: 'generateCoverFlow',
    inputSchema: GenerateCoverInputSchema,
    outputSchema: GenerateCoverOutputSchema,
  },
  async (input) => {
    const { media } = await ai.generate({
      model: 'googleai/imagen-4.0-fast-generate-001',
      prompt: `An elegant, soft, and dreamy fantasy illustration for a book cover titled "${input.title}". 
      Atmosphere: ${input.prompt}. 
      Style: Comfortable, eye-friendly, aesthetic, soft lighting, pastel palette, fine line art. 
      Avoid: Darkness, violence, low quality, photorealism.`,
    });

    if (!media || !media.url) {
      throw new Error('The manifestation of your illustration was lost in the clouds.');
    }

    return { imageUrl: media.url };
  }
);
