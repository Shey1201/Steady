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
    language: "en" as "en" | "zh",
    analysisPanel: {
      visible: false,
      text: "",
      context: "",
      type: "word" as "word" | "phrase" | "sentence",
      loading: false,
      data: null as any,
      openedFromQuickLookup: false,
    },
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
    setLanguage(l: "en" | "zh") { this.language = l; },
    
    openAnalysisPanel(text: string, context: string = "", type: "word" | "phrase" | "sentence" = "word", fromQuickLookup: boolean = false) {
      this.analysisPanel.text = text;
      this.analysisPanel.context = context;
      this.analysisPanel.type = type;
      this.analysisPanel.visible = true;
      this.analysisPanel.loading = true;
      this.analysisPanel.data = null;
      this.analysisPanel.openedFromQuickLookup = fromQuickLookup;
      this.showQuickLookup = false; // Close QuickLookup when opening analysis
    },
    closeAnalysisPanel() {
      this.analysisPanel.visible = false;
      this.analysisPanel.text = "";
      this.analysisPanel.context = "";
    },
    setAnalysisData(data: any) {
      this.analysisPanel.data = data;
      this.analysisPanel.loading = false;
    },
  },
  persist: true,
});
