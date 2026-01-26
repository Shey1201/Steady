import { createOpenAI } from '@ai-sdk/openai';

// Define task types for routing
export type TaskType = 'translation' | 'summary' | 'analysis' | 'chat' | 'coding';

// Model definitions
export const MODELS = {
  FAST: 'deepseek-chat', // Fast, cheap, good for translation/chat
  POWERFUL: 'deepseek-chat', // Currently using same model, but prepared for 'deepseek-reasoner' or GPT-4
  CODING: 'deepseek-coder', // Optimized for code
};

// Configuration for Vercel AI SDK
// In a real scenario, you might have different API keys or Base URLs for different providers
export const aiProvider = createOpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com/v1',
});

if (!process.env.DEEPSEEK_API_KEY) {
  console.warn("WARNING: DEEPSEEK_API_KEY is not set. AI features will fail.");
}

/**
 * Selects the best model based on the task type.
 * This logic allows for cost/performance optimization without changing client code.
 */
export function selectModel(task: TaskType): string {
  switch (task) {
    case 'translation':
    case 'chat':
    case 'summary':
      return MODELS.FAST;
    case 'analysis':
      return MODELS.POWERFUL; // Deep analysis might need a stronger model in the future
    case 'coding':
      return MODELS.CODING;
    default:
      return MODELS.FAST;
  }
}
