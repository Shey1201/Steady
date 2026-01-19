import { defineStore } from "pinia";

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export interface Draft {
  id: string;
  content: string;
  createdAt: number;
}

export const useWritingStore = defineStore("writing", {
  state: () => ({
    drafts: [] as Draft[],
  }),
  actions: {
    addDraft(content: string) {
      this.drafts.unshift({
        id: uid(),
        content,
        createdAt: Date.now(),
      });
    },
    removeDraft(id: string) {
      this.drafts = this.drafts.filter(d => d.id !== id);
    },
  },
  persist: true,
});
