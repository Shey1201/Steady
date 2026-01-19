import { defineStore } from "pinia";

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
  analysis?: {
    collocations?: string[];
    nuance?: string;
    grammar?: string;
    logicTemplate?: string;
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
    addItem(payload: Omit<CorpusItem, "id" | "createdAt" | "reviewCount" | "stability" | "ef" | "interval">) {
      const id = uid();
      this.items.unshift({
        id,
        createdAt: Date.now(),
        reviewCount: 0,
        stability: 0,
        isFavorite: false,
        status: "new",
        ef: 2.5,
        interval: 0,
        ...payload,
      });
      return id;
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
          analysis: {
            collocations: ["highly resilient", "resilient economy", "resilient spirit"],
            nuance: "Focuses on the ability to bounce back rather than just being strong.",
            grammar: "Adjective, often used with 'to' or 'against'.",
            logicTemplate: "Subject + be + resilient + (in the face of + obstacle)"
          }
        },
        {
          type: "word",
          text: "ubiquitous",
          translation: "无处不在的",
          note: "Present, appearing, or found everywhere.",
          analysis: {
            collocations: ["ubiquitous influence", "become ubiquitous", "ubiquitous technology"],
            nuance: "Often implies a sense of being inescapable or common.",
            grammar: "Adjective.",
            logicTemplate: "X is ubiquitous in Y."
          }
        },
        {
          type: "phrase",
          text: "at the eleventh hour",
          translation: "在最后关头",
          note: "At the latest possible moment.",
          context: "The deal was signed at the eleventh hour.",
          analysis: {
            collocations: ["decision at the eleventh hour", "rescued at the eleventh hour"],
            nuance: "Suggests a sense of urgency and near-miss failure.",
            grammar: "Prepositional phrase used as an adverbial.",
            logicTemplate: "Action + happen + at the eleventh hour."
          }
        },
        {
          type: "phrase",
          text: "barking up the wrong tree",
          translation: "搞错方向；找错人",
          note: "To be wrong about the reason for something or the way to achieve something.",
          context: "If you think I'm the one who stole your bike, you're barking up the wrong tree.",
          analysis: {
            collocations: ["completely barking up the wrong tree"],
            nuance: "Informal, often used to point out a mistake in reasoning.",
            grammar: "Idiomatic expression, usually used in progressive tenses.",
            logicTemplate: "Someone is barking up the wrong tree (by doing X)."
          }
        },
        {
          type: "sentence",
          text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
          translation: "成功不是终点，失败也不是终结：唯有继续前行的勇气才是最重要的。",
          note: "Attributed to Winston Churchill.",
          isFavorite: true,
          analysis: {
            grammar: "Parallel structure with colons for emphasis.",
            logicTemplate: "A is not X, B is not Y: it is C that counts."
          }
        },
        {
          type: "sentence",
          text: "In the middle of difficulty lies opportunity.",
          translation: "在困难的中心，往往蕴藏着机遇。",
          note: "Attributed to Albert Einstein.",
          isFavorite: true,
          analysis: {
            grammar: "Inverted sentence structure for poetic effect.",
            logicTemplate: "In the middle of [Challenge] lies [Benefit]."
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
