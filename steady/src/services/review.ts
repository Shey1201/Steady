import { generateText, hasApiKey } from "./ai";

export async function generateParaphrasing(wordA: string, sentencePatternB: string, base: string) {
  if (!hasApiKey()) return `Use "${wordA}" and pattern "${sentencePatternB}" to improve:\n${base}`;
  
  const prompt = `Paraphrase the following base sentence using term "${wordA}" and pattern "${sentencePatternB}". Provide one improved sentence.
Base Sentence: ${base}`;
  return generateText(prompt);
}

export async function generateCloze(sentence: string) {
  const connectors = /\b(and|or|but|because|although|though|while|if|that|which|who|whose|whom|in|on|at|by|with|for|to|from|of)\b/gi;
  return sentence.replace(connectors, "____");
}

export async function generateOutputPrompt(phrases: string[]) {
  const theme = "Compose a short paragraph connecting the given phrases naturally.";
  if (!hasApiKey()) return `${theme}\nPhrases: ${phrases.join(", ")}`;
  
  return generateText(`${theme}\nPhrases: ${phrases.join(", ")}`);
}

