<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { useLibraryStore } from "../stores/library";
import { useUiStore } from "../stores/ui";
import { ref } from "vue";
import { 
  ChevronLeftIcon, 
  EyeIcon, 
  EyeSlashIcon,
  PlayIcon,
  PauseIcon,
  AdjustmentsHorizontalIcon
} from "@heroicons/vue/24/outline";
import { computed } from "vue";
import AnalysisPanel from "../components/AnalysisPanel.vue";

const route = useRoute();
const router = useRouter();
const lib = useLibraryStore();
const ui = useUiStore();
const id = String(route.params.id);
const article = lib.articles.find(a => a.id === id);
const focusMode = ref(false);
const focusIndex = ref<number | null>(null);
const isPlaying = ref<number | null>(null);
const showSettings = ref(false);

const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    back: isZh ? '返回' : 'Back',
    focusMode: isZh ? '专注模式' : 'Focus Mode',
    settings: isZh ? '设置' : 'Settings',
    readingPrefs: isZh ? '阅读偏好' : 'Reading Preferences',
    fontSize: isZh ? '字号' : 'Font Size',
    lineHeight: isZh ? '行高' : 'Line Height',
    paragraphGap: isZh ? '段间距' : 'Paragraph Gap',
    maxWidth: isZh ? '最大宽度' : 'Max Width',
    articleNotFound: isZh ? '未找到文章' : 'Article not found',
    backToLibrary: isZh ? '返回书库' : 'Go back to Library',
    readParagraph: isZh ? '朗读此段' : 'Read this paragraph',
  };
});

function toggleFocus() {
  focusMode.value = !focusMode.value;
  if (!focusMode.value) focusIndex.value = null;
}

function speak(text: string, index: number) {
  if (isPlaying.value === index) {
    window.speechSynthesis.cancel();
    isPlaying.value = null;
    return;
  }
  
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US"; // Default to English
  utterance.onend = () => {
    isPlaying.value = null;
  };
  isPlaying.value = index;
  window.speechSynthesis.speak(utterance);
}
</script>

<template>
  <div 
    v-if="article" 
    class="min-h-screen bg-white pb-24 transition-all duration-300 ease-in-out"
    :style="{ paddingRight: ui.analysisPanel.visible ? '400px' : '0' }"
  >
    <!-- Header Bar -->
    <header class="h-16 border-b border-slate-100 flex items-center justify-between px-8 sticky top-0 bg-white/90 backdrop-blur-md z-30">
      <div class="flex items-center gap-4">
        <button 
          @click="router.push('/reading')"
          class="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-medium transition-colors"
        >
          <ChevronLeftIcon class="w-5 h-5" />
          <span>{{ t.back }}</span>
        </button>
        
        <div class="w-[1px] h-6 bg-slate-200 mx-2"></div>
        
        <button 
          @click="toggleFocus"
          class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium"
          :class="focusMode ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
        >
          <component :is="focusMode ? EyeSlashIcon : EyeIcon" class="w-5 h-5" />
          <span>{{ t.focusMode }}</span>
        </button>

        <div class="relative">
          <button 
            @click="showSettings = !showSettings"
            class="flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium"
            :class="showSettings ? 'bg-slate-100 text-slate-900' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'"
          >
            <AdjustmentsHorizontalIcon class="w-5 h-5" />
            <span>{{ t.settings }}</span>
          </button>

          <!-- Settings Popover -->
          <div v-if="showSettings" class="absolute top-full mt-2 left-0 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
            <h3 class="text-sm font-bold text-slate-900 mb-6 flex items-center justify-between">
              {{ t.readingPrefs }}
              <button @click="showSettings = false" class="text-slate-400 hover:text-slate-600">✕</button>
            </h3>
            <div class="space-y-6">
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.fontSize }}</span>
                  <span class="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{{ ui.fontSize }}px</span>
                </div>
                <input type="range" min="14" max="32" step="1" v-model.number="ui.fontSize" class="w-full accent-slate-900" />
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.lineHeight }}</span>
                  <span class="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{{ ui.lineHeight }}</span>
                </div>
                <input type="range" min="1.2" max="2.5" step="0.1" v-model.number="ui.lineHeight" class="w-full accent-slate-900" />
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.paragraphGap }}</span>
                  <span class="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{{ ui.paragraphGap }}px</span>
                </div>
                <input type="range" min="0" max="64" step="1" v-model.number="ui.paragraphGap" class="w-full accent-slate-900" />
              </div>
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">{{ t.maxWidth }}</span>
                  <span class="text-xs font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">{{ ui.maxWidth }}px</span>
                </div>
                <input type="range" min="600" max="1200" step="50" v-model.number="ui.maxWidth" class="w-full accent-slate-900" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="text-xs text-slate-400 font-medium">
        {{ article.category }} • {{ new Date(article.createdAt).toLocaleDateString() }}
      </div>
    </header>

    <!-- Content Area -->
    <main class="mx-auto py-12 px-8" :style="{ maxWidth: `${ui.maxWidth}px` }">
      <h1 class="text-4xl font-black text-slate-900 text-center leading-tight mb-16 tracking-tight">
        {{ article.title }}
      </h1>

      <div class="prose prose-slate max-w-none">
        <div
          v-for="(p, i) in article.paragraphs"
          :key="i"
          class="relative group transition-all duration-500"
          :style="{ marginBottom: `${ui.paragraphGap}px` }"
          :class="[
            focusMode 
              ? (focusIndex === i ? 'opacity-100' : 'opacity-10 blur-[1px] scale-[0.98]') 
              : 'hover:bg-slate-50/50 rounded-2xl'
          ]"
        >
          <div class="flex gap-6 items-start py-2 px-6 -mx-6">
            <!-- Per-paragraph play button -->
            <button 
              @click="speak(p, i)"
              class="shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 shadow-sm"
              :class="isPlaying === i ? 'bg-slate-900 text-white animate-pulse' : 'bg-slate-100 text-slate-400 hover:bg-slate-900 hover:text-white'"
              title="Read this paragraph"
            >
              <PauseIcon v-if="isPlaying === i" class="w-5 h-5 fill-current" />
              <PlayIcon v-else class="w-5 h-5 fill-current ml-0.5" />
            </button>

            <!-- Text Content -->
            <p 
              class="text-slate-700 select-text flex-1 cursor-pointer my-0"
              :style="{ fontSize: `${ui.fontSize}px`, lineHeight: ui.lineHeight }"
              @click="focusMode ? (focusIndex = i) : null"
            >
              {{ p }}
            </p>
          </div>
          
          <div v-if="focusMode && focusIndex === i" class="absolute -left-8 top-6 bottom-6 w-1.5 bg-slate-900 rounded-full"></div>
        </div>
      </div>
    </main>
    <AnalysisPanel />
  </div>
  
  <div v-else class="flex flex-col items-center justify-center h-screen bg-slate-50">
    <div class="text-slate-400 mb-4 text-lg">{{ t.articleNotFound }}</div>
    <button @click="router.push('/reading')" class="text-blue-600 font-bold hover:underline">{{ t.backToLibrary }}</button>
  </div>
</template>

<style scoped>
.prose {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}
</style>
