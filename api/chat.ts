import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { messages } = await req.json();

  const aiProvider = createOpenAI({
    baseURL: process.env.AI_BASE_URL || 'https://api.deepseek.com/v1',
    apiKey: process.env.AI_API_KEY,
  });

  const modelName = process.env.AI_MODEL || 'deepseek-chat';

  const result = streamText({
    model: aiProvider(modelName),
    messages,
  });

  return result.toTextStreamResponse();
}
