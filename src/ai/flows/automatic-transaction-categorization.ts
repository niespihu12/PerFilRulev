'use server';
/**
 * @fileOverview An AI agent that automatically categorizes transactions into Needs, Wants, and Savings.
 *
 * - automaticTransactionCategorization - A function that handles the transaction categorization process.
 * - AutomaticTransactionCategorizationInput - The input type for the automaticTransactionCategorization function.
 * - AutomaticTransactionCategorizationOutput - The return type for the automaticTransactionCategorization function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AutomaticTransactionCategorizationInputSchema = z.object({
  transactionDescription: z
    .string()
    .describe('The description of the transaction, including details about the purchase or income source.'),
  transactionAmount: z.number().describe('The amount of the transaction.'),
});
export type AutomaticTransactionCategorizationInput = z.infer<
  typeof AutomaticTransactionCategorizationInputSchema
>;

const AutomaticTransactionCategorizationOutputSchema = z.object({
  category: z
    .enum(['Needs', 'Wants', 'Savings'])
    .describe('The category the transaction falls into, according to the 50/30/20 rule.'),
  explanation: z
    .string()
    .describe('A brief explanation of why the transaction was categorized as such.'),
});
export type AutomaticTransactionCategorizationOutput = z.infer<
  typeof AutomaticTransactionCategorizationOutputSchema
>;

export async function automaticTransactionCategorization(
  input: AutomaticTransactionCategorizationInput
): Promise<AutomaticTransactionCategorizationOutput> {
  return automaticTransactionCategorizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'automaticTransactionCategorizationPrompt',
  input: {schema: AutomaticTransactionCategorizationInputSchema},
  output: {schema: AutomaticTransactionCategorizationOutputSchema},
  prompt: `You are an AI financial assistant that helps users categorize their transactions according to the 50/30/20 rule (Needs, Wants, Savings).

  Given the following transaction description and amount, determine which category it belongs to and provide a brief explanation.

  Transaction Description: {{{transactionDescription}}}
  Transaction Amount: {{{transactionAmount}}}

  Ensure that your response is accurate and follows the 50/30/20 rule guidelines.
`,
});

const automaticTransactionCategorizationFlow = ai.defineFlow(
  {
    name: 'automaticTransactionCategorizationFlow',
    inputSchema: AutomaticTransactionCategorizationInputSchema,
    outputSchema: AutomaticTransactionCategorizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
