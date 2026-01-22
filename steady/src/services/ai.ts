
export async function generateText(prompt: string, maxTokens: number = 1000, jsonMode: boolean = false): Promise<string> {
  // Uses local proxy or relative path if deployed on same domain
  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';
  const endpoint = `${apiBase}/generate`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        maxTokens,
        jsonMode
      })
    });

    if (!response.ok) {
       let errorMsg = `HTTP ${response.status}`;
       try {
         const err = await response.json();
         errorMsg = err.error || err.details || errorMsg;
       } catch (e) {
         // ignore json parse error
       }
       throw new Error(errorMsg);
    }

    const data = await response.json();
    return data.text;
  } catch (e) {
    console.error("AI Generation Failed (Backend)", e);
    throw e;
  }
}

export function hasApiKey() {
  // Assumes backend is configured. 
  // In a real app, we might check an endpoint like /api/health or /api/config-status
  return true; 
}

// Helper to parse JSON from AI response
function parseAiJson(text: string) {
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (e) {
    console.error("Failed to parse AI JSON response", text);
    throw new Error("Invalid JSON response from AI");
  }
}

// Simple in-memory cache
const analysisCache = new Map<string, any>();

function getCacheKey(text: string, context: string, language: string) {
  return `${text.trim().toLowerCase()}:${context.trim()}:${language}`;
}

export async function generateQuickMeaning(text: string, context: string, language: "en" | "zh") {
  const key = getCacheKey(text, context, language);
  if (analysisCache.has(key)) {
    return analysisCache.get(key);
  }

  const isZh = language === "zh";
  const prompt = `Analyze the term "${text}"${context ? ` in context: "${context}"` : ''}.
  Return a strictly valid JSON object with NO markdown formatting, containing:
  {
    "simpleAnalysis": {
      "definition": "Short definition in ${isZh ? 'Chinese' : 'English'}",
      "phonetic": "IPA phonetic",
      "pos": "Part of speech (e.g. n., v.)"
    },
    "fullAiReport": {
      "essential": {
        "meaning": "Core meaning in ${isZh ? 'Chinese' : 'English'}",
        "definition": "English definition",
        "gist": "A 15-word summary of the meaning${context ? ' in this context' : ''}"
      }
    }
  }`;
  
  const result = await generateText(prompt, 500, true);
  const data = parseAiJson(result);
  analysisCache.set(key, data);
  return data;
}

export async function prefetchQuickMeaning(text: string, context: string, language: "en" | "zh") {
  const key = getCacheKey(text, context, language);
  if (analysisCache.has(key)) return;
  
  // Fire and forget (but we await inside to catch errors)
  generateQuickMeaning(text, context, language).catch(e => {
     console.warn("Prefetch failed", e);
  });
}

export async function generateDeepAnalysis(text: string, context: string, language: "en" | "zh", quickResult: any) {
  const isZh = language === "zh";
  const prompt = `Deep analysis for "${text}"${context ? ` in context: "${context}"` : ''}.
  Previous analysis: ${JSON.stringify(quickResult)}
  Return a strictly valid JSON object with NO markdown formatting.
  CRITICAL INSTRUCTIONS:
  1. NO filler words (e.g. "The word means..."). Use bullet points or short phrases.
  2. Logic Graph must be symbolic arrows (e.g. "A -> B -> C").
  3. NO Etymology or History.
  4. NO Quiz/Challenge.
  5. ONLY ONE best Mnemonic.
  
  {
    "fullAiReport": {
      "contextAnalysis": {
        "interpretation": "Direct interpretation in ${isZh ? 'Chinese' : 'English'} (Max 1 sentence)",
        "breakdown": "Brief sentence structure breakdown (Max 1 sentence)",
        "logicGraph": "Symbolic logic flow (e.g. Context -> Tone -> Implication)"
      },
      "syntax": {
        "collocations": ["collocation 1", "collocation 2"],
        "usage": "One key usage note"
      },
      "corpus": {
        "synonyms": ["synonym 1", "synonym 2"],
        "comparison": "Brief nuance comparison",
        "mnemonic": "One strong memory aid (Association or Root)",
        "tag": "One word tag"
      }
    }
  }`;

  const result = await generateText(prompt, 1500, true);
  return parseAiJson(result);
}

export async function generateAnalysis(text: string, context: string, language: "en" | "zh") {
    const quick = await generateQuickMeaning(text, context, language);
    const deep = await generateDeepAnalysis(text, context, language, quick);
    
    return {
        simpleAnalysis: quick.simpleAnalysis,
        fullAiReport: {
            ...quick.fullAiReport,
            ...deep.fullAiReport
        }
    };
}
