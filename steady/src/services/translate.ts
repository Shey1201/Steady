/**
 * 使用 MyMemory 免费翻译 API 作为备选方案
 * 限制：每天 1000 字左右，无需 API Key
 */
export async function fallbackTranslate(text: string, from = "en", to = "zh"): Promise<string> {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Fallback translation failed");
    
    const data = await response.json();
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    throw new Error("No translation result");
  } catch (error) {
    console.error("Fallback translation error:", error);
    throw error;
  }
}
