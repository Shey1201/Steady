<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/vue";
import { useCorpusStore, type CorpusItem } from "../stores/corpus";
import { useUiStore } from "../stores/ui";
import { CheckCircleIcon } from "@heroicons/vue/24/outline";

const props = defineProps<{ item: CorpusItem }>();
const emit = defineEmits<{ (e: "close"): void, (e: "start", payload: { type: string, text: string }): void }>();
const store = useCorpusStore();
const ui = useUiStore();

const note = ref(props.item.note || "");
const isDirty = computed(() => note.value !== (props.item.note || ""));

function saveNote() {
  store.updateItem(props.item.id, { note: note.value });
  // Show feedback?
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    emit('close');
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown);
  document.body.style.overflow = 'hidden'; // Lock scroll
});

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown);
  document.body.style.overflow = ''; // Unlock scroll
});
</script>

<template>
  <div class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/20" aria-hidden="true" @click="emit('close')"></div>
    <div class="relative bg-white rounded-xl shadow-xl w-[900px] max-w-[95vw] h-[80vh] flex flex-col overflow-hidden">
      <!-- Header -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
        <div class="flex items-center gap-3">
          <span class="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 py-1 bg-slate-200 rounded">{{ props.item.type }}</span>
          <span class="text-xs text-slate-400">{{ new Date(props.item.createdAt).toLocaleDateString() }}</span>
        </div>
        <button class="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400 transition-colors" @click="emit('close')">✕</button>
      </div>
      
      <div class="flex-1 flex overflow-hidden">
        <!-- Left: AI & Content (Scrollable) -->
        <div class="flex-1 overflow-y-auto p-8 border-r border-slate-100 custom-scrollbar">
          
          <!-- Main Text -->
          <div class="mb-8">
            <h1 class="text-3xl font-bold text-slate-900 leading-tight mb-2">{{ props.item.text }}</h1>
            <div v-if="props.item.translation" class="text-xl text-slate-600 italic font-serif">"{{ props.item.translation }}"</div>
          </div>

          <!-- Context -->
          <div v-if="props.item.context" class="mb-8 bg-slate-50 p-6 rounded-2xl border border-slate-100">
             <div class="flex items-center justify-between mb-3">
               <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">Original Context</div>
               <span v-if="props.item.fullAiReport?.corpus?.tag" class="px-2 py-0.5 bg-white border border-slate-200 rounded text-[10px] font-bold text-slate-500 uppercase">{{ props.item.fullAiReport.corpus.tag }}</span>
             </div>
             <div class="text-slate-700 leading-relaxed whitespace-pre-line italic">
               {{ props.item.context }}
             </div>
          </div>

          <!-- AI Analysis Report -->
          <div v-if="props.item.fullAiReport || props.item.analysis" class="space-y-6">
            
            <!-- Context Comparison / Evolution -->
            <div v-if="props.item.fullAiReport?.contextComparison || props.item.fullAiReport?.corpus?.comparison" class="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100">
               <div class="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <span>🔄 Context Evolution</span>
               </div>
               <p class="text-sm text-slate-700 leading-relaxed">{{ props.item.fullAiReport?.contextComparison || props.item.fullAiReport?.corpus?.comparison }}</p>
            </div>

            <!-- Essential / Definition -->
            <div class="grid grid-cols-1 gap-6">
               <div class="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm">
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">💡 Definition</div>
                  
                  <!-- New Structure -->
                  <template v-if="props.item.fullAiReport?.essential">
                     <div class="text-lg font-bold text-slate-900 mb-2">{{ props.item.fullAiReport.essential.gist || props.item.fullAiReport.essential.meaning }}</div>
                     <div class="text-slate-600 text-sm">{{ props.item.fullAiReport.essential.definition }}</div>
                  </template>
                  
                  <!-- Legacy -->
                  <p v-else class="text-slate-700 text-sm leading-relaxed">{{ props.item.fullAiReport?.coreEssence?.deepDefinition || props.item.analysis?.grammar }}</p>
               </div>
               
               <!-- Synonyms & Nuance -->
               <div class="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm">
                  <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">⚖️ Synonyms & Nuance</div>
                  
                  <!-- New Structure -->
                  <template v-if="props.item.fullAiReport?.corpus?.synonyms">
                      <div class="flex flex-wrap gap-2 mb-3">
                        <span v-for="syn in props.item.fullAiReport.corpus.synonyms" :key="syn" class="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">{{ syn }}</span>
                      </div>
                  </template>

                  <!-- Legacy -->
                  <p class="text-slate-700 text-sm leading-relaxed">{{ props.item.fullAiReport?.coreEssence?.synonyms || props.item.analysis?.nuance }}</p>
               </div>
            </div>

            <!-- Structure -->
            <div class="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm">
                <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">🏗️ Structure & Collocations</div>
                
                <div class="flex flex-wrap gap-2 mb-4">
                  <span v-for="c in (props.item.fullAiReport?.syntax?.collocations || props.item.fullAiReport?.structure?.collocations || props.item.analysis?.collocations || [])" :key="c" 
                    class="px-3 py-1 bg-slate-50 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
                    {{ c }}
                  </span>
                </div>

                <!-- Logic Graph (New) -->
                <div v-if="props.item.fullAiReport?.contextAnalysis?.logicGraph" class="mb-4 bg-indigo-50/50 rounded-lg p-3 border border-indigo-100">
                  <div class="text-[10px] font-bold text-indigo-400 uppercase mb-2">Logic Flow</div>
                  <div class="text-xs text-indigo-800 font-mono whitespace-pre-wrap leading-relaxed">
                    {{ props.item.fullAiReport.contextAnalysis.logicGraph }}
                  </div>
                </div>

                <p v-if="props.item.fullAiReport?.contextAnalysis?.breakdown || props.item.fullAiReport?.structure?.sentenceBreakdown" class="text-slate-700 text-sm leading-relaxed border-t border-slate-100 pt-4 mt-2 font-mono text-xs text-indigo-900 bg-indigo-50/30 p-3 rounded">
                  {{ props.item.fullAiReport?.contextAnalysis?.breakdown || props.item.fullAiReport?.structure?.sentenceBreakdown }}
                </p>
                
                <p v-if="props.item.fullAiReport?.syntax?.usage" class="text-slate-600 text-sm mt-3 border-l-2 border-blue-200 pl-3">
                   {{ props.item.fullAiReport.syntax.usage }}
                </p>
            </div>
            
            <!-- Mastery Challenge (New) -->
            <div v-if="props.item.fullAiReport?.corpus?.challenge" class="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-1 border border-indigo-100">
               <div class="bg-white/60 rounded-xl p-5 backdrop-blur-sm">
                 <div class="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-3 flex items-center gap-2">⚔️ Mastery Challenge</div>
                 <div class="mb-4 text-sm font-medium text-slate-800 leading-relaxed p-3 bg-white rounded border border-indigo-50">
                    {{ props.item.fullAiReport.corpus.challenge.question }}
                 </div>
                 <div class="grid grid-cols-2 gap-2">
                    <div v-for="opt in props.item.fullAiReport.corpus.challenge.options" :key="opt" 
                         class="text-xs text-slate-600 px-3 py-2 bg-white border border-slate-100 rounded hover:bg-indigo-50 cursor-pointer transition-colors text-center">
                       {{ opt }}
                    </div>
                 </div>
                 <div class="mt-3 text-right">
                    <Disclosure as="div" v-slot="{ open }">
                      <DisclosureButton class="text-[10px] font-bold text-slate-400 uppercase hover:text-indigo-500 transition-colors">
                        {{ open ? 'Hide Answer' : 'Show Answer' }}
                      </DisclosureButton>
                      <DisclosurePanel class="text-xs font-bold text-green-600 mt-1">
                        {{ props.item.fullAiReport.corpus.challenge.answer }}
                      </DisclosurePanel>
                    </Disclosure>
                 </div>
               </div>
            </div>

            <!-- Mnemonic (New) -->
            <div v-if="props.item.fullAiReport?.corpus?.mnemonic" class="bg-amber-50 rounded-2xl p-5 border border-amber-100 text-center">
               <div class="text-xs font-bold text-amber-500 uppercase tracking-wider mb-2">🔑 Memory Anchor</div>
               <p class="text-amber-900 font-medium text-lg">{{ props.item.fullAiReport.corpus.mnemonic }}</p>
            </div>

             <!-- Knowledge -->
             <div v-if="props.item.fullAiReport?.knowledge" class="border border-emerald-100 rounded-2xl p-5 bg-emerald-50/30 shadow-sm">
                <div class="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-3 flex items-center gap-2">🔗 Knowledge Link</div>
                <div class="space-y-3 text-sm text-slate-700">
                   <p v-if="props.item.fullAiReport.knowledge.background"><span class="font-bold text-emerald-700">Background:</span> {{ props.item.fullAiReport.knowledge.background }}</p>
                   <p v-if="props.item.fullAiReport.knowledge.expansion"><span class="font-bold text-emerald-700">Expansion:</span> {{ props.item.fullAiReport.knowledge.expansion }}</p>
                </div>
            </div>

          </div>
          
          <!-- Streaming Typing Placeholder (When Analysis is pending) -->
          <div v-else class="space-y-6">
             <!-- Generating Definition -->
             <div class="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm transition-all duration-500">
                 <div class="flex items-center gap-2 mb-3">
                    <div class="h-3 w-20 bg-slate-200 rounded animate-pulse"></div>
                 </div>
                 <div class="space-y-2">
                    <div class="h-5 w-3/4 bg-slate-200 rounded animate-pulse"></div>
                    <div class="h-4 w-1/2 bg-slate-100 rounded animate-pulse"></div>
                 </div>
             </div>

             <!-- Generating Synonyms -->
             <div class="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm transition-all duration-500 delay-150">
                 <div class="flex items-center gap-2 mb-3">
                    <div class="h-3 w-32 bg-slate-200 rounded animate-pulse"></div>
                 </div>
                 <div class="flex gap-2">
                    <div class="h-6 w-16 bg-slate-100 rounded animate-pulse"></div>
                    <div class="h-6 w-20 bg-slate-100 rounded animate-pulse"></div>
                    <div class="h-6 w-14 bg-slate-100 rounded animate-pulse"></div>
                 </div>
             </div>

             <!-- Generating Deep Analysis (Typing Effect) -->
             <div class="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm transition-all duration-500 delay-300">
                 <div class="flex items-center gap-2 mb-3">
                    <div class="h-3 w-24 bg-slate-200 rounded animate-pulse"></div>
                 </div>
                 <div class="space-y-2">
                    <div class="h-4 w-full bg-slate-100 rounded animate-pulse"></div>
                    <div class="h-4 w-5/6 bg-slate-100 rounded animate-pulse"></div>
                    <div class="flex items-center gap-1">
                       <div class="h-4 w-1/3 bg-slate-100 rounded animate-pulse"></div>
                       <!-- Typing Cursor -->
                       <div class="w-1.5 h-4 bg-indigo-500 animate-blink"></div>
                    </div>
                 </div>
             </div>
             
             <div class="flex items-center justify-center pt-4">
                <span class="text-xs font-mono text-indigo-400 animate-pulse">
                  AI is crafting your memory anchor...
                </span>
             </div>
          </div>
        </div>

        <!-- Right: User Interaction (Fixed width) -->
        <div class="w-[300px] bg-slate-50 p-6 flex flex-col border-l border-slate-100">
          
          <!-- Note Editor -->
          <div class="flex-1 flex flex-col min-h-0 mb-4">
            <label class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>📝 My Notes</span>
              <span v-if="isDirty" class="text-amber-500 text-[10px]">Unsaved changes</span>
            </label>
            <textarea 
              v-model="note"
              class="flex-1 w-full p-4 bg-white border border-slate-200 rounded-xl focus:border-slate-400 focus:ring-0 resize-none text-sm leading-relaxed shadow-sm transition-all"
              placeholder="Add your personal notes..."
            ></textarea>
          </div>

          <!-- Actions -->
          <div class="space-y-3">
             <button 
               @click="saveNote"
               class="w-full py-3 bg-slate-900 text-white rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
               :disabled="!isDirty"
               :class="!isDirty ? 'opacity-50 cursor-not-allowed' : ''"
             >
               <CheckCircleIcon class="w-5 h-5" />
               Save Note
             </button>
             
             <div v-if="props.item.sourceUrl" class="mt-4 text-center">
               <a :href="props.item.sourceUrl" target="_blank" class="text-xs text-slate-400 hover:text-slate-600 underline">View Source</a>
             </div>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s step-end infinite;
}
</style>

