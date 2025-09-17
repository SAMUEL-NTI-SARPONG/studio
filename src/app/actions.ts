'use server';

import {
  suggestOptimalTimeslots as suggestOptimalTimeslotsFlow,
  type SuggestOptimalTimeslotsInput,
} from '@/ai/flows/suggest-optimal-timeslots';

export async function suggestOptimalTimeslots(
  input: SuggestOptimalTimeslotsInput
) {
  try {
    const result = await suggestOptimalTimeslotsFlow(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('AI suggestion failed:', error);
    return { success: false, error: 'Failed to get suggestions from AI.' };
  }
}
