import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

export const config = {
  runtime: 'edge',
};

const dashscope = createOpenAI({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.DASHSCOPE_API_KEY,
});

export default async function handler(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: dashscope('qwen-max'),
    messages,
  });

  return result.toTextStreamResponse();
}
