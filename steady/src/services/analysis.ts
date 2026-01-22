import { generateText, hasApiKey } from "./ai";
import type { CorpusItem } from "../stores/corpus";

export async function deepAnalyze(item: Pick<CorpusItem, "type" | "text">) {
  if (!hasApiKey()) {
    return {
      collocations: ["(需要配置 API Key)"],
      nuance: "(需要配置 API Key)",
      grammar: "(需要配置 API Key)",
      logicTemplate: "(需要配置 API Key)",
    };
  }
  
  const prompt =
    item.type === "sentence"
      ? `Deep Analysis:
- Grammar architecture: decompose subject, verb, object, clauses, insertions.
- Logic template: abstract skeleton (e.g., It is [adj.] that [clause]).
Sentence: ${item.text}
Return strictly valid JSON with keys grammar, logicTemplate. Do not use Markdown code blocks.`
      : `Deep Analysis:
- Collocations: top 3 native collocations for the term.
- Nuance: compare with close synonyms and explain subtle differences.
Term: ${item.text}
Return strictly valid JSON with keys collocations, nuance. Do not use Markdown code blocks.`;

  try {
    let text = await generateText(prompt, 1000, true);
    // Clean up potential markdown code blocks
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    
    const json = JSON.parse(text);
    return {
      collocations: json.collocations,
      nuance: json.nuance,
      grammar: json.grammar,
      logicTemplate: json.logicTemplate,
    };
  } catch (e) {
    console.error("Deep Analysis Failed", e);
    return {
      collocations: ["(AI 分析失败)"],
      nuance: "(AI 分析失败)",
      grammar: "(AI 分析失败)",
      logicTemplate: "(AI 分析失败)",
    };
  }
}

