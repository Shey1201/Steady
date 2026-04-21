<script setup lang="ts">
import { useLibraryStore } from "../stores/library";
import { useUiStore } from "../stores/ui";
import { useRoute, useRouter } from "vue-router";
import { computed } from "vue";
import { BookOpenIcon, TrashIcon } from "@heroicons/vue/24/outline";

const lib = useLibraryStore();
const ui = useUiStore();
const route = useRoute();
const router = useRouter();

lib.addSample();

const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    allArticles: isZh ? '所有文章' : 'All Articles',
    words: isZh ? '词' : 'words',
    deleteConfirm: isZh ? '确定要删除这篇文章吗？' : 'Are you sure you want to delete this article?',
    deleteTitle: isZh ? '删除文章' : 'Delete Article',
  };
});

const articles = computed(() => {
  const cat = route.query.category as string | undefined;
  if (!cat || cat === "All") return lib.articles;
  return lib.articles.filter(a => a.category === cat);
});

function openArticle(id: string) {
  router.push({ name: "Article", params: { id } });
}

function deleteArticle(id: string) {
  if (confirm(t.value.deleteConfirm)) {
    lib.deleteArticle(id);
  }
}

function getWordCount(paragraphs: string[]) {
  return paragraphs.join(' ').split(/\s+/).filter(Boolean).length;
}
</script>

<template>
  <div class="max-w-7xl mx-auto">
    <h1 class="text-2xl font-black text-slate-900 mb-8">{{ t.allArticles }}</h1>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <div
        v-for="a in articles"
        :key="a.id"
        class="group text-left bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border border-slate-100 flex flex-col min-h-[240px] relative cursor-pointer"
        @click="openArticle(a.id)"
      >
        <!-- Delete Button -->
        <button 
          @click.stop="deleteArticle(a.id)" 
          class="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 z-10"
          :title="t.deleteTitle"
        >
          <TrashIcon class="w-5 h-5" />
        </button>

        <!-- Icon Box -->
        <div class="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center mb-6 shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
          <BookOpenIcon class="w-6 h-6 text-white" />
        </div>

        <!-- Content -->
        <h3 class="text-xl font-bold text-slate-900 leading-snug mb-auto group-hover:text-blue-600 transition-colors">
          {{ a.title }}
        </h3>

        <!-- Footer -->
        <div class="flex items-center justify-between mt-8">
          <time class="text-sm font-medium text-slate-400">
            {{ new Date(a.createdAt).toLocaleDateString() }}
          </time>
          <span class="px-3 py-1 rounded-lg bg-blue-50/50 text-[11px] font-bold text-blue-400/80 border border-blue-100/20 uppercase tracking-tight">
            {{ getWordCount(a.paragraphs) }} {{ t.words }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
