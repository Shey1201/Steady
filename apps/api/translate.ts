import { generateText } from 'ai';
import { z } from 'zod';
import { aiProvider, selectModel } from './lib/models';
import { handleApiError } from './lib/wrapper';

const TranslateSchema = z.object({
  prompt: z.string().min(1, "Translation prompt cannot be empty"),
  sourceLang: z.string().optional(),
  targetLang: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = TranslateSchema.parse(body);

    // Translation usually works well with the fast model
    const modelName = selectModel('translation');

    const result = await generateText({
      model: aiProvider.chat(modelName),
      messages: [
        { role: 'system', content: 'You are a professional translator. Provide accurate and natural translations.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3, // Lower temperature for translation accuracy
    });

    return new Response(JSON.stringify({ text: result.text }), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return handleApiError(error);
  }
}
