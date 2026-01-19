<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { ref } from "vue";
import { useUiStore } from "../stores/ui";
import { useLibraryStore } from "../stores/library";
const ui = useUiStore();
const lib = useLibraryStore();
const mode = ref<"url" | "text" | "clipboard">("text");
const title = ref("");
const category = ref("Technology");
const url = ref("");
const text = ref("");
const isImporting = ref(false);

async function submit() {
  if (mode.value === "text") {
    const id = lib.importFromText(title.value || "Untitled", category.value, text.value.trim(), url.value || undefined);
    ui.closeImport();
    window.location.hash = `#/article/${id}`;
  } else if (mode.value === "url") {
    if (!url.value) return;
    isImporting.value = true;
    try {
      // 在 Tauri 环境中，如果配置了允许，可以直接 fetch。
      // 此处使用一个简单的 fetch，如果遇到 CORS 限制，会提示用户。
      const response = await fetch(url.value);
      const html = await response.text();
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      
      // 移除脚本和样式
      doc.querySelectorAll("script, style, nav, footer, header").forEach(el => el.remove());
      
      // 获取标题
      if (!title.value) {
        title.value = doc.querySelector("h1")?.textContent?.trim() || doc.title || "Imported Article";
      }
      
      // 提取正文段落
      const paragraphs = Array.from(doc.querySelectorAll("p"))
        .map(p => p.textContent?.trim())
        .filter(p => p && p.length > 50); // 过滤掉太短的段落
      
      const content = paragraphs.join("\n\n");
      
      if (!content) {
        throw new Error("Could not extract content from this URL. Please paste text manually.");
      }
      
      const id = lib.importFromText(title.value, category.value, content, url.value);
      ui.closeImport();
      window.location.hash = `#/article/${id}`;
    } catch (err: any) {
      console.error(err);
      alert("Import failed: " + (err.message || "Unknown error"));
    } finally {
      isImporting.value = false;
    }
  } else {
    isImporting.value = true;
    try {
      let clipText = "";
      try { clipText = await navigator.clipboard.readText(); } catch {}
      clipText = clipText.trim();
      if (!clipText) throw new Error("Clipboard is empty or unreadable.");
      const id = lib.importFromText(title.value || "Untitled", category.value, clipText, undefined);
      ui.closeImport();
      window.location.hash = `#/article/${id}`;
    } catch (err: any) {
      console.error(err);
      alert("Import failed: " + (err.message || "Unknown error"));
    } finally {
      isImporting.value = false;
    }
  }
}
</script>

<template>
  <Dialog :open="true" @close="ui.closeImport" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/20" aria-hidden="true"></div>
    <DialogPanel class="relative bg-white rounded-xl shadow-xl w-[520px] p-6">
      <DialogTitle class="text-lg font-semibold">Import Article</DialogTitle>
      <div class="mt-4 flex gap-2">
        <button class="px-3 h-9 rounded-lg" :class="mode==='text' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='text'">Text</button>
        <button class="px-3 h-9 rounded-lg" :class="mode==='url' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='url'">URL</button>
        <button class="px-3 h-9 rounded-lg" :class="mode==='clipboard' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='clipboard'">Clipboard</button>
      </div>
      <div class="mt-4 space-y-3">
        <input class="w-full h-10 rounded-lg border border-slate-300 px-3" placeholder="Title (Optional)" v-model="title" />
        <input class="w-full h-10 rounded-lg border border-slate-300 px-3" placeholder="Category" v-model="category" />
        <input v-if="mode==='url'" class="w-full h-10 rounded-lg border border-slate-300 px-3" placeholder="https://..." v-model="url" />
        <textarea v-if="mode==='text'" class="w-full h-40 rounded-lg border border-slate-300 px-3 py-2" placeholder="Paste article content..." v-model="text" />
        <div v-if="mode==='clipboard'" class="text-xs text-slate-500">切换到目标应用复制文本后点击 Import</div>
      </div>
      <div class="mt-4 flex justify-end gap-2">
        <button class="px-4 h-10 rounded-lg border border-slate-300" @click="ui.closeImport">Cancel</button>
        <button 
          class="px-4 h-10 rounded-lg bg-slate-900 text-white disabled:bg-slate-400" 
          @click="submit"
          :disabled="isImporting"
        >
          {{ isImporting ? 'Importing...' : 'Import' }}
        </button>
      </div>
      <button class="absolute top-3 right-3 text-slate-400" @click="ui.closeImport">✕</button>
    </DialogPanel>
  </Dialog>
</template>
