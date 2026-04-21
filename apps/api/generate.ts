import { generateText, streamText } from 'ai';
import { z } from 'zod';
import { aiProvider, selectModel, checkApiKey } from './lib/models';
import { handleApiError } from './lib/wrapper';

// Allow streaming responses to run longer
export const maxDuration = 30;

const GenerateSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  maxTokens: z.number().int().min(1).max(4096).optional().default(1000),
  temperature: z.number().min(0).max(2).optional().default(0.7),
  stream: z.boolean().optional().default(false),
  task: z.enum(['translation', 'summary', 'analysis', 'chat', 'coding']).optional().default('analysis'),
});

export async function POST(request: Request) {
  try {
    checkApiKey();

    const body = await request.json();
    const { prompt, maxTokens, temperature, stream, task } = GenerateSchema.parse(body);

    const modelName = selectModel(task);

    if (stream) {
      const result = streamText({
        model: aiProvider.chat(modelName),
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature,
        maxOutputTokens: maxTokens,
      });

      return result.toTextStreamResponse();
    } else {
      const result = await generateText({
        model: aiProvider.chat(modelName),
        messages: [{ role: 'user', content: prompt }],
        temperature: temperature,
        maxOutputTokens: maxTokens,
        // mode: jsonMode ? 'json' : 'text', // Vercel AI SDK handles json mode differently in newer versions or via prompt
      });

      return new Response(JSON.stringify({ text: result.text }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    return handleApiError(error);
  }
}
