<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { translateText, hasApiKey } from "../services/gemini";
import { lookupDictionary } from "../services/dictionary";
import { fallbackTranslate } from "../services/translate";
import { useCorpusStore, type CorpusType } from "../stores/corpus";
import { deepAnalyze } from "../services/analysis";
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

function setMode(next: CorpusType) {
  mode.value = next;
  doTranslate();
}

async function doTranslate() {
  if (!selectedText.value) return;
  
  const text = selectedText.value.trim();
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
  if (translation.value === "" || translation.value === "...") {
    translation.value = "Translating (Free)...";
  }
  try {
    const freeResult = await fallbackTranslate(text);
    translation.value = freeResult;
    translateError.value = false;
    
    // 如果是单词/短语且免费翻译成功了，我们可能不需要 AI 翻译了
    // 但如果用户想要更好的 AI 翻译，可以在之后配置 Key
    if (wordCount <= 5) return; 
  } catch (e) {
    // 免费接口失败，尝试 AI
  }

  // 3. 尝试 AI 翻译 (如果有 Key) - 第三优先级
  if (hasApiKey()) {
    try {
      translation.value = await translateText(text, mode.value, "zh");
      translateError.value = false;
      return;
    } catch (e) {
      // AI 失败
    }
  }

  if (!translation.value || translation.value.startsWith("Translating")) {
    translation.value = "(Translation failed, please check network or API Key)";
    translateError.value = true;
  }
}

async function handleSave() {
  if (!selectedText.value) return;
  const type = mode.value;
  if (!translation.value) {
    await doTranslate();
  }
  store.addItem({
    type: type,
    text: selectedText.value,
    translation: translation.value,
    note: note.value || undefined,
    context: props.context,
    sourceUrl: props.sourceUrl,
  });
  hide();
}

async function handleAnalyse() {
  if (!selectedText.value) return;
  
  if (!hasApiKey()) {
    alert("AI Analyse requires a Gemini API Key. Please configure it in Settings.");
    return;
  }

  const type = mode.value;
  if (!translation.value) {
    await doTranslate();
  }
  const id = store.addItem({
    type: type,
    text: selectedText.value,
    translation: translation.value,
    note: note.value || undefined,
    context: props.context,
    sourceUrl: props.sourceUrl,
  });
  
  // Background AI analysis
  deepAnalyze({ type, text: selectedText.value })
    .then(analysis => {
      store.updateAnalysis(id, analysis);
    })
    .catch(err => {
      console.error("Deep analysis failed:", err);
    });
  
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
  // 去除末尾标点后再判断
  const cleanText = text.replace(/[.!?;]+$/, "");
  const wordCount = cleanText.split(/\s+/).length;
  
  if (wordCount > 6 || /[.!?;]/.test(cleanText)) return "sentence";
  if (wordCount > 1) return "phrase";
  return "word";
}
</script>

<template>
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
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Quick Dictionary</span>
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
            placeholder="Type or select text..."
          ></textarea>
          <button 
            @click="copySelected"
            class="absolute right-2 bottom-2 p-2 rounded-lg bg-white shadow-sm border border-slate-100 text-slate-400 hover:text-slate-900 transition-all opacity-0 group-hover:opacity-100"
          >
            <DocumentDuplicateIcon class="w-4 h-4" />
          </button>
        </div>

        <!-- Mode Toggles -->
        <div class="flex gap-1 bg-slate-100 p-1 rounded-xl">
          <button 
            v-for="m in (['word', 'phrase', 'sentence'] as const)" 
            :key="m"
            @click="setMode(m)"
            class="flex-1 py-1.5 text-[11px] font-bold uppercase tracking-tight rounded-lg transition-all"
            :class="mode === m ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'"
          >
            {{ m }}
          </button>
        </div>

        <!-- Translation Result -->
        <div class="min-h-[80px] bg-slate-50/50 rounded-xl p-4 border border-slate-100/50">
          <div v-if="translateError" class="text-xs text-red-500 flex items-center gap-1">
            <span>Please configure API Key in settings</span>
          </div>
          <div v-else class="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {{ translation || 'Waiting for input...' }}
          </div>
        </div>

        <!-- Note Input -->
        <div class="relative">
          <input 
            v-model="note"
            class="w-full h-10 bg-white border border-slate-200 rounded-xl px-4 text-sm focus:border-slate-900 focus:ring-4 focus:ring-slate-900/5 transition-all"
            placeholder="Add a personal note..."
          />
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 pt-2">
          <button 
            @click="handleSave"
            class="flex-1 h-11 bg-slate-100 text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 transition-all active:scale-[0.98]"
          >
            <BookmarkIcon class="w-4 h-4" />
            Save
          </button>
          <button 
            @click="handleAnalyse"
            class="flex-[1.5] h-11 bg-slate-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-800 shadow-lg shadow-slate-200 transition-all active:scale-[0.98]"
          >
            <SparklesIcon class="w-4 h-4" />
            AI Analyse
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
