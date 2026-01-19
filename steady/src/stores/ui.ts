import { defineStore } from "pinia";

export const useUiStore = defineStore("ui", {
  state: () => ({
    showImportModal: false,
    showQuickLookup: false,
    enableClipboardWatch: false,
    quickText: "",
    fontSize: 18,
    lineHeight: 1.6,
    paragraphGap: 32,
    maxWidth: 800,
  }),
  actions: {
    openImport() { this.showImportModal = true; },
    closeImport() { this.showImportModal = false; },
    toggleQuickLookup() { this.showQuickLookup = !this.showQuickLookup; },
    closeQuickLookup() { this.showQuickLookup = false; },
    setQuickText(t: string) { this.quickText = t; },
    openQuickWithText(t: string) { this.quickText = t; this.showQuickLookup = true; },
    setFontSize(s: number) { this.fontSize = s; },
    setLineHeight(l: number) { this.lineHeight = l; },
    setParagraphGap(g: number) { this.paragraphGap = g; },
    setMaxWidth(w: number) { this.maxWidth = w; },
  },
  persist: true,
});
