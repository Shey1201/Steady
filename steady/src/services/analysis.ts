import { getClient } from "./gemini";
import type { CorpusItem } from "../stores/corpus";

export async function deepAnalyze(item: Pick<CorpusItem, "type" | "text">) {
  const client = getClient();
  if (!client) {
    return {
      collocations: ["(需要配置 API Key)"],
      nuance: "(需要配置 API Key)",
      grammar: "(需要配置 API Key)",
      logicTemplate: "(需要配置 API Key)",
    };
  }
  const model = client.getGenerativeModel({ model: "gemini-1.5-flash" });
  const prompt =
    item.type === "sentence"
      ? `Deep Analysis:
- Grammar architecture: decompose subject, verb, object, clauses, insertions.
- Logic template: abstract skeleton (e.g., It is [adj.] that [clause]).
Sentence: ${item.text}
Return JSON with keys grammar, logicTemplate.`
      : `Deep Analysis:
- Collocations: top 3 native collocations for the term.
- Nuance: compare with close synonyms and explain subtle differences.
Term: ${item.text}
Return JSON with keys collocations, nuance.`;
  const res = await model.generateContent(prompt);
  try {
    const text = res.response.text();
    const json = JSON.parse(text);
    return {
      collocations: json.collocations,
      nuance: json.nuance,
      grammar: json.grammar,
      logicTemplate: json.logicTemplate,
    };
  } catch {
    return {
      collocations: ["(AI 返回格式不可解析)"],
      nuance: "(AI 返回格式不可解析)",
      grammar: "(AI 返回格式不可解析)",
      logicTemplate: "(AI 返回格式不可解析)",
    };
  }
}

