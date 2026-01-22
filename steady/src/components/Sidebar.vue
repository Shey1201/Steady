<script setup lang="ts">
import { useRoute, RouterLink } from "vue-router";
import { useUiStore } from "../stores/ui";
import { computed } from "vue";

const route = useRoute();
const ui = useUiStore();

const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    reading: isZh ? '阅读模式' : 'Reading Mode',
    corpus: isZh ? '语料总览' : 'Corpus Overview',
    subtitle: isZh ? '极简版' : 'Minimalist Edition',
  };
});
</script>

<template>
  <aside class="w-64 border-r border-slate-200 bg-slate-50">
    <div class="p-6">
      <h1 class="text-2xl font-bold text-primary">Steady</h1>
      <p class="text-sm text-slate-500 mt-1">{{ t.subtitle }}</p>
    </div>
    <nav class="px-3 space-y-1">
      <RouterLink
        to="/reading"
        class="block px-3 py-2 rounded-md transition ease-smooth"
        :class="route.path === '/reading' ? 'bg-accent text-white' : 'hover:bg-slate-200 text-primary'"
      >
        {{ t.reading }}
      </RouterLink>
      <RouterLink
        to="/corpus"
        class="block px-3 py-2 rounded-md transition ease-smooth"
        :class="route.path === '/corpus' ? 'bg-accent text-white' : 'hover:bg-slate-200 text-primary'"
      >
        {{ t.corpus }}
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
</style>

