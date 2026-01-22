<script setup lang="ts">
import { computed, watch, ref } from 'vue';
import { useUiStore } from '../stores/ui';
import { useCorpusStore } from '../stores/corpus';
import { generateQuickMeaning, generateDeepAnalysis } from '../services/ai';
import { XMarkIcon, BookmarkIcon, ArrowPathIcon } from '@heroicons/vue/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/vue/24/solid';

const ui = useUiStore();
const corpus = useCorpusStore();

const loading = computed(() => ui.analysisPanel.loading);
const data = computed(() => ui.analysisPanel.data);
const text = computed(() => ui.analysisPanel.text);
const context = computed(() => ui.analysisPanel.context);
const isDeepLoading = ref(false);

const isSaved = computed(() => {
  return corpus.items.some(item => item.text.toLowerCase() === text.value.toLowerCase());
});

const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    analysis: isZh ? 'AI 深度分析' : 'AI Deep Analysis',
    essential: isZh ? '核心破局' : 'The Gist',
    contextAnalysis: isZh ? '深度语境' : 'Context Analysis',
    syntax: isZh ? '语法与结构' : 'Syntax & Structure',
    corpusAssets: isZh ? '记忆资产' : 'Corpus Assets',
    knowledge: isZh ? '百科与关联' : 'Knowledge Link',
    save: isZh ? '收藏到生词本' : 'Save to Corpus',
    saved: isZh ? '已收藏' : 'Saved',
    update: isZh ? '更新语境' : 'Update Context',
    loading: isZh ? '正在生成深度分析报告...' : 'Generating deep analysis report...',
    error: isZh ? '分析生成失败' : 'Analysis generation failed',
    retry: isZh ? '重试' : 'Retry',
    contextEvolution: isZh ? '语境演变' : 'Context Evolution',
    analyzingDeep: isZh ? '正在进行深度分析...' : 'Analyzing deeply...',
  };
});

async function loadAnalysis() {
  if (!text.value) return;
  
  isDeepLoading.value = false;

  // Check if we already have this in corpus
  const existing = corpus.items.find(i => i.text.toLowerCase() === text.value.toLowerCase());
  
  if (existing) {
    ui.setAnalysisData({
         simpleAnalysis: existing.simpleAnalysis,
         fullAiReport: existing.fullAiReport
    });
    return;
  }
  
  try {
    // 1. Quick Meaning (First Chunk)
    const quick = await generateQuickMeaning(text.value, context.value, ui.language);
    ui.setAnalysisData(quick); // Shows "The Gist" immediately
    
    // 2. Deep Analysis (Background)
    isDeepLoading.value = true;
    const deep = await generateDeepAnalysis(text.value, context.value, ui.language, quick);
    
    // Merge and update
    ui.setAnalysisData({
        simpleAnalysis: quick.simpleAnalysis,
        fullAiReport: {
            ...quick.fullAiReport,
            ...deep.fullAiReport
        }
    });
  } catch (e) {
    console.error(e);
    if (!ui.analysisPanel.data) {
       ui.setAnalysisData(null); // Error state only if we have nothing
    }
  } finally {
    isDeepLoading.value = false;
  }
}

watch(() => ui.analysisPanel.visible, (visible) => {
  if (visible && ui.analysisPanel.loading) {
    loadAnalysis();
  }
});

function saveToCorpus() {
  const simpleAnalysis = data.value?.simpleAnalysis || {
    definition: data.value?.fullAiReport?.essential?.definition || "Definition",
  };
  const fullAiReport = data.value?.fullAiReport;

  const existing = corpus.items.find(i => i.text.toLowerCase() === text.value.toLowerCase());
  
  if (existing) {
    // Update existing item
    const oldContext = existing.context;
    let newNote = existing.note || "";
    if (oldContext && oldContext !== context.value) {
      newNote += `\n\n[Context History ${new Date().toLocaleDateString()}]:\n${oldContext}`;
    }
    
    corpus.updateItem(existing.id, {
      context: context.value,
      note: newNote,
      fullAiReport: fullAiReport, 
      simpleAnalysis: simpleAnalysis,
      lastReviewedAt: Date.now(),
      reviewCount: existing.reviewCount + 1
    });
    return;
  }

  corpus.addItem({
    type: ui.analysisPanel.type || "word",
    text: text.value,
    context: context.value,
    translation: simpleAnalysis.definition,
    simpleAnalysis: simpleAnalysis,
    fullAiReport: fullAiReport,
  });
}

function close() {
  const shouldRestore = ui.analysisPanel.openedFromQuickLookup;
  const textToRestore = ui.analysisPanel.text;
  
  ui.closeAnalysisPanel();
  
  if (shouldRestore) {
    setTimeout(() => {
      ui.openQuickWithText(textToRestore);
    }, 300);
  }
}
</script>

<template>
  <div 
    class="fixed inset-y-0 right-0 w-[420px] bg-white shadow-2xl transform transition-transform duration-300 z-40 flex flex-col border-l border-slate-100"
    :class="ui.analysisPanel.visible ? 'translate-x-0' : 'translate-x-full'"
  >
    <!-- Header -->
    <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100 flex-shrink-0 bg-white/80 backdrop-blur">
      <h2 class="text-lg font-bold text-slate-900 flex items-center gap-2">
        <span class="w-2 h-6 bg-blue-600 rounded-full"></span>
        {{ text }}
      </h2>
      <button @click="close" class="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
        <XMarkIcon class="w-6 h-6" />
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar bg-slate-50/50">
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
        <ArrowPathIcon class="w-8 h-8 animate-spin text-blue-500" />
        <p class="text-sm font-medium animate-pulse">{{ t.loading }}</p>
      </div>

      <!-- Error State -->
      <div v-else-if="!data" class="flex flex-col items-center justify-center h-64 text-slate-400 space-y-4">
        <p class="text-sm font-medium">{{ t.error }}</p>
        <button @click="loadAnalysis" class="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-700 transition-colors">
          {{ t.retry }}
        </button>
      </div>

      <!-- Analysis Report -->
      <template v-else-if="data.fullAiReport">
        
        <!-- 1. The Gist (Essential) - Clean & Minimal -->
        <section class="mb-8 pl-5 border-l-4 border-slate-900 animate-fade-in-up">
           <div class="flex items-center justify-between mb-2">
              <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">{{ t.essential }}</h3>
              <span v-if="data.fullAiReport.corpus?.tag" class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{{ data.fullAiReport.corpus.tag }}</span>
           </div>
           
           <div class="text-2xl font-bold text-slate-900 leading-tight mb-2">
             {{ data.fullAiReport.essential?.gist || data.fullAiReport.essential?.meaning }}
           </div>
           
           <div class="text-base text-slate-500 font-serif italic mb-3">
             {{ data.fullAiReport.essential?.definition }}
           </div>

           <div class="flex items-center gap-3">
              <span v-if="data.simpleAnalysis?.pos" class="text-xs font-bold text-slate-400 uppercase">
                {{ data.simpleAnalysis.pos }}
              </span>
              <span v-if="data.simpleAnalysis?.phonetic" class="text-xs font-mono text-slate-400">
                /{{ data.simpleAnalysis.phonetic }}/
              </span>
           </div>
        </section>

        <!-- 2. Context Analysis (Symbolic Flow) -->
        <section v-if="data.fullAiReport.contextAnalysis" class="mb-8 pl-5 border-l-4 border-blue-500 animate-fade-in-up">
           <div class="flex items-center gap-2 mb-3">
             <h3 class="text-xs font-bold text-blue-600 uppercase tracking-wider">{{ t.contextAnalysis }}</h3>
           </div>
           
           <!-- Logic Flow (Symbolic) -->
           <div v-if="data.fullAiReport.contextAnalysis?.logicGraph" class="mb-3 font-mono text-xs text-blue-900 bg-blue-50/50 p-3 rounded-lg leading-relaxed whitespace-pre-wrap">
             {{ data.fullAiReport.contextAnalysis.logicGraph }}
           </div>

           <p class="text-sm text-slate-700 leading-relaxed">
             {{ data.fullAiReport.contextAnalysis?.interpretation }}
           </p>
        </section>

        <!-- 3. Syntax (Clean List) -->
        <section v-if="data.fullAiReport.syntax" class="mb-8 pl-5 border-l-4 border-purple-400 animate-fade-in-up">
           <h3 class="text-xs font-bold text-purple-500 uppercase tracking-wider mb-3">{{ t.syntax }}</h3>
           
           <div v-if="data.fullAiReport.syntax?.collocations?.length" class="flex flex-wrap gap-2 mb-3">
              <span v-for="col in data.fullAiReport.syntax.collocations" :key="col" class="text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded hover:bg-slate-100 transition-colors">
                {{ col }}
              </span>
           </div>
           
           <p v-if="data.fullAiReport.syntax?.usage" class="text-sm text-slate-600">
             {{ data.fullAiReport.syntax.usage }}
           </p>
        </section>

        <!-- 4. Corpus Assets (One Memory Aid) -->
        <section v-if="data.fullAiReport.corpus" class="mb-8 pl-5 border-l-4 border-amber-400 animate-fade-in-up">
           <h3 class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-3">{{ t.corpusAssets }}</h3>
           
           <div v-if="data.fullAiReport.corpus?.mnemonic" class="mb-3">
             <span class="text-xs font-bold text-amber-700 block mb-1">🧠 Memory Hook</span>
             <p class="text-sm text-slate-800 font-medium">{{ data.fullAiReport.corpus.mnemonic }}</p>
           </div>

           <div v-if="data.fullAiReport.corpus?.comparison">
             <span class="text-xs font-bold text-slate-400 block mb-1">Nuance</span>
             <p class="text-xs text-slate-600">{{ data.fullAiReport.corpus.comparison }}</p>
           </div>
        </section>

      </template>
    </div>

    <!-- Footer: Learning Loop -->
    <div class="p-6 border-t border-slate-100 bg-white/80 backdrop-blur flex-shrink-0">
      <button 
        @click="saveToCorpus"
        class="w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl active:scale-95"
        :class="isSaved ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-slate-900 text-white hover:bg-slate-800'"
      >
        <component :is="isSaved ? BookmarkSolidIcon : BookmarkIcon" class="w-5 h-5" />
        {{ isSaved ? t.update : t.save }}
      </button>
    </div>
  </div>
</template>