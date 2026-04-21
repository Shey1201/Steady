import { defineStore } from "pinia";
import { generateAnalysis } from "../services/ai";
import { useUiStore } from "./ui";

export type CorpusType = "word" | "phrase" | "sentence";

export type LearningStatus = "new" | "learning" | "mastered";

export interface CorpusItem {
  id: string;
  type: CorpusType;
  text: string;
  translation?: string;
  note?: string;
  sourceUrl?: string;
  context?: string;
  isFavorite?: boolean;
  status?: LearningStatus;
  createdAt: number;
  lastReviewedAt?: number;
  reviewCount: number;
  nextReviewAt?: number;
  stability: number;
  ef?: number;
  interval?: number;
  
  // New structured analysis fields
  simpleAnalysis?: {
    definition: string;
    phonetic?: string;
    pos?: string;
  };
  fullAiReport?: {
    essential?: {
      meaning: string;
      definition: string;
      gist: string; // New: 15-word summary
    };
    contextAnalysis?: {
      interpretation: string;
      breakdown: string;
      logicGraph?: string; // New: Sentence logic graph
    };
    syntax?: {
      collocations: string[];
      usage: string;
    };
    corpus?: {
      synonyms: string[];
      comparison: string;
      mnemonic: string;
      tag: string;
      challenge: {
        question: string;
        options: string[];
        answer: string;
      };
    };
    knowledge?: {
      background: string;
      expansion?: string;
    };
    // Legacy fields for backward compatibility
    coreEssence?: any;
    structure?: any;
    examples?: any;
    contextComparison?: string;
  };
  analysis?: {
    collocations: string[];
    nuance: string;
    grammar: string;
    logicTemplate: string;
  };
}

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const useCorpusStore = defineStore("corpus", {
  state: () => ({
    items: [] as CorpusItem[],
  }),
  persist: true,
  getters: {
    wordsCount: (s) => s.items.filter((i) => i.type === "word").length,
    phrasesCount: (s) => s.items.filter((i) => i.type === "phrase").length,
    sentencesCount: (s) => s.items.filter((i) => i.type === "sentence").length,
    favoritesCount: (s) => s.items.filter((i) => i.isFavorite).length,
    statusSummary: (s) => {
      const summary: Record<CorpusType, Record<LearningStatus, number>> = {
        word: { new: 0, learning: 0, mastered: 0 },
        phrase: { new: 0, learning: 0, mastered: 0 },
        sentence: { new: 0, learning: 0, mastered: 0 },
      };
      s.items.forEach((item) => {
        const status: LearningStatus = item.status || "new";
        summary[item.type][status] += 1;
      });
      return summary;
    },
  },
  actions: {
    addItem(payload: Omit<CorpusItem, "id" | "createdAt" | "reviewCount" | "stability" | "ef" | "interval"> & { backgroundAnalysis?: boolean }) {
      const id = uid();
      const { backgroundAnalysis, ...itemData } = payload;
      
      this.items.unshift({
        id,
        createdAt: Date.now(),
        reviewCount: 0,
        stability: 0,
        isFavorite: false,
        status: "new",
        ef: 2.5,
        interval: 0,
        ...itemData,
      });

      if (backgroundAnalysis) {
        this.triggerBackgroundAnalysis(id, itemData.text, itemData.context || "", itemData.type);
      }

      return id;
    },
    async triggerBackgroundAnalysis(id: string, text: string, context: string, _type: CorpusType) {
      const ui = useUiStore();
      try {
        const result = await generateAnalysis(text, context, ui.language);
        this.updateItem(id, { 
          fullAiReport: result.fullAiReport,
          simpleAnalysis: result.simpleAnalysis
        });
      } catch (e) {
        console.error("Background analysis failed:", e);
      }
    },
    toggleFavorite(id: string) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.isFavorite = !item.isFavorite;
    },
    setStatus(id: string, status: LearningStatus) {
      const item = this.items.find((i) => i.id === id);
      if (!item) return;
      item.status = status;
    },
    setStatusForMany(ids: string[], status: LearningStatus) {
      const set = new Set(ids);
      this.items.forEach((item) => {
        if (set.has(item.id)) {
          item.status = status;
        }
      });
    },
    updateReview(id: string, performance: "easy" | "good" | "hard" | "again") {
      const item = this.items.find(i => i.id === id);
      if (!item) return;

      const now = Date.now();
      item.lastReviewedAt = now;

      if (item.ef == null) item.ef = 2.5;
      if (item.interval == null) item.interval = 0;
      if (item.reviewCount == null) item.reviewCount = 0;
      if (item.stability == null) item.stability = 0;

      let quality: number;
      if (performance === "easy") quality = 5;
      else if (performance === "good") quality = 4;
      else if (performance === "hard") quality = 3;
      else quality = 1;

      if (quality >= 3) {
        if (item.reviewCount === 0) {
          item.interval = 1;
        } else if (item.reviewCount === 1) {
          item.interval = 6;
        } else {
          item.interval = Math.round(item.interval * item.ef);
        }

        item.ef = item.ef + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        if (item.ef < 1.3) item.ef = 1.3;

        item.reviewCount += 1;
        item.stability = Math.min(100, item.stability + quality * 5);
      } else {
        item.reviewCount = 0;
        item.interval = 1;
        item.stability = Math.max(0, item.stability - 10);
      }

      item.nextReviewAt = now + item.interval * 24 * 60 * 60 * 1000;

      const stability = item.stability || 0;
      if (stability >= 60 || item.reviewCount >= 4) {
        item.status = "mastered";
      } else if (item.reviewCount > 0) {
        item.status = "learning";
      } else {
        item.status = item.status || "new";
      }
    },
    updateAnalysis(id: string, analysis: NonNullable<CorpusItem["analysis"]>) {
      const item = this.items.find(i => i.id === id);
      if (item) {
        item.analysis = analysis;
      }
    },
    updateItem(id: string, payload: Partial<Omit<CorpusItem, "id" | "createdAt">>) {
      const index = this.items.findIndex((i) => i.id === id);
      if (index === -1) return;
      
      this.items[index] = {
        ...this.items[index],
        ...payload,
      };
    },
    removeItem(id: string) {
      this.items = this.items.filter((i) => i.id !== id);
    },
    addSample() {
      if (this.items.length > 0) return;
      
      const samples: Omit<CorpusItem, "id" | "createdAt" | "reviewCount" | "stability" | "ef" | "interval" | "status">[] = [
        {
          type: "word",
          text: "resilient",
          translation: "有弹性的；能复原的",
          note: "Able to withstand or recover quickly from difficult conditions.",
          simpleAnalysis: {
            definition: "Able to withstand or recover quickly from difficult conditions.",
            pos: "adj.",
            phonetic: "/rɪˈzɪliənt/"
          },
          fullAiReport: {
            coreEssence: {
              deepDefinition: "Focuses on the ability to bounce back rather than just being strong.",
              synonyms: "tough, flexible, hardy"
            },
            structure: {
              collocations: ["highly resilient", "resilient economy", "resilient spirit"],
              sentenceBreakdown: "Subject + be + resilient + (in the face of + obstacle)"
            },
            knowledge: {
              background: "Often used in psychology and economics.",
              expansion: "Resilience theory"
            },
            examples: ["The economy proved to be resilient."]
          }
        },
        {
          type: "word",
          text: "ubiquitous",
          translation: "无处不在的",
          note: "Present, appearing, or found everywhere.",
          simpleAnalysis: {
            definition: "Present, appearing, or found everywhere.",
            pos: "adj.",
            phonetic: "/juːˈbɪkwɪtəs/"
          },
          fullAiReport: {
            coreEssence: {
              deepDefinition: "Often implies a sense of being inescapable or common.",
              synonyms: "omnipresent, everywhere, pervasive"
            },
            structure: {
              collocations: ["ubiquitous influence", "become ubiquitous", "ubiquitous technology"],
              sentenceBreakdown: "X is ubiquitous in Y."
            },
            knowledge: {
              background: "From Latin ubique 'everywhere'.",
              expansion: "Ubiquitous computing"
            },
            examples: ["Mobile phones are now ubiquitous."]
          }
        },
        {
          type: "phrase",
          text: "at the eleventh hour",
          translation: "在最后关头",
          note: "At the latest possible moment.",
          context: "The deal was signed at the eleventh hour.",
          simpleAnalysis: {
            definition: "At the latest possible moment.",
            pos: "phrase"
          },
          fullAiReport: {
            coreEssence: {
              deepDefinition: "Suggests a sense of urgency and near-miss failure.",
              synonyms: "last minute, just in time"
            },
            structure: {
              collocations: ["decision at the eleventh hour", "rescued at the eleventh hour"],
              sentenceBreakdown: "Action + happen + at the eleventh hour."
            },
            knowledge: {
              background: "Biblical origin (Parable of the Workers in the Vineyard).",
              expansion: "Procrastination"
            },
            examples: ["He postponed the trip at the eleventh hour."]
          }
        },
        {
          type: "phrase",
          text: "barking up the wrong tree",
          translation: "搞错方向；找错人",
          note: "To be wrong about the reason for something or the way to achieve something.",
          context: "If you think I'm the one who stole your bike, you're barking up the wrong tree.",
          simpleAnalysis: {
            definition: "To be wrong about the reason for something.",
            pos: "idiom"
          },
          fullAiReport: {
            coreEssence: {
              deepDefinition: "Informal, often used to point out a mistake in reasoning.",
              synonyms: "misguided, mistaken"
            },
            structure: {
              collocations: ["completely barking up the wrong tree"],
              sentenceBreakdown: "Someone is barking up the wrong tree (by doing X)."
            },
            knowledge: {
              background: "Hunting dogs barking at a tree where the prey is no longer present.",
              expansion: "Idioms about mistakes"
            },
            examples: ["Police are barking up the wrong tree."]
          }
        },
        {
          type: "sentence",
          text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          translation: "成功不是终点，失败也不是终结：唯有继续前行的勇气才是最重要的。",
          note: "Attributed to Winston Churchill.",
          isFavorite: true,
          simpleAnalysis: {
            definition: "Attributed to Winston Churchill.",
            pos: "quote"
          },
          fullAiReport: {
            coreEssence: {
              deepDefinition: "Emphasizes persistence over results.",
              synonyms: "Perseverance"
            },
            structure: {
              collocations: [],
              sentenceBreakdown: "A is not X, B is not Y: it is C that counts."
            },
            knowledge: {
              background: "Winston Churchill quote.",
              expansion: "Stoicism"
            },
            examples: []
          }
        },
        {
          type: "sentence",
          text: "In the middle of difficulty lies opportunity.",
          translation: "在困难的中心，往往蕴藏着机遇。",
          note: "Attributed to Albert Einstein.",
          isFavorite: true,
          simpleAnalysis: {
            definition: "Attributed to Albert Einstein.",
            pos: "quote"
          },
          fullAiReport: {
            coreEssence: {
              deepDefinition: "Optimistic view of challenges.",
              synonyms: "Optimism"
            },
            structure: {
              collocations: [],
              sentenceBreakdown: "In the middle of [Challenge] lies [Benefit]."
            },
            knowledge: {
              background: "Albert Einstein quote.",
              expansion: "Growth Mindset"
            },
            examples: []
          }
        }
      ];

      samples.forEach((s, index) => {
        const id = this.addItem(s);
        if (index === 0) {
          this.setStatus(id, "new");
        } else if (index === 1) {
          this.setStatus(id, "learning");
        } else if (index === 2) {
          this.setStatus(id, "mastered");
        }
      });
    },
    clear() {
      this.items = [];
    },
  },
});
