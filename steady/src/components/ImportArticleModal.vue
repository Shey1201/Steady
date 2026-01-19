<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle, Combobox, ComboboxInput, ComboboxOptions, ComboboxOption, ComboboxButton, TransitionRoot, TransitionChild } from "@headlessui/vue";
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
const managerSearchInput = ref<HTMLInputElement | null>(null);

function createNewCategory() {
  if (newCategoryName.value.trim()) {
    if (lib.categories.some(c => c.name.toLowerCase() === newCategoryName.value.trim().toLowerCase())) {
        alert("Category already exists.");
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
             alert("Category name already exists.");
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
      alert(`Content exceeds 5000 words (current: ${wordCount.value}). Please shorten it.`);
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
           <DialogTitle class="text-lg font-semibold">Import Article</DialogTitle>
           <button 
             @click="showManager = true"
             class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
             title="Manage Categories"
           >
             <Cog6ToothIcon class="w-5 h-5" />
           </button>
        </div>
        <div class="flex items-center gap-2">
          <button 
            @click="ui.closeImport"
            class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            title="Close"
          >
            <span class="text-lg font-bold leading-none">✕</span>
          </button>
        </div>
      </div>
      <div class="mt-4 flex gap-2">
        <button class="px-3 h-9 rounded-lg" :class="mode==='text' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='text'">Text</button>
        <button class="px-3 h-9 rounded-lg" :class="mode==='url' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='url'">URL</button>
        <button class="px-3 h-9 rounded-lg" :class="mode==='clipboard' ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="mode='clipboard'">Clipboard</button>
      </div>
      <div class="mt-4 space-y-3">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Title</label>
          <input class="w-full h-10 rounded-lg border border-slate-300 px-3" placeholder="Article Title" v-model="title" />
        </div>
        
        <div class="flex items-center justify-between">
          <label class="text-sm font-medium text-slate-700">Category</label>
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
                      placeholder="Select Category"
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
                        No categories found.
                      </div>
                    </template>

                    <!-- Default View: Recents + All -->
                    <template v-else>
                      <!-- Recents -->
                      <div v-if="recentCategories.length > 0" class="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 sticky top-0 z-10">Recent</div>
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
                      <div class="px-3 py-1.5 text-xs font-semibold text-slate-500 bg-slate-50 mt-1 sticky top-0 z-10">Other Categories</div>
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
           </div>
        </div>

        <input v-if="mode==='url'" class="w-full h-10 rounded-lg border border-slate-300 px-3" placeholder="https://..." v-model="url" />
        <textarea v-if="mode==='text'" class="w-full h-40 rounded-lg border border-slate-300 px-3 py-2" placeholder="Paste article content..." v-model="text" />
        <div v-if="mode==='text'" class="text-right text-xs" :class="wordCount > 5000 ? 'text-red-500 font-bold' : 'text-slate-400'">
          {{ wordCount }} / 5000 words
        </div>
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
      <button class="absolute top-3 right-3 text-slate-400" @click="ui.closeImport" v-if="false">✕</button>
    </DialogPanel>

  <!-- Category Manager Dialog -->
  <TransitionRoot appear :show="showManager" as="template">
    <Dialog as="div" @close="showManager = false" class="fixed inset-0 z-[60]" :initialFocus="managerSearchInput">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/30" aria-hidden="true" />
      </TransitionChild>

      <div class="fixed inset-0 flex items-center justify-center p-4">
        <TransitionChild
          as="template"
          enter="duration-300 ease-out"
          enter-from="opacity-0 scale-95"
          enter-to="opacity-100 scale-100"
          leave="duration-200 ease-in"
          leave-from="opacity-100 scale-100"
          leave-to="opacity-0 scale-95"
        >
          <DialogPanel class="w-full max-w-md rounded-xl bg-white shadow-2xl relative max-h-[80vh] flex flex-col overflow-hidden">
            <!-- Header -->
            <div class="p-6 pb-2 flex-shrink-0">
                <button 
                  @click="showManager = false"
                  class="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Close"
                >
                  <span class="text-lg font-bold leading-none">✕</span>
                </button>
                <DialogTitle class="text-lg font-semibold mb-4">Manage Categories</DialogTitle>
                
                <!-- Search Bar -->
                <div class="relative">
                    <input 
                        ref="managerSearchInput"
                        v-model="managerQuery"
                        class="w-full h-9 rounded border border-slate-300 pl-8 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                        placeholder="Search categories..."
                    />
                    <div class="absolute inset-y-0 left-0 flex items-center pl-2.5 pointer-events-none">
                        <!-- Simple search icon (glass) -->
                        <svg class="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>
            </div>
            
            <!-- List View -->
            <div class="flex-grow overflow-auto min-h-0 px-6 py-2">
                <div class="space-y-0 divide-y divide-slate-100 border-t border-b border-slate-100">
                    <div 
                        v-for="cat in filteredManagerCategories" 
                        :key="cat.name" 
                        class="flex items-center justify-between p-3 -mx-3 hover:bg-slate-50 transition-colors group rounded-lg cursor-pointer"
                        :style="{ backgroundColor: category === cat.name ? '#e8f4fd' : '' }"
                        @click="selectCategoryInManager(cat.name)"
                    >
                        <div class="flex items-center gap-3 overflow-hidden flex-grow">
                            <!-- Removed color icon as requested -->
                            <div class="flex flex-col min-w-0 flex-grow">
                                <input 
                                    v-if="editingCategoryName === cat.name"
                                    v-model="editingName"
                                    @keydown.enter="saveEdit"
                                    @keydown.esc="cancelEdit"
                                    @click.stop
                                    class="w-full h-7 rounded border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                                    :ref="(el) => { if (el) (el as HTMLInputElement).focus() }"
                                />
                                <span v-else class="font-medium truncate" :class="category === cat.name ? 'text-blue-700 font-bold' : 'text-slate-900'">{{ cat.name }}</span>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div class="flex items-center gap-1 transition-opacity" :class="{'opacity-100': editingCategoryName === cat.name || deletingCategoryName === cat.name || errorCategoryName === cat.name, 'opacity-0 group-hover:opacity-100': editingCategoryName !== cat.name && deletingCategoryName !== cat.name && errorCategoryName !== cat.name}">
                            
                            <!-- Error State -->
                            <template v-if="errorCategoryName === cat.name">
                                <span class="text-xs text-red-500 font-bold whitespace-nowrap mr-2">Has articles!</span>
                            </template>

                            <!-- Editing State -->
                            <template v-else-if="editingCategoryName === cat.name">
                                <button @click.stop="saveEdit" class="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors" title="Save">
                                    <CheckIcon class="w-4 h-4" />
                                </button>
                                <button @click.stop="cancelEdit" class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Cancel">
                                    <XMarkIcon class="w-4 h-4" />
                                </button>
                            </template>

                            <!-- Deleting State -->
                            <template v-else-if="deletingCategoryName === cat.name">
                                <span class="text-xs text-red-500 font-medium mr-1">Sure?</span>
                                <button @click.stop="confirmDelete" class="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors" title="Confirm Delete">
                                    <CheckIcon class="w-4 h-4" />
                                </button>
                                <button @click.stop="cancelDelete" class="p-1.5 text-slate-400 hover:bg-slate-100 rounded transition-colors" title="Cancel">
                                    <XMarkIcon class="w-4 h-4" />
                                </button>
                            </template>

                            <!-- Normal State -->
                            <template v-else>
                                <button @click.stop="startEditing(cat)" class="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded transition-colors" title="Edit">
                                    <PencilIcon class="w-4 h-4" />
                                </button>
                                <button @click.stop="promptDelete(cat.name)" class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Delete">
                                    <TrashIcon class="w-4 h-4" />
                                </button>
                            </template>
                        </div>
                    </div>
                    <div v-if="filteredManagerCategories.length === 0" class="text-center py-8 text-slate-500 text-sm">
                        {{ managerQuery ? 'No matching categories.' : 'No categories found.' }}
                    </div>
                </div>
            </div>

            <!-- Add Footer -->
            <div class="p-6 pt-4 bg-white flex-shrink-0 z-10">
                <div class="flex gap-2">
                    <input 
                      v-model="newCategoryName" 
                      class="flex-grow h-10 rounded-lg border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900"
                      placeholder="New Category Name"
                      @keydown.enter="createNewCategory"
                    />
                    <button 
                        @click="createNewCategory" 
                        class="px-4 h-10 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors font-medium text-sm flex-shrink-0"
                    >
                        Add
                    </button>
                </div>
            </div>
          </DialogPanel>
        </TransitionChild>
      </div>
    </Dialog>
  </TransitionRoot>
  </Dialog>
</template>
