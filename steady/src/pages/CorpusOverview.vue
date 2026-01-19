<script setup lang="ts">
import { useCorpusStore, type CorpusType, type LearningStatus } from "../stores/corpus";
import { ref, computed } from "vue";
import CorpusItemDetail from "../components/CorpusItemDetail.vue";
import { 
  BookOpenIcon, 
  Square2StackIcon, 
  ListBulletIcon,
  TrashIcon,
  StarIcon as StarIconOutline
} from "@heroicons/vue/24/outline";
import { StarIcon as StarIconSolid } from "@heroicons/vue/24/solid";

const store = useCorpusStore();
store.addSample();
const filter = ref<CorpusType>("word");
const viewMode = ref<"list" | "card">("list");
const favoritesView = ref(false);
const showDetail = ref(false);
const current = ref<any>(null);

const displayItems = computed(() => {
  if (favoritesView.value) {
    return store.items.filter(i => i.isFavorite);
  }
  return store.items.filter(i => i.type === filter.value);
});

const favoritesCount = computed(() => store.favoritesCount);

function statusLabel(status: LearningStatus | undefined) {
  const s: LearningStatus = status || "new";
  return s.toUpperCase();
}

function openDetail(item: any) { 
  current.value = item; 
  showDetail.value = true; 
}

function closeDetail() { 
  showDetail.value = false; 
  current.value = null; 
}
</script>

<template>
  <div class="max-w-6xl mx-auto pb-20">
    <!-- Header Area -->
    <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
      <div>
        <h2 class="text-3xl font-black text-slate-900 tracking-tight">Corpus</h2>
        <p class="text-slate-500 font-medium">Refine your linguistic assets and master expressions</p>
      </div>
      
      <div class="flex items-center gap-3">
        <button 
          class="flex items-center gap-2 px-5 h-11 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
          @click="$router.push({ name: 'ReviewSession' })"
        >
          <BookOpenIcon class="w-5 h-5" />
          <span>Start Session</span>
        </button>
      </div>
    </div>

    <!-- Top Stats Row -->
    <div class="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
      <button
        class="flex flex-col items-start px-4 py-3 rounded-2xl border text-left transition-all"
        :class="!favoritesView && filter === 'word' ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:border-slate-400'"
        @click="favoritesView = false; filter = 'word'"
      >
        <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Word</div>
        <div class="mt-1 text-xl font-black">{{ store.wordsCount }}</div>
      </button>
      <button
        class="flex flex-col items-start px-4 py-3 rounded-2xl border text-left transition-all"
        :class="!favoritesView && filter === 'phrase' ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:border-slate-400'"
        @click="favoritesView = false; filter = 'phrase'"
      >
        <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Phrase</div>
        <div class="mt-1 text-xl font-black">{{ store.phrasesCount }}</div>
      </button>
      <button
        class="flex flex-col items-start px-4 py-3 rounded-2xl border text-left transition-all"
        :class="!favoritesView && filter === 'sentence' ? 'border-indigo-600 text-indigo-600 bg-white shadow-sm ring-1 ring-indigo-600' : 'border-slate-200 bg-white hover:border-slate-400'"
        @click="favoritesView = false; filter = 'sentence'"
      >
        <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Sentence</div>
        <div class="mt-1 text-xl font-black">{{ store.sentencesCount }}</div>
      </button>
      <button
        class="flex flex-col items-start px-4 py-3 rounded-2xl border text-left transition-all"
        :class="favoritesView ? 'border-amber-500 text-amber-600 bg-white shadow-sm ring-1 ring-amber-500' : 'border-slate-200 bg-white hover:border-amber-400'"
        @click="favoritesView = true"
      >
        <div class="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Favorites</div>
        <div class="mt-1 text-xl font-black">{{ favoritesCount }}</div>
      </button>
    </div>

    <!-- Filter & View Toggle -->
    <div class="mt-8 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
      <div class="flex p-1 bg-slate-100 rounded-xl">
        <button 
          v-for="t in (['word', 'phrase', 'sentence'] as const)" 
          :key="t"
          @click="filter = t"
          class="px-6 py-2 rounded-lg text-sm font-bold transition-all"
          :class="!favoritesView && filter === t ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
        >
          {{ t.charAt(0).toUpperCase() + t.slice(1) }}s
        </button>
      </div>

      <div class="flex items-center gap-2">
        <template v-if="filter !== 'sentence' && !favoritesView">
          <div class="w-[1px] h-6 bg-slate-200 mx-2"></div>
          <button 
            @click="viewMode = 'list'"
            class="p-2 rounded-lg transition-colors"
            :class="viewMode === 'list' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'"
          >
            <ListBulletIcon class="w-5 h-5" />
          </button>
          <button 
            @click="viewMode = 'card'"
            class="p-2 rounded-lg transition-colors"
            :class="viewMode === 'card' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-500'"
          >
            <Square2StackIcon class="w-5 h-5" />
          </button>
        </template>
      </div>
    </div>

    <!-- Main Content -->
    <div class="mt-8">
      <!-- Empty State -->
      <div v-if="displayItems.length === 0" class="flex flex-col items-center justify-center py-20 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
        <div class="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-sm mb-4 text-slate-300">
          <BookOpenIcon class="w-8 h-8" />
        </div>
        <p class="text-slate-500 font-medium">No items found in this category.</p>
      </div>

      <!-- Favorites View (all types mixed) -->
      <div v-else-if="favoritesView" class="space-y-3">
        <div
          v-for="item in displayItems"
          :key="item.id"
          @click="openDetail(item)"
          class="group cursor-pointer bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between hover:border-amber-200 hover:shadow-md transition-all"
        >
          <div class="flex items-start gap-4">
            <div class="space-y-1">
              <span
                v-if="!favoritesView"
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em]"
                :class="{
                  'bg-sky-100 text-sky-600': (item.status || 'new') === 'new',
                  'bg-emerald-100 text-emerald-600': item.status === 'learning',
                  'bg-slate-100 text-slate-500': item.status === 'mastered',
                }"
              >
                {{ statusLabel(item.status) }}
              </span>
              <span class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em] bg-slate-100 text-slate-500 ml-2">
                {{ item.type.toUpperCase() }}
              </span>
            </div>
            <div>
              <div class="text-lg font-bold text-slate-900 leading-snug">
                {{ item.text }}
              </div>
              <div v-if="item.translation" class="mt-1 text-sm text-slate-500">
                {{ item.translation }}
              </div>
            </div>
          </div>
          <div class="flex items-center gap-2">
            <button @click.stop="store.toggleFavorite(item.id)" class="p-2 rounded-lg hover:bg-amber-50" :class="item.isFavorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'">
              <component :is="item.isFavorite ? StarIconSolid : StarIconOutline" class="w-4 h-4" />
            </button>
            <button @click.stop="store.removeItem(item.id)" class="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
              <TrashIcon class="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <!-- Words List (Focused on memorization) -->
      <div v-else-if="filter === 'word'" :class="viewMode === 'list' ? 'space-y-2' : 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4'">
        <div 
          v-for="item in displayItems" 
          :key="item.id" 
          @click="openDetail(item)"
          class="group cursor-pointer bg-white border border-slate-200 transition-all hover:border-indigo-200 hover:shadow-md active:scale-[0.99]"
          :class="viewMode === 'list' ? 'flex items-center justify-between p-4 rounded-xl' : 'p-6 rounded-2xl flex flex-col items-center text-center'"
        >
          <div :class="viewMode === 'list' ? 'flex items-center gap-4' : 'flex flex-col items-center'">
            <div class="flex items-center gap-2 mb-1" :class="viewMode === 'list' ? '' : 'justify-center w-full'">
              <span
                class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em]"
                :class="{
                  'bg-sky-100 text-sky-600': (item.status || 'new') === 'new',
                  'bg-emerald-100 text-emerald-600': item.status === 'learning',
                  'bg-slate-100 text-slate-500': item.status === 'mastered',
                }"
              >
                {{ statusLabel(item.status) }}
              </span>
            </div>
            <div class="text-xl font-bold text-slate-900">{{ item.text }}</div>
            <div class="text-slate-500" :class="viewMode === 'list' ? 'text-sm' : 'mt-2 text-sm'">{{ item.translation }}</div>
          </div>
          <div class="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
             <button @click.stop="store.toggleFavorite(item.id)" class="p-2 rounded-lg hover:bg-amber-50" :class="item.isFavorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'">
               <component :is="item.isFavorite ? StarIconSolid : StarIconOutline" class="w-4 h-4" />
             </button>
             <button @click.stop="store.removeItem(item.id)" class="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
               <TrashIcon class="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      <!-- Phrases List (Focused on usage) -->
      <div v-else-if="filter === 'phrase'" :class="viewMode === 'list' ? 'space-y-2' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'">
        <div 
          v-for="item in displayItems" 
          :key="item.id"
          @click="openDetail(item)"
          class="group cursor-pointer bg-white border border-slate-200 transition-all hover:border-indigo-200 hover:shadow-lg relative"
          :class="viewMode === 'list' ? 'flex items-center justify-between p-4 rounded-xl' : 'rounded-2xl p-6 flex flex-col'"
        >
          <!-- List View Content -->
          <div v-if="viewMode === 'list'" class="flex items-center gap-4 flex-1 min-w-0">
             <div class="space-y-1 flex-1 min-w-0">
               <div class="flex items-center gap-2">
                 <span
                   class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em]"
                   :class="{
                     'bg-sky-100 text-sky-600': (item.status || 'new') === 'new',
                     'bg-emerald-100 text-emerald-600': item.status === 'learning',
                     'bg-slate-100 text-slate-500': item.status === 'mastered',
                   }"
                 >
                   {{ statusLabel(item.status) }}
                 </span>
               </div>
               <div class="text-lg font-bold text-slate-900 truncate">{{ item.text }}</div>
             </div>
             <div class="text-slate-500 text-sm truncate flex-1">{{ item.translation }}</div>
          </div>
          
          <!-- Card View Content -->
          <template v-else>
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center gap-2 mb-2">
                  <span
                    class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em]"
                    :class="{
                      'bg-sky-100 text-sky-600': (item.status || 'new') === 'new',
                      'bg-emerald-100 text-emerald-600': item.status === 'learning',
                      'bg-slate-100 text-slate-500': item.status === 'mastered',
                    }"
                  >
                    {{ statusLabel(item.status) }}
                  </span>
                </div>
                <div class="text-lg font-bold text-slate-900 leading-tight">{{ item.text }}</div>
              </div>
            </div>
            <div class="text-slate-600 text-sm mb-4 line-clamp-2">{{ item.translation }}</div>
            <div v-if="item.analysis?.collocations" class="flex flex-wrap gap-2 mt-auto">
              <span v-for="c in item.analysis.collocations.slice(0, 3)" :key="c" class="px-2 py-1 bg-slate-100 text-[10px] font-bold text-slate-500 rounded uppercase tracking-wider">
                {{ c }}
              </span>
            </div>
          </template>

          <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" :class="viewMode === 'list' ? '' : 'absolute top-4 right-4'">
             <button @click.stop="store.toggleFavorite(item.id)" class="p-2 rounded-lg hover:bg-amber-50" :class="item.isFavorite ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'">
               <component :is="item.isFavorite ? StarIconSolid : StarIconOutline" class="w-4 h-4" />
             </button>
             <button @click.stop="store.removeItem(item.id)" class="p-2 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500">
               <TrashIcon class="w-4 h-4" />
             </button>
          </div>
        </div>
      </div>

      <!-- Sentences List (Focused on structure) -->
      <div v-else class="space-y-6">
        <div 
          v-for="item in displayItems" 
          :key="item.id"
          @click="openDetail(item)"
          class="group cursor-pointer bg-white border border-slate-200 rounded-3xl p-8 transition-all hover:border-indigo-200 hover:shadow-xl"
        >
          <div class="flex justify-between items-start gap-6">
            <div class="flex-1">
              <div class="mb-3">
                <span
                  class="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black tracking-[0.18em]"
                  :class="{
                    'bg-sky-100 text-sky-600': (item.status || 'new') === 'new',
                    'bg-emerald-100 text-emerald-600': item.status === 'learning',
                    'bg-slate-100 text-slate-500': item.status === 'mastered',
                  }"
                >
                  {{ statusLabel(item.status) }}
                </span>
              </div>
              <div class="text-xl font-medium text-slate-800 leading-relaxed italic">"{{ item.text }}"</div>
              <div class="mt-4 text-slate-500 text-sm">{{ item.translation }}</div>
            </div>
            <div class="flex flex-col gap-2">
              <button @click.stop="store.toggleFavorite(item.id)" class="p-3 rounded-2xl hover:bg-amber-50 transition-colors" :class="item.isFavorite ? 'text-amber-500' : 'text-slate-300 hover:text-amber-500'">
                <component :is="item.isFavorite ? StarIconSolid : StarIconOutline" class="w-5 h-5" />
              </button>
              <button @click.stop="store.removeItem(item.id)" class="p-3 rounded-2xl hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors">
                <TrashIcon class="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CorpusItemDetail v-if="showDetail && current" :item="current" @close="closeDetail" />
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
