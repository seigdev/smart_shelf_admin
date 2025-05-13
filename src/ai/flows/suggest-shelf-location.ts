'use server';
/**
 * @fileOverview Suggests the optimal shelf location for a new product based on current inventory and product characteristics.
 *
 * - suggestShelfLocation - A function that handles the shelf location suggestion process.
 * - SuggestShelfLocationInput - The input type for the suggestShelfLocation function.
 * - SuggestShelfLocationOutput - The return type for the suggestShelfLocation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestShelfLocationInputSchema = z.object({
  productName: z.string().describe('The name of the product to be stored.'),
  productDescription: z.string().describe('A detailed description of the product, including its dimensions, weight, and any special storage requirements.'),
  currentInventory: z.string().describe('A list of the current inventory, including the location of each item and the available space on each shelf.'),
});
export type SuggestShelfLocationInput = z.infer<typeof SuggestShelfLocationInputSchema>;

const SuggestShelfLocationOutputSchema = z.object({
  shelfLocationSuggestion: z.string().describe('The suggested shelf location for the new product, including the shelf number and any specific instructions for placement.'),
  rationale: z.string().describe('The rationale behind the shelf location suggestion, including factors such as available space, product characteristics, and existing inventory.'),
});
export type SuggestShelfLocationOutput = z.infer<typeof SuggestShelfLocationOutputSchema>;

export async function suggestShelfLocation(input: SuggestShelfLocationInput): Promise<SuggestShelfLocationOutput> {
  return suggestShelfLocationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestShelfLocationPrompt',
  input: {schema: SuggestShelfLocationInputSchema},
  output: {schema: SuggestShelfLocationOutputSchema},
  prompt: `You are an expert in warehouse organization and logistics. Your task is to suggest the optimal shelf location for a new product based on the current inventory and product characteristics.

Product Name: {{{productName}}}
Product Description: {{{productDescription}}}
Current Inventory: {{{currentInventory}}}

Based on this information, suggest the best shelf location for the new product and explain your reasoning. Consider factors such as available space, product characteristics, and existing inventory.

Output the shelf location suggestion and the rationale behind it.`, 
});

const suggestShelfLocationFlow = ai.defineFlow(
  {
    name: 'suggestShelfLocationFlow',
    inputSchema: SuggestShelfLocationInputSchema,
    outputSchema: SuggestShelfLocationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
