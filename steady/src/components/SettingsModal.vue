<script setup lang="ts">
import { Dialog, DialogPanel, DialogTitle } from "@headlessui/vue";
import { ref } from "vue";
import { useLibraryStore } from "../stores/library";
import { useCorpusStore } from "../stores/corpus";
import { useWritingStore } from "../stores/writing";
import { useUiStore } from "../stores/ui";
import { useUserStore } from "../stores/user";
const emit = defineEmits<{ (e: "close"): void }>();
const lib = useLibraryStore();
const corpus = useCorpusStore();
const writing = useWritingStore();
const ui = useUiStore();
const userStore = useUserStore();
const apiKey = ref<string>(localStorage.getItem("STEADY_GEMINI_API_KEY") || "");
function updateKey(v: string) {
  apiKey.value = v;
  try { localStorage.setItem("STEADY_GEMINI_API_KEY", v); } catch {}
}
function handleLogout() {
  userStore.logout();
  emit("close");
  window.location.hash = "#/login";
}
function clearAll() {
  const ok = confirm("确定要清空所有已保存的数据吗？该操作不可撤销。");
  if (!ok) return;
  lib.articles = [];
  corpus.clear();
  writing.drafts = [];
  try { localStorage.clear(); } catch {}
  ui.closeQuickLookup();
  emit("close");
  alert("已清空本地数据");
}

const wechatNotify = ref({
  dailyQuote: localStorage.getItem("STEADY_NOTIFY_DAILY") === "true",
  periodicReport: localStorage.getItem("STEADY_NOTIFY_REPORT") === "true",
  checkIn: localStorage.getItem("STEADY_NOTIFY_CHECKIN") === "true",
});

function toggleNotify(key: keyof typeof wechatNotify.value) {
  wechatNotify.value[key] = !wechatNotify.value[key];
  localStorage.setItem(`STEADY_NOTIFY_${key === 'dailyQuote' ? 'DAILY' : key === 'periodicReport' ? 'REPORT' : 'CHECKIN'}`, String(wechatNotify.value[key]));
}
</script>

<template>
  <Dialog :open="true" @close="emit('close')" class="fixed inset-0 z-50 flex items-center justify-center">
    <div class="fixed inset-0 bg-black/20" aria-hidden="true"></div>
    <DialogPanel class="relative bg-white rounded-xl shadow-xl w-[420px] p-6">
      <DialogTitle class="text-lg font-semibold">Settings</DialogTitle>
      <div class="mt-4 flex items-center gap-3">
        <div class="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold uppercase">
          {{ userStore.user?.email?.[0] || 'U' }}
        </div>
        <div>
          <div class="font-medium text-slate-900">{{ userStore.user?.name || 'User' }}</div>
          <div class="text-sm text-slate-500">{{ userStore.user?.email || 'not logged in' }}</div>
        </div>
      </div>
      <div class="mt-6">
        <div class="flex items-center justify-between mb-3">
          <div class="text-sm font-bold text-slate-900 flex items-center gap-2">
            <svg class="w-4 h-4 text-[#07C160] fill-current" viewBox="0 0 24 24">
              <path d="M8.69 14.3c-4.4 0-8-3.2-8-7.14 0-3.95 3.6-7.15 8-7.15 4.39 0 8 3.2 8 7.15 0 3.94-3.61 7.14-8 7.14zm0-11.4c-3.1 0-5.7 2.4-5.7 5.25s2.6 5.25 5.7 5.25c.6 0 1.2-.1 1.7-.2l2.3 1.3-.5-2c2-1.2 3.2-3.2 3.2-5.3 0-2.9-2.6-5.3-5.7-5.3zM18.8 12c-3.3 0-6 2.3-6 5.1 0 2.8 2.7 5.1 6 5.1.5 0 1-.1 1.4-.2l1.9 1-.4-1.7c1.7-1 2.7-2.6 2.7-4.2 0-2.8-2.7-5.1-6-5.1z"/>
            </svg>
            WeChat Integration
          </div>
          <button 
            v-if="!userStore.wechat.isBound"
            @click="userStore.bindWechat()"
            class="text-xs font-bold text-[#07C160] hover:text-[#06ad56]"
          >
            Bind Account
          </button>
          <button 
            v-else
            @click="userStore.unbindWechat()"
            class="text-xs font-bold text-slate-400 hover:text-red-500"
          >
            Unbind
          </button>
        </div>
        
        <div v-if="userStore.wechat.isBound" class="bg-slate-50 rounded-xl p-3 space-y-3 border border-slate-100">
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm text-slate-600">Daily Quote Push</span>
            <input type="checkbox" v-model="userStore.wechat.notifications.dailyQuote" class="rounded border-slate-300 text-[#07C160] focus:ring-[#07C160]" />
          </label>
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm text-slate-600">Weekly Report</span>
            <input type="checkbox" v-model="userStore.wechat.notifications.weeklyReport" class="rounded border-slate-300 text-[#07C160] focus:ring-[#07C160]" />
          </label>
          <label class="flex items-center justify-between cursor-pointer">
            <span class="text-sm text-slate-600">Check-in Reminder</span>
            <input type="checkbox" v-model="userStore.wechat.notifications.checkInReminder" class="rounded border-slate-300 text-[#07C160] focus:ring-[#07C160]" />
          </label>
        </div>
        <div v-else class="bg-slate-50 rounded-xl p-4 text-center border border-dashed border-slate-200">
          <p class="text-xs text-slate-400">Bind WeChat account to enable daily quotes and progress reports.</p>
        </div>
      </div>

      <div class="mt-6">
        <div class="border rounded-lg p-3 flex items-center justify-between">
          <div>
            <div class="text-sm text-slate-600">Steady</div>
            <div class="text-xs text-slate-400">Version 1.0 (Minimalist Edition)</div>
          </div>
          <span class="px-2 py-1 rounded bg-slate-900 text-white text-xs">FREE PLAN</span>
        </div>
      </div>
      <div class="mt-4 space-y-2">
        <div class="text-xs text-slate-500">Gemini API Key</div>
        <input
          class="w-full h-10 rounded-lg border border-slate-300 px-3"
          :value="apiKey"
          placeholder="sk-..."
          @input="(e:any) => updateKey(e.target.value)"
        />
        <div class="text-xs text-slate-400">若留空则使用构建时环境变量</div>
      </div>

      <div class="mt-6">
        <div class="text-sm font-bold text-slate-900 mb-3">WeChat Notifications</div>
        <div class="space-y-3">
          <div class="flex items-center justify-between border rounded-lg p-3 bg-slate-50 border-slate-100">
            <div class="text-sm text-slate-700 font-medium">Daily Quote Push</div>
            <button 
              class="w-10 h-6 rounded-full transition-colors relative shadow-inner"
              :class="wechatNotify.dailyQuote ? 'bg-[#07C160]' : 'bg-slate-300'"
              @click="toggleNotify('dailyQuote')"
            >
              <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm" :class="wechatNotify.dailyQuote ? 'translate-x-4' : ''"></div>
            </button>
          </div>
          <div class="flex items-center justify-between border rounded-lg p-3 bg-slate-50 border-slate-100">
            <div class="text-sm text-slate-700 font-medium">Learning Report</div>
            <button 
              class="w-10 h-6 rounded-full transition-colors relative shadow-inner"
              :class="wechatNotify.periodicReport ? 'bg-[#07C160]' : 'bg-slate-300'"
              @click="toggleNotify('periodicReport')"
            >
              <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm" :class="wechatNotify.periodicReport ? 'translate-x-4' : ''"></div>
            </button>
          </div>
          <div class="flex items-center justify-between border rounded-lg p-3 bg-slate-50 border-slate-100">
            <div class="text-sm text-slate-700 font-medium">Check-in Reminder</div>
            <button 
              class="w-10 h-6 rounded-full transition-colors relative shadow-inner"
              :class="wechatNotify.checkIn ? 'bg-[#07C160]' : 'bg-slate-300'"
              @click="toggleNotify('checkIn')"
            >
              <div class="absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm" :class="wechatNotify.checkIn ? 'translate-x-4' : ''"></div>
            </button>
          </div>
        </div>
      </div>

      <div class="mt-6 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="text-sm text-slate-600">启用剪贴板监听</div>
            <div class="text-xs text-slate-400">跨应用复制文本后自动弹出查阅</div>
          </div>
          <button class="px-3 h-9 rounded-lg" :class="ui.enableClipboardWatch ? 'bg-slate-900 text-white' : 'bg-slate-100'" @click="ui.enableClipboardWatch = !ui.enableClipboardWatch">
            {{ ui.enableClipboardWatch ? 'ON' : 'OFF' }}
          </button>
        </div>

        <div class="pt-4 space-y-3">
          <button class="w-full h-10 rounded-lg border border-red-300 text-red-600 font-medium hover:bg-red-50 transition-colors" @click="clearAll">Clear Saved Data</button>
          <button class="w-full h-10 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200" @click="handleLogout">Sign Out</button>
        </div>
      </div>
      <button class="absolute top-3 right-3 text-slate-400" @click="emit('close')">✕</button>
    </DialogPanel>
  </Dialog>
  </template>
