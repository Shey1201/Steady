import { getClient } from "./gemini";

export async function generateParaphrasing(wordA: string, sentencePatternB: string, base: string) {
  const client = getClient();
  if (!client) return `Use "${wordA}" and pattern "${sentencePatternB}" to improve:\n${base}`;
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const res = await model.generateContent(`Paraphrase the following base sentence using term "${wordA}" and pattern "${sentencePatternB}". Provide one improved sentence.`);
  return res.response.text();
}

export async function generateCloze(sentence: string) {
  const connectors = /\b(and|or|but|because|although|though|while|if|that|which|who|whose|whom|in|on|at|by|with|for|to|from|of)\b/gi;
  return sentence.replace(connectors, "____");
}

export async function generateOutputPrompt(phrases: string[]) {
  const client = getClient();
  const theme = "Compose a short paragraph connecting the given phrases naturally.";
  if (!client) return `${theme}\nPhrases: ${phrases.join(", ")}`;
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const res = await model.generateContent(`${theme}\nPhrases: ${phrases.join(", ")}`);
  return res.response.text();
}

