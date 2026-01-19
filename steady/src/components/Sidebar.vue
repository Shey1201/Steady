<script setup lang="ts">
import { useRoute, RouterLink } from "vue-router";
const route = useRoute();
</script>

<template>
  <aside class="w-64 border-r border-slate-200 bg-slate-50">
    <div class="p-6">
      <h1 class="text-2xl font-bold text-primary">Steady</h1>
      <p class="text-sm text-slate-500 mt-1">Minimalist Edition</p>
    </div>
    <nav class="px-3 space-y-1">
      <RouterLink
        to="/reading"
        class="block px-3 py-2 rounded-md transition ease-smooth"
        :class="route.path === '/reading' ? 'bg-accent text-white' : 'hover:bg-slate-200 text-primary'"
      >
        阅读模式
      </RouterLink>
      <RouterLink
        to="/corpus"
        class="block px-3 py-2 rounded-md transition ease-smooth"
        :class="route.path === '/corpus' ? 'bg-accent text-white' : 'hover:bg-slate-200 text-primary'"
      >
        语料总览
      </RouterLink>
    </nav>
  </aside>
</template>

<style scoped>
</style>

