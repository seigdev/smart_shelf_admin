'use server';

import { suggestShelfLocation, type SuggestShelfLocationInput, type SuggestShelfLocationOutput } from '@/ai/flows/suggest-shelf-location';

export async function getShelfSuggestion(input: SuggestShelfLocationInput): Promise<SuggestShelfLocationOutput | { error: string }> {
  try {
    const result = await suggestShelfLocation(input);
    return result;
  } catch (error) {
    console.error("Error getting shelf suggestion:", error);
    // It's better to return a generic error message to the client
    // and log the detailed error on the server.
    if (error instanceof Error) {
        return { error: `Failed to get suggestion: ${error.message}` };
    }
    return { error: 'An unknown error occurred while fetching shelf suggestion.' };
  }
}
