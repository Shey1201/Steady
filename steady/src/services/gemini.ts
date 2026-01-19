import { GoogleGenerativeAI } from "@google/generative-ai";
export function getClient() {
  const k = localStorage.getItem("STEADY_GEMINI_API_KEY") || import.meta.env.VITE_GEMINI_API_KEY;
  if (!k) return null;
  return new GoogleGenerativeAI(k);
}

export function hasApiKey() {
  return !!(localStorage.getItem("STEADY_GEMINI_API_KEY") || import.meta.env.VITE_GEMINI_API_KEY);
}

export async function translateText(text: string, type: string = "word", targetLang = "zh") {
  const client = getClient();
  if (!client) return "(需要配置 Gemini API Key)";
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt = `Translate the following ${type} to ${targetLang}. 
If it's a word, provide its primary meaning and 1-2 common examples.
If it's a phrase, explain its usage briefly.
If it's a sentence, provide a natural translation.
Text: ${text}`;
  const result = await model.generateContent(prompt);
  const response = result.response;
  const output = response.text();
  return output;
}
