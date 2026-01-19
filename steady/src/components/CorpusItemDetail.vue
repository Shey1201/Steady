<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import type { CorpusItem } from "../stores/corpus";
const props = defineProps<{ item: CorpusItem }>();
const emit = defineEmits<{ (e: "close"): void, (e: "start", payload: { type: string, text: string }): void }>();

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text);
  // Optional: Add a toast notification here if available
}

function createCloze() {
  emit('start', { type: 'sentence', text: props.item.text });
}
</script>

<template>
  <Dialog :open="true" @close="emit('close')" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/20" aria-hidden="true"></div>
    <DialogPanel class="relative bg-white rounded-xl shadow-xl w-[560px] p-6 max-h-[90vh] overflow-y-auto">
      <DialogTitle class="text-lg font-semibold flex items-center justify-between">
        <span>Item Detail</span>
        <button class="text-slate-400 hover:text-slate-600" @click="emit('close')">✕</button>
      </DialogTitle>
      
      <div class="mt-4">
        <div class="text-xs text-slate-500">{{ props.item.type.toUpperCase() }} · {{ new Date(props.item.createdAt).toLocaleDateString() }}</div>
        <div class="mt-2 text-xl font-bold text-slate-900 leading-tight">{{ props.item.text }}</div>
        <div v-if="props.item.translation" class="mt-2 text-slate-700 italic">"{{ props.item.translation }}"</div>
        
        <!-- Action Shortcuts -->
        <div class="mt-4 flex flex-wrap gap-2">
          <button 
            @click="copyToClipboard(props.item.text)"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <span>Copy Text</span>
          </button>
          <button 
            v-if="props.item.type === 'sentence' || props.item.text.length > 20"
            @click="createCloze"
            class="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 hover:bg-slate-50 flex items-center gap-1.5"
          >
            <span>Create Cloze</span>
          </button>
        </div>

        <div v-if="props.item.note" class="mt-4 p-3 bg-slate-50 rounded-lg text-sm text-slate-600">
          <span class="font-semibold block mb-1">Note:</span>
          {{ props.item.note }}
        </div>
        
        <div v-if="props.item.sourceUrl" class="mt-2 text-xs text-slate-400">
          Source: <a :href="props.item.sourceUrl" target="_blank" class="underline hover:text-slate-600">{{ props.item.sourceUrl }}</a>
        </div>
        
        <div v-if="props.item.context" class="mt-4">
          <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Context</span>
          <div class="mt-1 text-sm text-slate-600 whitespace-pre-line leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100 italic">
            {{ props.item.context }}
          </div>
        </div>
      </div>

      <div class="mt-6 space-y-4" v-if="props.item.analysis">
        <div class="grid grid-cols-2 gap-4">
          <div class="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Collocations</span>
            </div>
            <div class="flex flex-wrap gap-2">
              <div v-for="c in props.item.analysis?.collocations || []" :key="c" 
                class="group relative flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-slate-200 text-sm text-slate-700">
                <span>{{ c }}</span>
                <button @click="copyToClipboard(c)" class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-slate-900">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <div class="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Nuance</div>
            <div class="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{{ props.item.analysis?.nuance }}</div>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4">
          <div class="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Grammar</div>
            <div class="text-sm text-slate-700 whitespace-pre-line leading-relaxed">{{ props.item.analysis?.grammar }}</div>
          </div>
          <div class="border border-slate-100 rounded-xl p-4 bg-slate-50/50">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Logic Template</div>
            <div class="text-sm text-slate-700 whitespace-pre-line leading-relaxed font-mono text-xs bg-white p-2 rounded border border-slate-100">
              {{ props.item.analysis?.logicTemplate }}
            </div>
          </div>
        </div>
      </div>

      <div class="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button class="px-6 h-11 rounded-xl border border-slate-200 font-medium text-slate-600 hover:bg-slate-50 transition-colors" @click="emit('close')">Close</button>
        <button class="px-6 h-11 rounded-xl bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                @click="emit('start', { type: props.item.type, text: props.item.text })">
          Review
        </button>
      </div>
    </DialogPanel>
  </Dialog>
</template>

