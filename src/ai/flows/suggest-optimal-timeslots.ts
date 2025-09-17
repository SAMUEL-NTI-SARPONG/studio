// This file is machine-generated - edit at your own risk.

'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting optimal timeslots for events.
 *
 * The flow uses past scheduling data and user preferences to suggest the best time to schedule new events.
 *
 * @exports suggestOptimalTimeslots - An async function that triggers the suggestOptimalTimeslotsFlow.
 * @exports SuggestOptimalTimeslotsInput - The input type for suggestOptimalTimeslots.
 * @exports SuggestOptimalTimeslotsOutput - The output type for suggestOptimalTimeslots.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalTimeslotsInputSchema = z.object({
  pastSchedulingData: z.string().describe('Past scheduling data of the user.'),
  userPreferences: z.string().describe('User preferences for scheduling events.'),
  eventDuration: z.string().describe('The duration of the event to be scheduled.'),
});
export type SuggestOptimalTimeslotsInput = z.infer<
  typeof SuggestOptimalTimeslotsInputSchema
>;

const SuggestOptimalTimeslotsOutputSchema = z.object({
  suggestedTimeslots: z
    .string()
    .describe('Suggested optimal timeslots for the event.'),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested timeslots.'),
});
export type SuggestOptimalTimeslotsOutput = z.infer<
  typeof SuggestOptimalTimeslotsOutputSchema
>;

export async function suggestOptimalTimeslots(
  input: SuggestOptimalTimeslotsInput
): Promise<SuggestOptimalTimeslotsOutput> {
  return suggestOptimalTimeslotsFlow(input);
}

const suggestOptimalTimeslotsPrompt = ai.definePrompt({
  name: 'suggestOptimalTimeslotsPrompt',
  input: {schema: SuggestOptimalTimeslotsInputSchema},
  output: {schema: SuggestOptimalTimeslotsOutputSchema},
  prompt: `You are an AI assistant that suggests optimal timeslots for events.

  Consider the user's past scheduling data, preferences, and the event duration to suggest the best timeslots.

  Past Scheduling Data: {{{pastSchedulingData}}}
  User Preferences: {{{userPreferences}}}
  Event Duration: {{{eventDuration}}}

  Suggest optimal timeslots and explain your reasoning.`,
});

const suggestOptimalTimeslotsFlow = ai.defineFlow(
  {
    name: 'suggestOptimalTimeslotsFlow',
    inputSchema: SuggestOptimalTimeslotsInputSchema,
    outputSchema: SuggestOptimalTimeslotsOutputSchema,
  },
  async input => {
    const {output} = await suggestOptimalTimeslotsPrompt(input);
    return output!;
  }
);
