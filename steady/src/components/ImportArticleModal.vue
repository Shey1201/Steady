<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton } from "@headlessui/vue";
import { CheckIcon, ChevronUpDownIcon, Cog6ToothIcon, PencilIcon, TrashIcon, XMarkIcon } from "@heroicons/vue/20/solid";
import { ref, computed } from "vue";
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
const showManager = ref(false);
const newCategoryName = ref("");
const newCategoryDesc = ref("");

// Localization
const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    importTitle: isZh ? '导入文章' : 'Import Article',
    pasteText: isZh ? '粘贴文本' : 'Paste Text',
    fromUrl: isZh ? '从 URL' : 'From URL',
    clipboard: isZh ? '剪贴板' : 'Clipboard',
    articleTitle: isZh ? '文章标题' : 'Article Title',
    category: isZh ? '分类' : 'Category',
    manageCategories: isZh ? '管理分类' : 'Manage Categories',
    content: isZh ? '正文内容' : 'Content',
    url: isZh ? '文章链接' : 'Article URL',
    importBtn: isZh ? '开始导入' : 'Import Article',
    importing: isZh ? '导入中...' : 'Importing...',
    cancel: isZh ? '取消' : 'Cancel',
    processing: isZh ? '处理中...' : 'Processing...',
    placeholderTitle: isZh ? '输入标题...' : 'Enter title...',
    placeholderContent: isZh ? '在此粘贴文章内容...' : 'Paste article content here...',
    placeholderUrl: isZh ? 'https://example.com/article' : 'https://example.com/article',
    wordCount: isZh ? '字数' : 'Words',
    limitWarning: isZh ? '超过 5000 字' : 'Exceeds 5000 words',
    categoryName: isZh ? '分类名称' : 'Category Name',
    categoryDesc: isZh ? '描述（可选）' : 'Description (Optional)',
    addCategory: isZh ? '添加分类' : 'Add Category',
    edit: isZh ? '编辑' : 'Edit',
    delete: isZh ? '删除' : 'Delete',
    confirmDelete: isZh ? '确认删除？' : 'Confirm Delete?',
    noCategories: isZh ? '未找到分类' : 'No categories found',
    selectCategory: isZh ? '选择分类' : 'Select Category',
    recent: isZh ? '最近使用' : 'Recent',
    otherCategories: isZh ? '其他分类' : 'Other Categories',
    clipboardHint: isZh ? '切换到目标应用复制文本后点击开始导入' : 'Switch to target app, copy text, then click Import',
    searchCategories: isZh ? '搜索分类...' : 'Search categories...',
    close: isZh ? '关闭' : 'Close',
    add: isZh ? '添加' : 'Add',
    confirm: isZh ? '确认' : 'Confirm',
    cancelEdit: isZh ? '取消' : 'Cancel',
    save: isZh ? '保存' : 'Save',
    create: isZh ? '创建' : 'Create',
    rename: isZh ? '重命名' : 'Rename',
    deleteCategory: isZh ? '删除分类' : 'Delete Category',
    categoryExists: isZh ? '分类已存在' : 'Category already exists',
    categoryInUse: isZh ? '分类正在使用中' : 'Category in use',
  };
});

const allCategories = computed(() => lib.categories.filter(c => c.name !== "All"));

const recentCategories = computed(() => {
  return [...allCategories.value]
    .filter(c => c.lastUsed > 0)
    .sort((a, b) => b.lastUsed - a.lastUsed)
    .slice(0, 5);
});

const otherCategories = computed(() => {
  const recents = new Set(recentCategories.value.map(c => c.name));
  return allCategories.value.filter(c => !recents.has(c.name));
});

const query = ref("");
const filteredCategories = computed(() => {
  if (query.value === "") {
    return []; // We handle empty query explicitly in template
  }
  return allCategories.value.filter((cat) =>
    cat.name.toLowerCase().includes(query.value.toLowerCase())
  );
});

const managerQuery = ref("");
const filteredManagerCategories = computed(() => {
    if (!managerQuery.value) return allCategories.value;
    return allCategories.value.filter(c => c.name.toLowerCase().includes(managerQuery.value.toLowerCase()));
});

const editingCategoryName = ref<string | null>(null);
const deletingCategoryName = ref<string | null>(null);
const errorCategoryName = ref<string | null>(null);
const editingName = ref("");
const editInput = ref<HTMLInputElement | null>(null);

function createNewCategory() {
  if (newCategoryName.value.trim()) {
    if (lib.categories.some(c => c.name.toLowerCase() === newCategoryName.value.trim().toLowerCase())) {
        alert(t.value.categoryExists);
        return;
    }
    lib.createCategory(newCategoryName.value.trim(), newCategoryDesc.value.trim());
    newCategoryName.value = "";
    newCategoryDesc.value = "";
  }
}

function promptDelete(name: string) {
  if (lib.articles.some(a => a.category === name)) {
      errorCategoryName.value = name;
      setTimeout(() => errorCategoryName.value = null, 2000);
      return;
  }
  deletingCategoryName.value = name;
}

function confirmDelete() {
  if (deletingCategoryName.value) {
    lib.deleteCategory(deletingCategoryName.value);
    deletingCategoryName.value = null;
  }
}

function cancelDelete() {
  deletingCategoryName.value = null;
}

function startEditing(cat: { name: string }) {
    editingCategoryName.value = cat.name;
    editingName.value = cat.name;
    deletingCategoryName.value = null;
    // Focus next tick
    setTimeout(() => {
        if (editInput.value) editInput.value.focus();
        // Since it's in a v-for, ref might be an array or we need to handle it.
        // Actually, with Composition API and v-for, ref="editInput" will be an array if used inside v-for.
        // But since only one is editing at a time, we can just use :ref="(el) => { if(el) el.focus() }"
    }, 50);
}

function saveEdit() {
    if (!editingCategoryName.value) return;
    const oldName = editingCategoryName.value;
    const newName = editingName.value.trim();
    
    if (newName && newName !== oldName) {
         if (!lib.renameCategory(oldName, newName)) {
             alert(t.value.categoryExists);
             // Don't close edit mode so user can fix it? Or just alert and keep editing?
             // For now, let's keep editing mode.
             return; 
         }
    }
    editingCategoryName.value = null;
    editingName.value = "";
}

function cancelEdit() {
    editingCategoryName.value = null;
    editingName.value = "";
}

function selectCategoryInManager(name: string) {
  if (editingCategoryName.value) return; // Don't select if editing
  category.value = name;
  showManager.value = false;
}

const wordCount = computed(() => {
  if (!text.value) return 0;
  // Simple word count by splitting by whitespace
  return text.value.trim().split(/\s+/).length;
});

async function submit() {
  if (mode.value === "text") {
    if (wordCount.value > 5000) {
      alert(`${t.value.limitWarning} (current: ${wordCount.value}).`);
      return;
    }
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
  <Dialog :open="true" @close="!showManager && ui.closeImport()" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/20" aria-hidden="true"></div>
    <DialogPanel class="relative bg-white rounded-xl shadow-xl w-[640px] p-6">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
           <DialogTitle class="text-lg font-semibold">{{ t.importTitle }}</DialogTitle>
           <button 
             @click="showManager = true"
             class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
             :title="t.manageCategories"
           >
             <Cog6ToothIcon class="w-5 h-5" />
           </button>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="ui.closeImport"
            class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            :title="t.close"
          >
            <span class="text-lg font-bold leading-none">✕</span>
          </button>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button class="px-3 h-9 rounded-lg" :class="mode==='text' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='text'">{{ t.pasteText }}</button>
        <button class="px-3 h-9 rounded-lg" :class="mode==='url' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='url'">{{ t.fromUrl }}</button>
        <button class="px-3 h-9 rounded-lg" :class="mode==='clipboard' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='clipboard'">{{ t.clipboard }}</button>
      </div>
      <div class="mt-4 space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ t.articleTitle }}</label>
          <input class="w-full h-10 rounded-lg border border-slate-300 px-3" :placeholder="t.placeholderTitle" v-model="title" />
        </div>
        
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-slate-700">{{ t.category }}</label>
        </div>

        <!-- Select Existing Category Combobox -->
        <div class="relative">
           <div class="flex gap-2">
              <Combobox v-model="category" nullable class="flex-grow">
                <div class="relative">
                  <div
                    class="relative w-full cursor-default overflow-hidden rounded-lg border border-slate-300 bg-white text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 focus-visible:ring-offset-2 focus-visible:ring-offset-teal-300 sm:text-sm"
                  >
                    <ComboboxInput
                      class="w-full h-10 border-none py-2 pl-3 pr-10 text-sm leading-5 text-gray-900 focus:ring-0"
                      :displayValue="(cat) => (cat as string)"
                      @change="query = $event.target.value"
                      :placeholder="t.selectCategory"
                    />
                    <ComboboxButton
                      class="absolute inset-y-0 right-0 flex items-center pr-2"
                    >
                      <ChevronUpDownIcon
                        class="h-5 w-5 text-gray-400"
                        aria-hidden="true"
                      />
                    </ComboboxButton>
                  </div>
                  <ComboboxOptions
                    class="absolute mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black/5 focus:outline-none sm:text-sm z-50"
                  >
                    <!-- Search Results -->
                    <template v-if="query !== ''">
                      <ComboboxOption
                        v-for="cat in filteredCategories"
                        :key="cat.name"
                        :value="cat.name"
                        as="template"
                        v-slot="{ selected, active }"
                      >
                        <li
                          class="relative cursor-default select-none py-2 pl-3 pr-9"
                          :class="{
                            'bg-slate-100 text-slate-900': active,
                            'text-gray-900': !active,
                          }"
                        >
                          <div class="flex items-center">
                            <span
                              class="block truncate"
                              :class="{ 'font-medium': selected, 'font-normal': !selected }"
                            >
                              {{ cat.name }}
                            </span>
                          </div>
                          <span
                            v-if="selected"
                            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-900"
                          >
                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                          </span>
                        </li>
                      </ComboboxOption>
                      
                      <div v-if="filteredCategories.length === 0" class="px-4 py-2 text-sm text-slate-500">
                        {{ t.noCategories }}
                      </div>
                    </template>

                    <!-- Default View: Recents + All -->
                    <template v-else>
                      <!-- Recents -->
                      <div v-if="recentCategories.length > 0" class="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0 z-10">{{ t.recent }}</div>
                      <ComboboxOption
                        v-for="cat in recentCategories"
                        :key="cat.name"
                        :value="cat.name"
                        as="template"
                        v-slot="{ selected, active }"
                      >
                        <li
                          class="relative cursor-default select-none py-2 pl-3 pr-9"
                          :class="{
                            'bg-slate-100 text-slate-900': active,
                            'text-gray-900': !active,
                          }"
                        >
                          <div class="flex items-center">
                            <span
                              class="block truncate"
                              :class="{ 'font-medium': selected, 'font-normal': !selected }"
                            >
                              {{ cat.name }}
                            </span>
                          </div>
                          <span
                            v-if="selected"
                            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-900"
                          >
                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                          </span>
                        </li>
                      </ComboboxOption>

                      <!-- All Categories -->
                      <div class="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 mt-1 sticky top-0 z-10">{{ t.otherCategories }}</div>
                      <ComboboxOption
                        v-for="cat in otherCategories"
                        :key="cat.name"
                        :value="cat.name"
                        as="template"
                        v-slot="{ selected, active }"
                      >
                        <li
                          class="relative cursor-default select-none py-2 pl-3 pr-9"
                          :class="{
                            'bg-slate-100 text-slate-900': active,
                            'text-gray-900': !active,
                          }"
                        >
                          <div class="flex items-center">
                            <span
                              class="block truncate"
                              :class="{ 'font-medium': selected, 'font-normal': !selected }"
                            >
                              {{ cat.name }}
                            </span>
                          </div>
                          <span
                            v-if="selected"
                            class="absolute inset-y-0 right-0 flex items-center pr-4 text-slate-900"
                          >
                            <CheckIcon class="h-5 w-5" aria-hidden="true" />
                          </span>
                        </li>
                      </ComboboxOption>
                    </template>
                  </ComboboxOptions>
                </div>
              </Combobox>
              
              <button 
                @click="showManager = true"
                class="px-3 h-10 border border-slate-300 rounded-lg text-slate-600 hover:bg-slate-50"
                :title="t.manageCategories"
              >
                <Cog6ToothIcon class="w-5 h-5" />
              </button>
           </div>
        </div>

        <!-- Mode Content -->
        <div v-if="mode === 'text'">
          <label class="block text-sm font-medium text-slate-700 mb-1">
             {{ t.content }}
             <span class="text-xs font-normal text-slate-500 ml-1">
               {{ wordCount }} {{ t.wordCount }} <span v-if="wordCount > 5000" class="text-red-500">({{ t.limitWarning }})</span>
             </span>
          </label>
          <textarea 
            v-model="text" 
            class="w-full h-48 rounded-lg border border-slate-300 p-3 text-sm font-mono" 
            :placeholder="t.placeholderContent"
          ></textarea>
        </div>

        <div v-if="mode === 'url'">
          <label class="block text-sm font-medium text-slate-700 mb-1">{{ t.url }}</label>
          <input 
            v-model="url" 
            class="w-full h-10 rounded-lg border border-slate-300 px-3 text-blue-600 font-mono text-sm" 
            :placeholder="t.placeholderUrl"
          />
          <p class="mt-2 text-xs text-slate-500">
            * Note: Some websites may block automated access.
          </p>
        </div>

        <div v-if="mode === 'clipboard'" class="flex flex-col items-center justify-center py-8 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50">
          <div class="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
            <span class="text-xl">📋</span>
          </div>
          <p class="font-medium text-slate-900">{{ t.clipboard }}</p>
          <p class="text-xs text-slate-500 mt-1 max-w-[200px] text-center">{{ t.clipboardHint }}</p>
        </div>

      </div>

      <div class="mt-6 flex justify-end gap-3">
        <button 
          @click="ui.closeImport"
          class="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
        >
          {{ t.cancel }}
        </button>
        <button 
          @click="submit"
          :disabled="isImporting || !title || (mode==='text' && !text) || (mode==='url' && !url)"
          class="px-6 py-2 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <span v-if="isImporting" class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
          {{ isImporting ? t.processing : t.importBtn }}
        </button>
      </div>

      <!-- Category Manager Overlay -->
      <div v-if="showManager" class="absolute inset-0 bg-white z-10 flex flex-col">
        <div class="flex items-center justify-between p-4 border-b border-slate-100">
          <h3 class="font-bold text-lg">{{ t.manageCategories }}</h3>
          <button @click="showManager = false" class="p-1 hover:bg-slate-100 rounded-full">
            <XMarkIcon class="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <div class="p-4 border-b border-slate-100 bg-slate-50">
          <div class="flex gap-2 mb-2">
            <input 
              v-model="newCategoryName" 
              class="flex-1 h-9 rounded-lg border border-slate-300 px-3 text-sm" 
              :placeholder="t.categoryName"
              @keyup.enter="createNewCategory"
            />
            <button 
              @click="createNewCategory"
              :disabled="!newCategoryName"
              class="px-3 bg-blue-600 text-white rounded-lg text-sm font-bold disabled:opacity-50"
            >
              {{ t.add }}
            </button>
          </div>
          <input 
            v-model="newCategoryDesc" 
            class="w-full h-9 rounded-lg border border-slate-300 px-3 text-sm" 
            :placeholder="t.categoryDesc"
          />
        </div>

        <div class="flex-1 overflow-y-auto p-2 space-y-1">
          <div class="px-2 mb-2">
             <input 
               v-model="managerQuery" 
               class="w-full h-8 rounded-lg border border-slate-200 px-3 text-xs bg-slate-50" 
               :placeholder="t.searchCategories" 
             />
          </div>

          <div 
            v-for="cat in filteredManagerCategories" 
            :key="cat.name"
            class="group flex items-center justify-between p-2 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100"
          >
            <div class="flex-1 min-w-0 mr-2">
              <div v-if="editingCategoryName === cat.name" class="flex gap-1">
                  <input 
                    ref="editInput"
                    v-model="editingName" 
                    class="flex-1 h-7 rounded border border-blue-300 px-2 text-sm"
                    @keyup.enter="saveEdit"
                    @keyup.esc="cancelEdit"
                    @blur="saveEdit" 
                  />
              </div>
              <div v-else class="flex flex-col cursor-pointer" @click="selectCategoryInManager(cat.name)">
                <span class="font-medium text-sm truncate" :class="{'text-blue-600': category === cat.name}">{{ cat.name }}</span>
                <span class="text-xs text-slate-400 truncate" v-if="cat.description">{{ cat.description }}</span>
              </div>
            </div>
            
            <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
               <template v-if="editingCategoryName !== cat.name">
                  <button @click="startEditing(cat)" class="p-1 text-slate-400 hover:text-blue-600" :title="t.rename">
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <div class="relative">
                    <button @click="promptDelete(cat.name)" class="p-1 text-slate-400 hover:text-red-600" :title="t.delete">
                        <TrashIcon class="w-4 h-4" />
                    </button>
                    <!-- Delete Confirmation Popover -->
                    <div v-if="deletingCategoryName === cat.name" class="absolute right-0 top-full mt-1 bg-white shadow-xl border border-red-100 rounded-lg p-3 z-20 w-48">
                        <p class="text-xs font-bold text-red-600 mb-2">{{ t.confirmDelete }}</p>
                        <div class="flex gap-2 justify-end">
                            <button @click="cancelDelete" class="text-xs text-slate-500 hover:underline">{{ t.cancel }}</button>
                            <button @click="confirmDelete" class="px-2 py-1 bg-red-600 text-white text-xs rounded font-bold">{{ t.confirm }}</button>
                        </div>
                    </div>
                    <!-- Error Tooltip -->
                    <div v-if="errorCategoryName === cat.name" class="absolute right-0 top-full mt-1 bg-red-600 text-white text-xs rounded px-2 py-1 z-20 whitespace-nowrap">
                        {{ t.categoryInUse }}
                    </div>
                  </div>
               </template>
            </div>
          </div>
        </div>
      </div>
    </DialogPanel>
  </Dialog>
</template>