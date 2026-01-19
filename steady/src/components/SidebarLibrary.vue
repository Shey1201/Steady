<script setup lang="ts">
import { useLibraryStore } from "../stores/library";
import { useUiStore } from "../stores/ui";
import { computed } from "vue";
import { FolderIcon, ArrowUpTrayIcon } from "@heroicons/vue/24/outline";

const lib = useLibraryStore();
const ui = useUiStore();
lib.addSample();
const cats = computed(() => lib.categories);
</script>

<template>
  <aside class="w-64 border-r border-slate-200 bg-white flex flex-col h-screen shrink-0">
    <div class="px-6 py-8">
      <div class="flex items-center gap-2 text-slate-900 font-bold text-lg mb-6">
        <FolderIcon class="w-5 h-5" />
        <span>Library</span>
      </div>
      
      <div class="space-y-2">
        <router-link
          v-for="c in cats"
          :key="c.name"
          class="flex items-center justify-between px-4 py-2 rounded-xl transition-all group"
          :class="[
            $route.query.category === c.name || ($route.query.category === undefined && c.name === 'All')
              ? 'bg-slate-100'
              : 'hover:bg-slate-50'
          ]"
          :to="c.name === 'All' ? '/reading' : { path: '/reading', query: { category: c.name } }"
        >
          <span class="text-slate-600 group-hover:text-slate-900 transition-colors" :class="{ 'text-slate-900 font-bold': $route.query.category === c.name || ($route.query.category === undefined && c.name === 'All') }">{{ c.name }}</span>
          <span class="text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md text-[10px] font-bold group-hover:bg-slate-100 transition-colors">{{ c.count }}</span>
        </router-link>
      </div>
    </div>

    <div class="mt-auto p-6">
      <button 
        class="w-full h-11 rounded-xl bg-slate-900 text-white font-semibold flex items-center justify-center gap-2 shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all active:scale-[0.98]" 
        @click="ui.openImport()"
      >
        <ArrowUpTrayIcon class="w-4 h-4" />
        <span>Import Article</span>
      </button>
    </div>
  </aside>
</template>
