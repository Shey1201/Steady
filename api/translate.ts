
export const config = {
  runtime: 'edge',
};

export default async function handler(req: Request) {
  const { prompt } = await req.json();
  
  const apiKey = process.env.AI_API_KEY;
  const baseURL = process.env.AI_BASE_URL || 'https://api.deepseek.com';
  const model = process.env.AI_MODEL || 'deepseek-chat';

  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Missing AI_API_KEY' }), { status: 500 });
  }

  // Construct endpoint manually
  let endpoint = baseURL;
  if (!endpoint.endsWith("/chat/completions")) {
      endpoint = `${endpoint.replace(/\/+$/, "")}/chat/completions`;
  }

  try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        },
        body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3
        })
      });

      if (!response.ok) {
          const errText = await response.text();
          throw new Error(`AI Provider Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || "";

      return new Response(JSON.stringify({ text }), {
        headers: { 'Content-Type': 'application/json' },
      });
  } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
}
