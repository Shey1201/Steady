import { GoogleGenerativeAI } from "@google/generative-ai";
export function getClient() {
  const k = localStorage.getItem("STEADY_GEMINI_API_KEY") || import.meta.env.VITE_GEMINI_API_KEY;
  if (!k) return null;
  return new GoogleGenerativeAI(k);
}

export function hasApiKey() {
  // Always return true to allow backend API fallback
  return true;
}

export async function translateText(text: string, type: string = "word", targetLang = "zh") {
  const prompt = `Translate the following ${type} to ${targetLang}. 
If it's a word, provide its primary meaning and 1-2 common examples.
If it's a phrase, explain its usage briefly.
If it's a sentence, provide a natural translation.
Text: ${text}`;

  // 1. Try Backend API (Preferred for Dashscope/OpenAI)
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.text;
    }
  } catch (e) {
    console.warn("Backend API failed, trying client-side fallback...", e);
  }

  // 2. Fallback to Client-side Gemini (Legacy support)
  const client = getClient();
  if (client) {
    try {
      const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await model.generateContent(prompt);
      const response = result.response;
      return response.text();
    } catch (e) {
      console.error("Client-side Gemini also failed", e);
    }
  }

  return "(Translation failed. Please configure API Key)";
}
