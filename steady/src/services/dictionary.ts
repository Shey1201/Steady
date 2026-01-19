export interface DictionaryResult {
  word: string;
  phonetic?: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example?: string;
    }[];
  }[];
}

/**
 * 使用免费的 Dictionary API 获取单词定义
 * 适用于英文单词
 */
export async function lookupDictionary(text: string): Promise<string> {
  // 清理文本：转小写，去除首尾标点符号
  const cleanText = text.trim().toLowerCase().replace(/^[^a-z0-9]+|[^a-z0-9]+$/gi, "");
  
  if (!cleanText) throw new Error("Empty text");
  
  const words = cleanText.split(/\s+/);
  if (words.length > 3) {
    throw new Error("Only words or short phrases are supported by the dictionary.");
  }

  try {
    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanText)}`);
    if (!response.ok) throw new Error("Not found in dictionary");
    
    const data: DictionaryResult[] = await response.json();
    if (!data || data.length === 0) throw new Error("No data");

    const firstResult = data[0];
    let output = `[${firstResult.phonetic || "no phonetic"}]\n`;
    
    firstResult.meanings.slice(0, 2).forEach(m => {
      output += `\n(${m.partOfSpeech}) ${m.definitions[0].definition}`;
      if (m.definitions[0].example) {
        output += `\ne.g. ${m.definitions[0].example}`;
      }
    });

    return output;
  } catch (error) {
    console.warn("Dictionary lookup failed:", error);
    throw error;
  }
}
