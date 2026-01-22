
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  try {
    const { prompt, maxTokens, jsonMode } = await req.json();

    const apiKey = process.env.AI_API_KEY;
    const baseURL = process.env.AI_BASE_URL;
    const model = process.env.AI_MODEL || 'gpt-3.5-turbo';

    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing AI_API_KEY' }), { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Ensure endpoint ends with /chat/completions
    let endpoint = baseURL || "https://api.openai.com/v1";
    if (!endpoint.endsWith("/chat/completions")) {
        endpoint = `${endpoint.replace(/\/+$/, "")}/chat/completions`;
    }

    const body: any = {
      model: model,
      messages: [
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: maxTokens || 1000,
    };

    if (jsonMode) {
      body.response_format = { type: "json_object" };
    }

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      const errText = await response.text();
      return new Response(JSON.stringify({ error: `AI Provider Error: ${response.status}`, details: errText }), { 
        status: response.status,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ text }), {
      headers: { 'Content-Type': 'application/json' },
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
