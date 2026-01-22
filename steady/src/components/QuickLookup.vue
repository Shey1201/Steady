<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { lookupDictionary } from "../services/dictionary";
import { fallbackTranslate } from "../services/translate";
import { prefetchQuickMeaning } from "../services/ai";
import { useCorpusStore, type CorpusType } from "../stores/corpus";
import { useUiStore } from "../stores/ui";
import { 
  XMarkIcon, 
  DocumentDuplicateIcon,
  SparklesIcon,
  BookmarkIcon
} from "@heroicons/vue/24/outline";

const store = useCorpusStore();
const ui = useUiStore();
const visible = ref(false);
const x = ref(0);
const y = ref(0);
const selectedText = ref("");
const translation = ref("");
const translateError = ref(false);
const mode = ref<CorpusType>("word");
const note = ref("");
let debounceTimer: any = null;
const root = ref<HTMLElement | null>(null);

const props = defineProps<{
  context?: string;
  sourceUrl?: string;
  pinned?: boolean;
  text?: string;
}>();

// Localization
const existingItem = computed(() => {
  if (!selectedText.value) return null;
  return store.items.find(i => i.text.toLowerCase() === selectedText.value.toLowerCase());
});

const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    title: isZh ? '快速词典' : 'Quick Dictionary',
    placeholder: isZh ? '输入或选择文本...' : 'Type or select text...',
    translating: isZh ? '翻译中...' : 'Translating...',
    waiting: isZh ? '等待输入...' : 'Waiting for input...',
    errorKey: isZh ? '请在设置中配置 API Key' : 'Please configure API Key in settings',
    errorNetwork: isZh ? '(翻译失败，请检查网络或 API Key)' : '(Translation failed, please check network or API Key)',
    notePlaceholder: isZh ? '添加个人笔记...' : 'Add a personal note...',
    save: isZh ? '保存' : 'Save',
    update: isZh ? '更新语境' : 'Update Context',
    analyze: isZh ? 'AI 分析' : 'AI Analyse',
    analyzing: isZh ? 'AI 正在分析...' : 'AI Analyzing...',
    existing: isZh ? '已在库中' : 'In Corpus',
    lastReview: isZh ? '上次复习: ' : 'Last reviewed: ',
  };
});

async function doTranslate() {
  if (!selectedText.value) return;
  
  const text = selectedText.value.trim();

  // Prefetch AI analysis (Silent background)
  prefetchQuickMeaning(text, props.context || "", ui.language);

  // ... existing logic ...
  const wordCount = text.split(/\s+/).length;

  // 1. 尝试词典 (单词或短词组) - 第一优先级
  if (wordCount <= 3) {
    try {
      const dictResult = await lookupDictionary(text);
      translation.value = dictResult;
      translateError.value = false;
      return;
    } catch (e) {
      // 词典未找到，继续尝试免费翻译
    }
  }

  // 2. 降级方案：免费翻译接口 (MyMemory) - 第二优先级
  if (translation.value === "" || translation.value === "..." || translation.value === t.value.waiting) {
    translation.value = t.value.translating;
  }
  try {
    // Determine target language based on UI setting
    const targetLang = ui.language;
    // Simple heuristic: if input contains Chinese, translate to English, else to targetLang
    // But user requirement says: "If language is Chinese, translation display must be Chinese"
    // So we force targetLang to ui.language
    // Use 'Autodetect' for source language to handle non-English inputs correctly
    const freeResult = await fallbackTranslate(text, "Autodetect", targetLang);
    translation.value = freeResult;
    translateError.value = false;
  } catch (e) {
    // 免费接口失败
    translation.value = t.value.errorNetwork;
    translateError.value = true;
  }
}

async function handleSave() {
  if (!selectedText.value) return;
  const type = mode.value;
  if (!translation.value) {
    await doTranslate();
  }
  
  if (existingItem.value) {
    // Update existing
    const oldContext = existingItem.value.context;
    let newNote = existingItem.value.note || "";
    // If context changed, append old context to note
    if (props.context && oldContext && oldContext !== props.context) {
      newNote += `\n\n[Context History]: ${oldContext}`;
    }
    // Append current note input if any
    if (note.value) {
      newNote += `\n${note.value}`;
    }

    store.updateItem(existingItem.value.id, {
      context: props.context,
      note: newNote,
      lastReviewedAt: Date.now(),
      reviewCount: existingItem.value.reviewCount + 1
    });
    
    // Check if fullAiReport is missing, if so, trigger background analysis
    if (!existingItem.value.fullAiReport) {
      store.triggerBackgroundAnalysis(
        existingItem.value.id, 
        existingItem.value.text, 
        props.context || "", 
        existingItem.value.type
      );
    }

    // Reset note input
    note.value = "";
  } else {
    store.addItem({
      type,
      text: selectedText.value,
      translation: translation.value,
      context: props.context,
      note: note.value,
      sourceUrl: props.sourceUrl,
      backgroundAnalysis: true
    });
    note.value = "";
  }
  hide();
}

function handleAnalyse() {
  if (!selectedText.value) return;
  // Pass true for fromQuickLookup to enable restoration
  ui.openAnalysisPanel(selectedText.value, props.context || "", mode.value, true);
  hide();
}

function copySelected() {
  if (!selectedText.value) return;
  navigator.clipboard.writeText(selectedText.value);
}

function hide() {
  visible.value = false;
  selectedText.value = "";
  translation.value = "";
  note.value = "";
  if (props.pinned) {
    ui.closeQuickLookup();
  }
}

function showAt(rect: DOMRect, text: string) {
  selectedText.value = text;
  x.value = rect.left + rect.width / 2;
  y.value = rect.top - 8;
  visible.value = true;
  translation.value = "";
  translateError.value = false;
}

function onDocumentMouseDown(event: MouseEvent) {
  if (props.pinned) return;
  if (!visible.value && !props.pinned) return;
  const target = event.target as Node | null;
  if (!root.value || !target) return;
  if (!root.value.contains(target)) {
    hide();
  }
}

function onGlobalClick() {
  if (props.pinned) return;
  const sel = window.getSelection();
  const text = sel?.toString().trim() || "";
  if (!text) {
    hide();
    return;
  }
  const range = sel!.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  showAt(rect, text);
}

onMounted(() => {
  document.addEventListener("mouseup", onGlobalClick);
  document.addEventListener("mousedown", onDocumentMouseDown);
});
onBeforeUnmount(() => {
  document.removeEventListener("mouseup", onGlobalClick);
  document.removeEventListener("mousedown", onDocumentMouseDown);
});

watch(() => ui.quickText, (newText) => {
  if (newText) {
    selectedText.value = newText;
    mode.value = detectType(newText);
    doTranslate();
  }
});

watch(() => ui.language, () => {
  if (selectedText.value) {
    doTranslate();
  }
});

watch(selectedText, (newVal) => {
  if (debounceTimer) clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => {
    if (newVal.trim()) {
      mode.value = detectType(newVal);
      doTranslate();
    }
  }, 100);
});

watch(visible, (v) => {
  if (v && selectedText.value && !translation.value) doTranslate();
});

watch(() => props.text, (t) => {
  if (!t) return;
  selectedText.value = t;
  translation.value = "";
  translateError.value = false;
  doTranslate();
});

function detectType(t: string): CorpusType {
  const text = t.trim();
  const cleanText = text.replace(/[.!?;]+$/, "");
  const wordCount = cleanText.split(/\s+/).length;
  
  if (wordCount > 6 || /[.!?;]/.test(cleanText)) return "sentence";
  if (wordCount > 1) return "phrase";
  return "word";
}
</script>

<template>
  <Transition name="quick-fade">
    <div
      v-if="visible || props.pinned"
      ref="root"
      class="fixed z-50 transition-all duration-300"
      :style="props.pinned ? { right: '1.5rem', top: '6rem', width: '380px' } : { left: `${x - 190}px`, top: `${y - 40}px`, width: '380px' }"
    >
      <div class="bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-200/60 overflow-hidden">
        <!-- Header -->
        <div class="px-4 py-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-2 h-2 rounded-full bg-slate-900 animate-pulse"></div>
            <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.title }}</span>
          </div>
          <button @click="hide" class="p-1 rounded-full hover:bg-slate-200/50 text-slate-400 transition-colors">
            <XMarkIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Content -->
        <div class="p-4 space-y-4">
          <!-- Input Area -->
          <div class="relative group">
            <textarea 
              v-model="selectedText"
              rows="2"
              class="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-lg font-bold text-slate-900 placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900/5 transition-all resize-none"
              :placeholder="t.placeholder"
            ></textarea>
            <button 
              @click="copySelected"
              class="absolute right-2 bottom-2 p-2 rounded-lg bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
            >
              <DocumentDuplicateIcon class="w-4 h-4" />
            </button>
          </div>

          <!-- Instant Translation -->
          <div class="px-2">
            <div v-if="translateError" class="text-xs text-red-500 flex items-center gap-1">
              <span>{{ t.errorKey }}</span>
            </div>
            <div v-else class="text-slate-700 text-sm leading-relaxed whitespace-pre-line font-medium">
              {{ translation || t.waiting }}
            </div>
          </div>

          <!-- Note Input -->
          <div class="relative">
            <input 
              v-model="note"
              class="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
              :placeholder="t.notePlaceholder"
            />
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 pt-2">
            <button 
              @click="handleSave"
              class="flex-1 h-11 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-[0.98]"
            >
              <BookmarkIcon class="w-4 h-4" />
              {{ t.save }}
            </button>
            <button 
              @click="handleAnalyse"
              class="flex-[1.5] h-11 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
            >
              <SparklesIcon class="w-4 h-4" />
              {{ t.analyze }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.quick-fade-enter-active,
.quick-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.quick-fade-enter-from,
.quick-fade-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(10px);
}
</style>
