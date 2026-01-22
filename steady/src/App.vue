<script setup lang="ts">
import IconRail from "./components/IconRail.vue";
import SidebarLibrary from "./components/SidebarLibrary.vue";
import SettingsModal from "./components/SettingsModal.vue";
import ImportArticleModal from "./components/ImportArticleModal.vue";
import QuickLookup from "./components/QuickLookup.vue";
import AnalysisPanel from "./components/AnalysisPanel.vue";
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useUiStore } from "./stores/ui";
import { useRoute } from "vue-router";
import { startClipboardWatch, stopClipboardWatch } from "./services/clipboard";
const showSettings = ref(false);
const ui = useUiStore();
const route = useRoute();
const showLibrary = computed(() => route.name === "Reading");
const isArticlePage = computed(() => route.name === "Article");
const isLoginPage = computed(() => route.name === "Login");

const quickLookupWrapper = ref<HTMLElement | null>(null);

const handleKeydown = (e: KeyboardEvent) => {
  if (e.altKey && (e.key === 'q' || e.key === 'Q')) {
    e.preventDefault();
    ui.toggleQuickLookup();
  }
};

const handleGlobalMouseUp = (event: MouseEvent) => {
  if (!ui.showQuickLookup) return;

  const target = event.target as HTMLElement;
  const isInside = quickLookupWrapper.value?.contains(target);
  const isToggle = target.closest('.quick-lookup-toggle');

  if (isInside) {
    // Clicked inside QuickLookup, do nothing (allow interaction)
    return;
  }

  if (isToggle) {
    // Clicked toggle button, let the button handler manage it
    return;
  }

  // Check for text selection
  const selection = window.getSelection()?.toString().trim();
  if (selection && selection.length > 0) {
    // If text is selected outside, update QuickLookup
    ui.setQuickText(selection);
  }
};

onMounted(() => {
  ui.closeQuickLookup(); // Ensure it starts closed
  if (ui.enableClipboardWatch) startClipboardWatch();
  document.addEventListener('mouseup', handleGlobalMouseUp);
  window.addEventListener('keydown', handleKeydown);
});
onBeforeUnmount(() => {
  stopClipboardWatch();
  document.removeEventListener('mouseup', handleGlobalMouseUp);
  window.removeEventListener('keydown', handleKeydown);
});
watch(() => ui.enableClipboardWatch, (v) => {
  if (v) startClipboardWatch();
  else stopClipboardWatch();
});
</script>

<template>
  <div class="flex h-screen overflow-hidden bg-slate-50 text-primary">
    <IconRail v-if="!isLoginPage" @open-settings="showSettings = true" />
    <SidebarLibrary v-if="showLibrary && !isLoginPage" />
    <div :class="['flex-1 overflow-auto h-full', isArticlePage ? 'p-0 bg-white' : 'p-8']">
      <router-view />
    </div>
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
    <ImportArticleModal v-if="ui.showImportModal" />
    <div v-if="ui.showQuickLookup && !isLoginPage" ref="quickLookupWrapper" class="fixed right-6 top-24 z-40 w-[360px]">
      <QuickLookup :pinned="true" :text="ui.quickText" />
    </div>
    <AnalysisPanel />
  </div>
</template>

<style scoped>
</style>
