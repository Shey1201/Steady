import { createOpenAI } from '@ai-sdk/openai';
import { generateText } from 'ai';

export const config = {
  runtime: 'edge',
};

// 配置 Dashscope (通义千问) 客户端
const dashscope = createOpenAI({
  baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
  apiKey: process.env.DASHSCOPE_API_KEY,
});

export default async function handler(req: Request) {
  const { prompt } = await req.json();

  const { text } = await generateText({
    // 使用用户指定的模型，如果环境变量未配置则默认使用 qwen-max
    model: dashscope('qwen-max'),
    prompt,
  });

  return new Response(JSON.stringify({ text }), {
    headers: { 'Content-Type': 'application/json' },
  });
}
