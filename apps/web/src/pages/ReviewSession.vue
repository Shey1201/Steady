<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useCorpusStore, type CorpusItem } from "../stores/corpus";
import { useRoute } from "vue-router";
import { useUiStore } from "../stores/ui";
import { EyeIcon, CheckCircleIcon } from "@heroicons/vue/24/outline";

const store = useCorpusStore();
const route = useRoute();
const ui = useUiStore();

// Localization
const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    memoryReview: isZh ? '记忆复习' : 'Memory Review',
    learning: isZh ? '学习' : 'Learning',
    items: isZh ? '项' : 'Items',
    overview: isZh ? '概览' : 'Overview',
    retention: isZh ? '记忆保留率' : 'Retention',
    mastered: isZh ? '已掌握' : 'Mastered',
    sessionSetup: isZh ? '会话设置' : 'Session Setup',
    configureQueue: isZh ? '配置学习队列' : 'Configure your learning queue',
    resetData: isZh ? '重置数据' : 'Reset Data',
    words: isZh ? '单词' : 'Words',
    phrases: isZh ? '短语' : 'Phrases',
    sentences: isZh ? '句子' : 'Sentences',
    includeNew: isZh ? '包含新内容' : 'Include New',
    includeDue: isZh ? '包含逾期' : 'Include Due',
    import: isZh ? '导入' : 'Import',
    cancel: isZh ? '取消' : 'Cancel',
    anatomy: isZh ? '深度解析' : 'Anatomy',
    pattern: isZh ? '句式' : 'Pattern',
    dailyGoal: isZh ? '每日目标' : 'Daily Goal',
    due: isZh ? '逾期' : 'Due',
    startNow: isZh ? '现在开始' : 'Start Now',
    newWords: isZh ? '生词本' : 'New Words',
    totalAvailable: isZh ? '总计可用' : 'Total Available',
    reviewHistory: isZh ? '复习历史' : 'Review History',
    last30Days: isZh ? '最近30天' : 'Last 30 Days',
    targetWord: isZh ? '目标单词' : 'Target Word',
    keyPhrase: isZh ? '关键短语' : 'Key Phrase',
    sentenceStructure: isZh ? '句式结构' : 'Sentence Structure',
    showTranslation: isZh ? '显示释义' : 'Show Translation',
    tryRecall: isZh ? '尝试回忆含义，然后再显示答案' : 'Try to recall the meaning before revealing',
    sessionComplete: isZh ? '会话完成' : 'Session Complete',
    greatJob: isZh ? '干得好。你可以从语料库添加更多内容，或复习已掌握的内容。' : 'Great job. You can add more items from Corpus or review mastered ones.',
    backToQueue: isZh ? '返回队列' : 'Back to Queue',
    emptyState: isZh ? '从词库导入新内容，开始今日学习。' : 'Nothing here yet, start by importing.',
    importFromCorpus: isZh ? '从 Corpus 导入' : 'Import from Corpus',
    statusNew: isZh ? '新' : 'NEW',
    statusLearning: isZh ? '学习中' : 'LEARNING',
    statusDue: isZh ? '逾期' : 'DUE NOW',
    
    // Review buttons
    forget: isZh ? '忘记' : 'Forget',
    vague: isZh ? '模糊' : 'Vague',
    master: isZh ? '掌握' : 'Master',
    
    btnAgain: isZh ? '重来' : 'again',
    btnHard: isZh ? '困难' : 'hard',
    btnGood: isZh ? '良好' : 'good',
    btnEasy: isZh ? '容易' : 'easy',
  };
});

const sessionType = ref<"recitation" | "forgetting">("recitation");
const currentIdx = ref(0);
const showAnswer = ref(false);
const items = ref<CorpusItem[]>([]);
const isFinished = ref(false);
const showSetup = ref(false);
const includeNew = ref(true);
const includeDue = ref(false);
const selectedTypes = ref({
  word: false,
  phrase: false,
  sentence: false,
});

const inSession = ref(false);
const selectedQueueItem = ref<CorpusItem | null>(null);

const nowRef = ref(Date.now());

onMounted(() => {
  sessionType.value = (route.query.type as any) || "recitation";
  const filterType = route.query.filter as string;
  const targetId = route.query.id as string;
  
  if (sessionType.value === "recitation" && !targetId) {
    return;
  }

  let pool = [...store.items];

  if (targetId) {
    pool = pool.filter(i => i.id === targetId);
  } else if (sessionType.value === "forgetting") {
    const now = Date.now();
    pool = pool.filter(i => !i.nextReviewAt || i.nextReviewAt <= now);
    pool.sort((a, b) => (a.stability || 0) - (b.stability || 0));
  } else if (filterType) {
    pool = pool.filter(i => i.type === filterType);
  }

  items.value = pool.slice(0, 20);
  if (items.value.length === 0) {
    isFinished.value = true;
  } else if (sessionType.value === "forgetting") {
    inSession.value = true;
  }
});

const currentItem = computed(() => items.value[currentIdx.value]);

const newWordsCount = computed(() => 
  store.items.filter((i) => (i.status || "new") === "new").length
);

const setupStats = computed(() => {
  const now = nowRef.value;
  const base = {
    word: { total: 0 },
    phrase: { total: 0 },
    sentence: { total: 0 },
  };
  store.items.forEach((item) => {
    const status = item.status || "new";
    const isNew = status === "new";
    const isDue = !item.nextReviewAt || item.nextReviewAt <= now;
    if ((includeNew.value && isNew) || (includeDue.value && isDue)) {
      base[item.type].total += 1;
    }
  });
  return base;
});

const totalSelectedCount = computed(() => {
  const now = nowRef.value;
  const ids = new Set<string>();
  store.items.forEach((item) => {
    if (!selectedTypes.value[item.type]) return;
    const status = item.status || "new";
    const isNew = status === "new";
    const isDue = !item.nextReviewAt || item.nextReviewAt <= now;
    if ((includeNew.value && isNew) || (includeDue.value && isDue)) {
      ids.add(item.id);
    }
  });
  return ids.size;
});

const queueItems = computed(() => items.value);

const totalLearningCount = computed(() =>
  store.items.filter((i) => (i.status || "new") === "learning").length
);
const totalDueCount = computed(() => {
  const now = nowRef.value;
  return store.items.filter(
    (i) => i.nextReviewAt && i.nextReviewAt <= now
  ).length;
});
const hasStartableItems = computed(
  () => totalLearningCount.value > 0 || totalDueCount.value > 0
);
const masteredCount = computed(
  () => store.items.filter((i) => i.status === "mastered").length
);
const retention = computed(() => {
  const total = store.items.length;
  if (!total) return 0;
  const retained = store.items.filter(
    (i) => i.status === "learning" || i.status === "mastered"
  ).length;
  return Math.round((retained / total) * 100);
});

function resetData() {
  if (confirm("Reset corpus data and reload samples? This will clear current progress.")) {
    store.clear();
    store.addSample();
    window.location.reload();
  }
}

function startRecitationSession() {
  const now = Date.now();
  nowRef.value = now;
  const learningIds: string[] = [];
  store.items.forEach((item) => {
    if (!selectedTypes.value[item.type]) return;
    const status = item.status || "new";
    const isNew = status === "new";
    const isDue = !item.nextReviewAt || item.nextReviewAt <= now;
    if ((includeNew.value && isNew) || (includeDue.value && isDue)) {
      if (isNew) {
        learningIds.push(item.id);
      }
    }
  });
  if (learningIds.length) {
    store.setStatusForMany(learningIds, "learning");
  }

  showSetup.value = false;
}

function startLearningSession() {
  if (!items.value.length) {
    const now = Date.now();
    const pool = store.items.filter((i) => {
      const status = i.status || "new";
      const isLearning = status === "learning";
      const isDue = !!i.nextReviewAt && i.nextReviewAt <= now;
      return isLearning || isDue;
    });
    if (!pool.length) return;
    items.value = pool.slice(0, 50);
  }
  inSession.value = true;
  isFinished.value = false;
  currentIdx.value = 0;
  showAnswer.value = false;
}

function selectQueueItem(item: CorpusItem) {
  selectedQueueItem.value = item;
}

function backToQueue() {
  inSession.value = false;
  isFinished.value = false;
  currentIdx.value = 0;
  showAnswer.value = false;
}

function handleReview(performance: "easy" | "good" | "hard" | "again") {
  if (!currentItem.value) return;
  
  store.updateReview(currentItem.value.id, performance);
  
  if (currentIdx.value < items.value.length - 1) {
    currentIdx.value++;
    showAnswer.value = false;
  } else {
    isFinished.value = true;
  }
}

// --- New Computed Properties ---

const clozeContext = computed(() => {
  if (!currentItem.value || !currentItem.value.context) return null;
  const text = currentItem.value.text;
  const escapedText = text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(escapedText, 'gi');
  return currentItem.value.context.replace(regex, '______');
});

const currentItemSimple = computed(() => {
  if (!currentItem.value) return null;
  return currentItem.value.simpleAnalysis || {
    definition: currentItem.value.translation,
    phonetic: '',
    pos: currentItem.value.type
  };
});

const currentItemAnalysis = computed(() => currentItem.value?.fullAiReport);

// Semantic Linkage: Find items mentioned in synonyms
const relatedItems = computed(() => {
  if (!currentItem.value || !currentItemAnalysis.value?.coreEssence?.synonyms) return [];
  const synonymsStr = currentItemAnalysis.value.coreEssence.synonyms.toLowerCase();
  
  // Find items in corpus that appear in the synonyms string
  return store.items.filter(i => 
    i.id !== currentItem.value?.id && 
    i.type === currentItem.value?.type &&
    synonymsStr.includes(i.text.toLowerCase())
  );
});

// Gallery Mode
const viewMode = ref<'review' | 'gallery'>('review');

</script>

<template>
  <div class="min-h-screen">
    <div class="max-w-6xl mx-auto flex flex-col gap-6 pb-20">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-3xl font-black text-slate-900 tracking-tight">
            {{ sessionType === 'forgetting' ? t.memoryReview : t.learning }}
          </h2>
          <div class="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
            {{ inSession ? `${currentIdx + 1} / ${items.length} ${t.items}` : t.overview }}
          </div>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mx-6">
            <button 
              @click="viewMode = 'review'"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="viewMode === 'review' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
            >
              Review
            </button>
            <button 
              @click="viewMode = 'gallery'"
              class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
              :class="viewMode === 'gallery' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-900'"
            >
              Gallery
            </button>
        </div>

        <div class="flex items-center gap-6">
          <div>
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{{ t.retention }}</div>
            <div class="text-xl font-black text-slate-900">{{ retention }}%</div>
          </div>
          <div>
            <div class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-0.5">{{ t.mastered }}</div>
            <div class="text-xl font-black text-indigo-600">{{ masteredCount }}</div>
          </div>
        </div>
      </div>



      <!-- Gallery View -->
      <div v-if="viewMode === 'gallery'" class="w-full overflow-x-auto pb-8 snap-x snap-mandatory flex gap-6 px-4 custom-scrollbar">
         <div 
           v-for="item in store.items" 
           :key="item.id" 
           class="snap-center shrink-0 w-[350px] bg-white rounded-3xl border border-slate-200 shadow-xl p-6 flex flex-col h-[500px] overflow-y-auto custom-scrollbar"
         >
            <div class="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">{{ item.type }}</div>
            <div class="text-2xl font-black text-slate-900 mb-2">{{ item.text }}</div>
            <div class="text-slate-600 mb-6 font-medium">{{ item.simpleAnalysis?.definition || item.translation }}</div>
            
            <div v-if="item.fullAiReport" class="space-y-4">
               <div class="bg-blue-50/50 border border-blue-100 p-4 rounded-xl text-sm text-slate-700 leading-relaxed">
                  <div class="text-[10px] font-bold text-blue-500 uppercase mb-1">Core Essence</div>
                  {{ item.fullAiReport.coreEssence.deepDefinition }}
               </div>
               
               <div v-if="item.fullAiReport.structure?.collocations?.length" class="space-y-2">
                  <div class="text-[10px] font-bold text-slate-400 uppercase">Collocations</div>
                  <div class="flex flex-wrap gap-2">
                    <span v-for="c in item.fullAiReport.structure.collocations.slice(0,5)" :key="c" class="px-2 py-1 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                      {{ c }}
                    </span>
                  </div>
               </div>

               <div v-if="item.fullAiReport.structure?.sentenceBreakdown" class="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-600">
                  <div class="text-[10px] font-bold text-slate-400 uppercase mb-1">Structure</div>
                  {{ item.fullAiReport.structure.sentenceBreakdown }}
               </div>
            </div>
            <div v-else class="flex-1 flex flex-col items-center justify-center text-slate-400 text-sm italic space-y-2">
               <span>No deep analysis yet</span>
               <button class="px-4 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold shadow-sm">Analyze Now</button>
            </div>
         </div>
      </div>

      <div
        v-else
        class="grid gap-6 items-start w-full grid-cols-1"
        :class="selectedQueueItem ? 'lg:grid-cols-[340px_1fr]' : 'lg:grid-cols-1'"
      >
        <!-- LEFT COLUMN: Setup & Details -->
        <div class="space-y-6">
          <div v-if="showSetup" class="fixed inset-0 z-40 flex items-center justify-center bg-black/10">
            <div
              class="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 w-full max-w-md"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center text-xl font-black">
                    ☰
                  </div>
                  <div>
                    <h2 class="text-lg font-black text-slate-900">{{ t.sessionSetup }}</h2>
                    <p class="text-xs text-slate-500 font-medium">{{ t.configureQueue }}</p>
                  </div>
                </div>
                <!-- Debug/Reset Button -->
                <button 
                  @click="resetData" 
                  class="text-[10px] text-slate-400 hover:text-red-500 underline"
                  title="Reload sample data for testing"
                >
                  {{ t.resetData }}
                </button>
              </div>

              <div class="space-y-3 mb-4">
                <label class="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-400">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" v-model="selectedTypes.word" class="rounded border-slate-300" />
                    <span class="text-sm font-semibold text-slate-800">{{ t.words }}</span>
                  </span>
                  <span class="text-xs text-slate-500">{{ setupStats.word.total }} {{ t.items }}</span>
                </label>
                <label class="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-400">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" v-model="selectedTypes.phrase" class="rounded border-slate-300" />
                    <span class="text-sm font-semibold text-slate-800">{{ t.phrases }}</span>
                  </span>
                  <span class="text-xs text-slate-500">{{ setupStats.phrase.total }} {{ t.items }}</span>
                </label>
                <label class="flex items-center justify-between px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-slate-400">
                  <span class="flex items-center gap-2">
                    <input type="checkbox" v-model="selectedTypes.sentence" class="rounded border-slate-300" />
                    <span class="text-sm font-semibold text-slate-800">{{ t.sentences }}</span>
                  </span>
                  <span class="text-xs text-slate-500">{{ setupStats.sentence.total }} {{ t.items }}</span>
                </label>
              </div>

              <div class="flex items-center justify-between mb-4">
                <label class="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <input type="checkbox" v-model="includeNew" class="rounded border-slate-300" />
                  {{ t.includeNew }}
                </label>
                <label class="flex items-center gap-2 text-xs text-slate-600 font-medium">
                  <input type="checkbox" v-model="includeDue" class="rounded border-slate-300" />
                  {{ t.includeDue }}
                </label>
              </div>

              <button
                :disabled="totalSelectedCount === 0"
                @click="startRecitationSession"
                class="w-full h-11 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all"
                :class="totalSelectedCount === 0 ? 'bg-slate-200 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200 active:scale-95'"
              >
                {{ t.import }} ({{ totalSelectedCount }})
              </button>
              <button
                class="mt-3 w-full h-10 rounded-2xl text-xs font-bold text-slate-500 border border-slate-200 hover:bg-slate-50"
                @click="showSetup = false"
              >
                {{ t.cancel }}
              </button>
            </div>
          </div>

          <div v-else-if="selectedQueueItem" class="bg-white rounded-3xl border border-slate-200 shadow-xl p-6">
             <div class="space-y-3">
               <div class="text-xs font-black text-slate-400 uppercase tracking-[0.25em]">{{ t.anatomy }}</div>
               <div class="text-lg font-bold text-slate-900">{{ selectedQueueItem.text }}</div>
               <div class="text-sm text-slate-500">{{ selectedQueueItem.translation }}</div>
               <div v-if="selectedQueueItem.fullAiReport?.structure?.sentenceBreakdown" class="mt-3">
                 <div class="text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mb-2">{{ t.pattern }}</div>
                 <div class="text-sm font-mono bg-indigo-50/50 p-3 rounded-xl text-indigo-900 border border-indigo-100/50">
                   {{ selectedQueueItem.fullAiReport.structure.sentenceBreakdown }}
                 </div>
               </div>
             </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: Daily Goal, Session Card, List -->
        <div class="space-y-6">
          <div
            v-if="sessionType === 'recitation'"
            class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            <!-- Daily Goal Card -->
            <div class="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xl p-6 flex flex-col gap-4">
              <div class="text-lg font-black text-slate-900">{{ t.dailyGoal }}</div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em]">{{ t.learning }}</div>
                  <div class="mt-1 text-2xl font-black text-slate-900">{{ totalLearningCount }}</div>
                </div>
                <div>
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-[0.18em]">{{ t.due }}</div>
                  <div class="mt-1 flex items-center justify-between gap-3">
                    <div class="text-2xl font-black text-rose-600">{{ totalDueCount }}</div>
                    <button
                      v-if="!inSession && hasStartableItems"
                      @click="startLearningSession"
                      class="px-4 h-8 rounded-2xl bg-slate-900 text-white text-[11px] font-black shadow-sm hover:bg-slate-800 active:scale-95 transition-all"
                    >
                      {{ t.startNow }}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- New Words Card -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 flex flex-col justify-between">
              <div class="text-sm font-bold text-slate-900">{{ t.newWords }}</div>
              <div>
                <div class="text-3xl font-black text-slate-900">{{ newWordsCount }}</div>
                <div class="text-xs font-medium text-slate-400 mt-1">{{ t.totalAvailable }}</div>
              </div>
            </div>

            <!-- Review History Card -->
            <div class="bg-white rounded-3xl border border-slate-200 shadow-xl p-6 flex flex-col justify-between">
              <div class="text-sm font-bold text-slate-900">{{ t.reviewHistory }}</div>
              <div>
                <div class="flex items-center gap-1 text-xs text-slate-400 mb-2">
                  <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {{ t.last30Days }}
                </div>
                <svg class="w-full h-8 text-indigo-500" viewBox="0 0 100 30" preserveAspectRatio="none">
                  <path
                    d="M0,25 Q10,20 20,22 T40,15 T60,18 T80,10 T100,5"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                  />
                </svg>
              </div>
            </div>
          </div>

          <div v-if="inSession && !isFinished && currentItem" class="w-full">
            <div class="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden transition-all duration-500 min-h-[360px] flex flex-col">
              <div class="h-1.5 bg-slate-100 w-full">
                <div
                  class="h-full bg-indigo-600 transition-all duration-500"
                  :style="{ width: `${((currentIdx + 1) / items.length) * 100}%` }"
                ></div>
              </div>

              <div class="flex-1 p-10 flex flex-col items-center justify-center text-center">
                <div class="text-xs font-black text-indigo-500 uppercase tracking-[0.3em] mb-6">
                  {{ currentItem.type === 'word' ? t.targetWord : currentItem.type === 'phrase' ? t.keyPhrase : t.sentenceStructure }}
                </div>
                <div class="text-3xl md:text-4xl font-black text-slate-900 leading-tight mb-8">
                  {{ currentItem.text }}
                </div>

                <!-- Shadow Practice: Cloze Context -->
                <div v-if="!showAnswer && clozeContext" class="mb-8 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-600 font-medium leading-relaxed max-w-lg mx-auto">
                   "{{ clozeContext }}"
                </div>

                <div
                  v-if="showAnswer"
                  class="animate-in fade-in slide-in-from-bottom-4 duration-500 w-full"
                >
                  <div class="h-px bg-slate-100 w-24 mx-auto mb-8"></div>
                  
                  <!-- Main Translation -->
                  <div class="text-xl text-slate-600 font-medium leading-relaxed max-w-md mx-auto">
                    {{ currentItemSimple?.definition || currentItem.translation }}
                  </div>
                  
                  <div v-if="currentItemSimple?.phonetic" class="text-sm text-slate-400 font-mono mt-1">
                    /{{ currentItemSimple.phonetic }}/
                  </div>

                  <!-- Full Context -->
                  <div v-if="currentItem.context" class="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-slate-700 italic leading-relaxed max-w-lg mx-auto">
                    "{{ currentItem.context }}"
                  </div>

                  <!-- AI Analysis Report -->
                  <div v-if="currentItemAnalysis" class="mt-8 space-y-6 text-left max-w-lg mx-auto">
                    
                    <!-- Core Essence -->
                    <div v-if="currentItemAnalysis.coreEssence" class="bg-blue-50/50 rounded-xl p-4 border border-blue-100">
                      <div class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-2">Core Essence</div>
                      <div class="text-sm text-slate-700 leading-relaxed">{{ currentItemAnalysis.coreEssence.deepDefinition }}</div>
                      <div v-if="currentItemAnalysis.coreEssence.synonyms" class="mt-2 text-xs text-slate-500 italic">
                        Vs: {{ currentItemAnalysis.coreEssence.synonyms }}
                      </div>
                    </div>

                    <!-- Semantic Linkage -->
                    <div v-if="relatedItems.length > 0" class="bg-indigo-50/50 rounded-xl p-4 border border-indigo-100">
                      <div class="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-3">Semantic Linkage</div>
                      <div class="overflow-x-auto">
                        <table class="w-full text-sm text-left">
                          <thead>
                            <tr class="border-b border-indigo-100">
                              <th class="pb-2 font-bold text-slate-700">Word</th>
                              <th class="pb-2 font-bold text-slate-700">Definition</th>
                            </tr>
                          </thead>
                          <tbody class="text-slate-600">
                            <tr v-for="item in relatedItems" :key="item.id" class="border-b border-indigo-50 last:border-0">
                              <td class="py-2 font-medium text-indigo-900">{{ item.text }}</td>
                              <td class="py-2 text-xs">{{ item.simpleAnalysis?.definition || item.translation }}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <!-- Structure -->
                    <div v-if="currentItemAnalysis.structure" class="space-y-3">
                       <div v-if="currentItemAnalysis.structure.collocations?.length" class="flex flex-wrap gap-2 justify-center">
                         <span v-for="col in currentItemAnalysis.structure.collocations" :key="col" class="px-2 py-1 bg-slate-100 rounded-lg text-xs font-medium text-slate-600">
                           {{ col }}
                         </span>
                       </div>
                       <div v-if="currentItemAnalysis.structure.sentenceBreakdown" class="text-sm text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                         <span class="font-bold text-slate-400 text-xs uppercase mr-2">Structure</span>
                         {{ currentItemAnalysis.structure.sentenceBreakdown }}
                       </div>
                    </div>

                  </div>

                  <div v-if="currentItem.note && !currentItemAnalysis" class="mt-4 text-sm text-slate-400 italic">
                    "{{ currentItem.note }}"
                  </div>
                </div>

                <button
                  v-else
                  @click="showAnswer = true"
                  class="mt-4 flex items-center gap-2 text-indigo-600 font-bold hover:scale-110 transition-transform"
                >
                  <EyeIcon class="w-6 h-6" />
                  <span>{{ t.showTranslation }}</span>
                </button>
              </div>

              <div class="p-6 bg-slate-50/50 border-t border-slate-100">
                <template v-if="showAnswer">
                  <div v-if="sessionType === 'forgetting'" class="grid grid-cols-4 gap-3">
                    <button
                      v-for="p in (['again', 'hard', 'good', 'easy'] as const)"
                      :key="p"
                      @click="handleReview(p)"
                      class="flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all active:scale-95"
                      :class="{
                        'bg-red-50 border-red-100 text-red-600 hover:bg-red-100': p === 'again',
                        'bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100': p === 'hard',
                        'bg-blue-50 border-blue-100 text-blue-600 hover:bg-blue-100': p === 'good',
                        'bg-green-50 border-green-100 text-green-600 hover:bg-green-100': p === 'easy',
                      }"
                    >
                      <span class="text-xs font-black uppercase tracking-wider">
                        {{ p === 'again' ? t.btnAgain : p === 'hard' ? t.btnHard : p === 'good' ? t.btnGood : t.btnEasy }}
                      </span>
                    </button>
                  </div>
                  <div v-else class="grid grid-cols-3 gap-3">
                    <button
                      @click="handleReview('again')"
                      class="flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all active:scale-95 bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                    >
                      <span class="text-xs font-black tracking-wider">{{ t.forget }}</span>
                    </button>
                    <button
                      @click="handleReview('hard')"
                      class="flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all active:scale-95 bg-orange-50 border-orange-100 text-orange-600 hover:bg-orange-100"
                    >
                      <span class="text-xs font-black tracking-wider">{{ t.vague }}</span>
                    </button>
                    <button
                      @click="handleReview('easy')"
                      class="flex flex-col items-center gap-1 py-3 rounded-2xl border transition-all active:scale-95 bg-green-50 border-green-100 text-green-600 hover:bg-green-100"
                    >
                      <span class="text-xs font-black tracking-wider">{{ t.master }}</span>
                    </button>
                  </div>
                </template>
                <div v-else class="text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                  {{ t.tryRecall }}
                </div>
              </div>
            </div>
          </div>

          <div v-else-if="inSession && isFinished" class="text-center">
            <div class="w-24 h-24 rounded-[2rem] bg-indigo-600 text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-200">
              <CheckCircleIcon class="w-12 h-12" />
            </div>
            <h2 class="mt-4 text-3xl font-black text-slate-900 mb-4">{{ t.sessionComplete }}</h2>
            <p class="text-slate-500 font-medium mb-6 max-w-sm mx-auto">
              {{ t.greatJob }}
            </p>
            <button
              @click="backToQueue"
              class="px-8 h-11 rounded-2xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
            >
              {{ t.backToQueue }}
            </button>
          </div>

          <div v-else-if="!items.length" class="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 py-20">
            <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4 text-slate-300">
              <EyeIcon class="w-8 h-8" />
            </div>
            <p class="text-slate-500 font-medium mb-1">{{ t.emptyState }}</p>
            <p class="text-xs text-slate-400 mb-4">Nothing here yet, start by importing.</p>
            <button
              @click="showSetup = true"
              class="px-6 h-11 rounded-2xl bg-slate-900 text-white font-black shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-95"
            >
              {{ t.importFromCorpus }}
            </button>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="item in queueItems"
              :key="item.id"
              @click="selectQueueItem(item)"
              class="flex items-center justify-between px-4 py-3 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-indigo-200 hover:shadow-md transition-all"
            >
              <div class="flex-1">
                <div class="text-sm font-semibold text-slate-900">{{ item.text }}</div>
                <div class="text-xs text-slate-500 mt-1">{{ item.translation }}</div>
              </div>
              <div class="flex flex-col items-end gap-2 ml-4">
                <span
                  v-if="(item.status || 'new') === 'new'"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em] bg-sky-100 text-sky-600"
                >
                  {{ t.statusNew }}
                </span>
                <span
                  v-else-if="(item.status || 'new') === 'learning'"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em] bg-emerald-100 text-emerald-600"
                >
                  {{ t.statusLearning }}
                </span>
                <span
                  v-if="item.nextReviewAt && item.nextReviewAt <= Date.now()"
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em] bg-rose-100 text-rose-600"
                >
                  {{ t.statusDue }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>
