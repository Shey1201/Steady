<script setup lang="ts">
import { Dialog, DialogPanel, TransitionRoot, TransitionChild } from "@headlessui/vue";
import { ref, computed } from "vue";
import { useLibraryStore } from "../stores/library";
import { useCorpusStore } from "../stores/corpus";
import { useWritingStore } from "../stores/writing";
import { useUiStore } from "../stores/ui";
import { useUserStore } from "../stores/user";
import { 
  UserIcon,
  AdjustmentsHorizontalIcon,
  BellIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  CircleStackIcon,
  CheckCircleIcon
} from "@heroicons/vue/24/outline";

const emit = defineEmits<{ (e: "close"): void }>();
const lib = useLibraryStore();
const corpus = useCorpusStore();
const writing = useWritingStore();
const ui = useUiStore();
const userStore = useUserStore();

// Localization
const t = computed(() => {
  const isZh = ui.language === 'zh';
  return {
    // Sidebar
    settings: isZh ? '设置' : 'Settings',
    account: isZh ? '账户' : 'Account',
    general: isZh ? '通用' : 'General',
    notify: isZh ? '通知' : 'Notifications',
    storage: isZh ? '存储与数据' : 'Storage & Data',
    about: isZh ? '关于' : 'About',
    signOut: isZh ? '退出登录' : 'Sign Out',
    
    // Account
    freePlan: isZh ? '免费版' : 'Free Plan',
    accountStatus: isZh ? '账户状态' : 'Account Status',
    bound: isZh ? '已绑定' : 'BOUND',
    unbound: isZh ? '未绑定' : 'UNBOUND',
    bindHint: isZh ? '绑定微信账号以启用每日金句、学习报告和打卡提醒。' : 'Bind your WeChat account to enable Daily Quotes, Learning Reports, and Check-in Reminders.',
    bindBtn: isZh ? '绑定微信' : 'Bind WeChat Account',
    unbindBtn: isZh ? '解绑账号' : 'Unbind Account',
    
    // General
    aiTitle: isZh ? 'AI 配置' : 'AI Configuration',
    aiHint: isZh ? '配置 AI 模型（OpenAI 兼容）' : 'Configure AI Model (OpenAI Compatible)',
    expand: isZh ? '展开' : 'Expand',
    collapse: isZh ? '收起' : 'Collapse',
    geminiKey: isZh ? 'API Key' : 'API Key',
    geminiHint: isZh ? '留空以使用内置默认 Key' : 'Leave empty to use the built-in default key.',
    envKeyActive: isZh ? '内置 Key 已激活' : 'Built-in Key Active',
    baseUrlHint: isZh ? '例如: https://api.openai.com/v1 (留空则使用 Gemini 默认)' : 'e.g. https://api.openai.com/v1 (Leave empty for Gemini default)',
    clipboard: isZh ? '剪贴板监听' : 'Clipboard Monitor',
    clipboardHint: isZh ? '自动检测其他应用复制的文本' : 'Auto-detect copied text from other apps',
    language: isZh ? '语言' : 'Language',
    languageHint: isZh ? '设置界面和翻译语言' : 'Display language for interface and translation',
    
    // Notifications
    dailyQuote: isZh ? '每日金句' : 'Daily Quote',
    dailyQuoteHint: isZh ? '每天早上推送励志金句' : 'Push a motivational quote every morning',
    learningReport: isZh ? '学习报告' : 'Learning Report',
    learningReportHint: isZh ? '每周阅读进度总结' : 'Weekly summary of your reading progress',
    checkIn: isZh ? '打卡提醒' : 'Check-in Reminder',
    checkInHint: isZh ? '每日提醒保持连胜' : 'Daily reminder to keep your streak',
    bindNotifyHint: isZh ? '请在账户标签页绑定微信以启用通知。' : 'Please bind your WeChat account in the Account tab to enable notifications.',
    
    // Storage
    clearData: isZh ? '清除数据' : 'Clear Data',
    localOnly: isZh ? '仅本地' : 'Local Only',
    clearHint: isZh ? '永久删除所有文章、历史记录和设置。此操作无法撤销。' : 'Permanently delete all articles, history, and settings. This action cannot be undone.',
    clearBtn: isZh ? '清除所有数据' : 'Clear All Data',
    confirmText: isZh ? '确定吗？这将清除所有内容并重置应用。' : 'Are you absolutely sure? This will wipe everything and reset the app.',
    confirmBtn: isZh ? '是的，删除所有' : 'Yes, Delete Everything',
    cancel: isZh ? '取消' : 'Cancel',
    clearSuccess: isZh ? '所有数据已清除。应用将重置。' : 'All data has been cleared. The app will now reset.',
    
    // About
    slogan: isZh ? '极简阅读与学习' : 'Minimalist Reading & Learning',
    rights: isZh ? '© 2024 Steady App. 保留所有权利。' : '© 2024 Steady App. All rights reserved.',
  };
});

// Navigation State
const activeTab = ref("account");

const navigation = computed(() => [
  { id: 'account', name: t.value.account, icon: UserIcon },
  { id: 'general', name: t.value.general, icon: AdjustmentsHorizontalIcon },
  { id: 'notify', name: t.value.notify, icon: BellIcon },
  { id: 'storage', name: t.value.storage, icon: CircleStackIcon },
  { id: 'about', name: t.value.about, icon: InformationCircleIcon },
]);

import { ChevronDownIcon } from "@heroicons/vue/24/outline";

// AI Configuration State (Now managed by Backend)
const showAiConfig = ref(false);

// Data Management State
const confirmClear = ref(false);

function clearAllData() {
  lib.articles = [];
  corpus.clear();
  writing.drafts = [];
  try { localStorage.clear(); } catch {}
  ui.closeQuickLookup();
  userStore.unbindWechat();
  userStore.logout();
  alert(t.value.clearSuccess);
  window.location.reload();
}

// WeChat Notifications Helper
const wechatNotify = computed(() => userStore.wechat.notifications);

function toggleWechatNotify(key: keyof typeof userStore.wechat.notifications) {
  userStore.wechat.notifications[key] = !userStore.wechat.notifications[key];
}

function handleLogout() {
  userStore.logout();
  emit("close");
  window.location.hash = "#/login";
}
</script>

<template>
  <TransitionRoot appear :show="true" as="template">
    <Dialog as="div" @close="emit('close')" class="relative z-[70]">
      <TransitionChild
        as="template"
        enter="duration-300 ease-out"
        enter-from="opacity-0"
        enter-to="opacity-100"
        leave="duration-200 ease-in"
        leave-from="opacity-100"
        leave-to="opacity-0"
      >
        <div class="fixed inset-0 bg-black/25" />
      </TransitionChild>

      <div class="fixed inset-0 overflow-y-auto">
        <div class="flex min-h-full items-center justify-center p-4 text-center">
          <TransitionChild
            as="template"
            enter="duration-300 ease-out"
            enter-from="opacity-0 scale-95"
            enter-to="opacity-100 scale-100"
            leave="duration-200 ease-in"
            leave-from="opacity-100 scale-100"
            leave-to="opacity-0 scale-95"
          >
            <DialogPanel class="w-full max-w-3xl transform overflow-hidden rounded-xl bg-slate-50 text-left align-middle shadow-xl transition-all flex h-[550px]">
              
              <!-- Sidebar -->
              <div class="w-48 bg-slate-100 border-r border-slate-200 flex flex-col">
                <div class="p-6 pb-4">
                  <h2 class="text-lg font-bold text-slate-800">{{ t.settings }}</h2>
                </div>
                <nav class="flex-1 px-3 space-y-1">
                  <button
                    v-for="item in navigation"
                    :key="item.id"
                    @click="activeTab = item.id"
                    class="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                    :class="activeTab === item.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:bg-slate-200/50 hover:text-slate-900'"
                  >
                    <component :is="item.icon" class="w-5 h-5" />
                    {{ item.name }}
                  </button>
                </nav>
                <div class="p-4 border-t border-slate-200">
                  <button @click="handleLogout" class="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors">
                    <ArrowRightOnRectangleIcon class="w-4 h-4" />
                    {{ t.signOut }}
                  </button>
                </div>
              </div>

              <!-- Content Area -->
              <div class="flex-1 bg-[#F5F5F5] flex flex-col relative">
                <!-- Close Button -->
                <button @click="emit('close')" class="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors z-10">
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                <div class="flex-1 overflow-y-auto p-8">
                  
                  <!-- Account Tab -->
                  <div v-if="activeTab === 'account'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">{{ t.account }}</h3>
                    
                    <!-- User Info Card (Image 2 Style) -->
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div class="flex items-start justify-between">
                        <div class="flex gap-4">
                          <div class="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                            {{ userStore.user?.email?.[0]?.toUpperCase() || 'U' }}
                          </div>
                          <div>
                            <div class="flex items-center gap-2">
                              <h4 class="font-bold text-slate-900 text-lg">{{ userStore.user?.name || 'User' }}</h4>
                              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold tracking-wide uppercase border border-slate-200">{{ t.freePlan }}</span>
                            </div>
                            <p class="text-sm text-slate-500 mt-0.5">{{ userStore.user?.email || 'user@example.com' }}</p>
                          </div>
                        </div>
                      </div>

                      <div class="mt-6 pt-6 border-t border-slate-100">
                        <div class="flex items-center justify-between mb-3">
                          <span class="text-sm font-medium text-slate-600">{{ t.accountStatus }}</span>
                          <span class="text-xs font-bold px-2 py-0.5 rounded" :class="userStore.wechat.isBound ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                            {{ userStore.wechat.isBound ? t.bound : t.unbound }}
                          </span>
                        </div>
                        
                        <div v-if="!userStore.wechat.isBound" class="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 mb-4 leading-relaxed">
                          {{ t.bindHint }}
                        </div>

                        <button 
                          v-if="!userStore.wechat.isBound"
                          @click="userStore.bindWechat()"
                          class="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold shadow-sm shadow-emerald-100"
                        >
                          {{ t.bindBtn }}
                        </button>
                        <button 
                          v-else
                          @click="userStore.unbindWechat()"
                          class="w-full py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                          {{ t.unbindBtn }}
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- General Tab -->
                  <div v-if="activeTab === 'general'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">{{ t.general }}</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      <!-- AI Configuration -->
                      <div class="p-5">
                        <div class="flex items-center justify-between cursor-pointer" @click="showAiConfig = !showAiConfig">
                          <div class="flex items-center gap-3">
                            <div>
                              <div class="flex items-center gap-2">
                                <label class="block text-sm font-bold text-slate-900 cursor-pointer">{{ t.aiTitle }}</label>
                                <div class="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-bold rounded border border-green-200">
                                  <CheckCircleIcon class="w-3 h-3" />
                                  {{ t.envKeyActive }}
                                </div>
                              </div>
                              <p class="text-xs text-slate-500 mt-0.5">{{ t.aiHint }}</p>
                            </div>
                          </div>
                          <button 
                            class="p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                          >
                            <ChevronDownIcon 
                              class="w-5 h-5 transition-transform duration-300"
                              :class="showAiConfig ? 'rotate-180' : ''"
                            />
                          </button>
                        </div>

                        <div 
                          class="space-y-4 max-w-md overflow-hidden transition-all duration-300 ease-in-out"
                          :class="showAiConfig ? 'max-h-[500px] opacity-100 pt-4' : 'max-h-0 opacity-0'"
                        >
                          <div class="p-4 bg-slate-50 rounded-lg text-xs text-slate-500">
                             AI configuration is now managed by the server administrator.
                          </div>
                        </div>
                      </div>

                      <!-- Clipboard -->
                      <div class="p-6 flex items-center justify-between">
                        <div>
                          <div class="text-sm font-bold text-slate-900">{{ t.clipboard }}</div>
                          <div class="text-xs text-slate-500 mt-1">{{ t.clipboardHint }}</div>
                        </div>
                        <button 
                          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                          :class="ui.enableClipboardWatch ? 'bg-purple-600' : 'bg-slate-200'"
                          @click="ui.enableClipboardWatch = !ui.enableClipboardWatch"
                        >
                          <span
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out"
                            :class="ui.enableClipboardWatch ? 'translate-x-6' : 'translate-x-1'"
                          />
                        </button>
                      </div>

                      <!-- Language -->
                      <div class="p-6 flex items-center justify-between">
                        <div>
                          <div class="text-sm font-bold text-slate-900">{{ t.language }}</div>
                          <div class="text-xs text-slate-500 mt-1">{{ t.languageHint }}</div>
                        </div>
                        <div class="flex items-center bg-slate-100 rounded-lg p-1">
                          <button 
                            @click="ui.setLanguage('en')"
                            class="px-3 py-1.5 text-xs font-bold rounded-md transition-all"
                            :class="ui.language === 'en' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                          >
                            English
                          </button>
                          <button 
                            @click="ui.setLanguage('zh')"
                            class="px-3 py-1.5 text-xs font-bold rounded-md transition-all"
                            :class="ui.language === 'zh' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'"
                          >
                            中文
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Notifications Tab -->
                  <div v-if="activeTab === 'notify'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">{{ t.notify }}</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      
                      <!-- Daily Quote -->
                      <div class="p-6 flex items-center justify-between">
                        <div>
                          <div class="text-sm font-bold text-slate-900">{{ t.dailyQuote }}</div>
                          <div class="text-xs text-slate-500 mt-1">{{ t.dailyQuoteHint }}</div>
                        </div>
                        <button 
                          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                          :class="wechatNotify.dailyQuote ? 'bg-amber-500' : 'bg-slate-200'"
                          @click="toggleWechatNotify('dailyQuote')"
                          :disabled="!userStore.wechat.isBound"
                        >
                          <span
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out"
                            :class="wechatNotify.dailyQuote ? 'translate-x-6' : 'translate-x-1'"
                          />
                        </button>
                      </div>

                      <!-- Learning Report -->
                      <div class="p-6 flex items-center justify-between">
                        <div>
                          <div class="text-sm font-bold text-slate-900">{{ t.learningReport }}</div>
                          <div class="text-xs text-slate-500 mt-1">{{ t.learningReportHint }}</div>
                        </div>
                        <button 
                          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                          :class="wechatNotify.weeklyReport ? 'bg-amber-500' : 'bg-slate-200'"
                          @click="toggleWechatNotify('weeklyReport')"
                          :disabled="!userStore.wechat.isBound"
                        >
                          <span
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out"
                            :class="wechatNotify.weeklyReport ? 'translate-x-6' : 'translate-x-1'"
                          />
                        </button>
                      </div>

                      <!-- Check-in -->
                      <div class="p-6 flex items-center justify-between">
                        <div>
                          <div class="text-sm font-bold text-slate-900">{{ t.checkIn }}</div>
                          <div class="text-xs text-slate-500 mt-1">{{ t.checkInHint }}</div>
                        </div>
                        <button 
                          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                          :class="wechatNotify.checkInReminder ? 'bg-amber-500' : 'bg-slate-200'"
                          @click="toggleWechatNotify('checkInReminder')"
                          :disabled="!userStore.wechat.isBound"
                        >
                          <span
                            class="inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out"
                            :class="wechatNotify.checkInReminder ? 'translate-x-6' : 'translate-x-1'"
                          />
                        </button>
                      </div>
                    </div>

                    <div v-if="!userStore.wechat.isBound" class="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-100">
                      <InformationCircleIcon class="w-4 h-4" />
                      {{ t.bindNotifyHint }}
                    </div>
                  </div>

                  <!-- Storage & Data Tab -->
                  <div v-if="activeTab === 'storage'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">{{ t.storage }}</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-slate-900">{{ t.clearData }}</h4>
                        <span class="text-xs text-slate-400">{{ t.localOnly }}</span>
                      </div>
                      
                      <div v-if="!confirmClear">
                        <p class="text-sm text-slate-500 mb-4">
                          {{ t.clearHint }}
                        </p>
                        <button 
                          @click="confirmClear = true"
                          class="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm font-medium"
                        >
                          {{ t.clearBtn }}
                        </button>
                      </div>

                      <div v-else class="bg-red-50 rounded-lg p-4 border border-red-100">
                         <div class="flex items-start gap-3 mb-3">
                            <ShieldCheckIcon class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div class="text-sm text-red-800 font-medium">
                              {{ t.confirmText }}
                            </div>
                         </div>
                         <div class="flex gap-3">
                           <button 
                            @click="clearAllData"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold shadow-sm"
                           >
                             {{ t.confirmBtn }}
                           </button>
                           <button 
                            @click="confirmClear = false"
                            class="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium"
                           >
                             {{ t.cancel }}
                           </button>
                         </div>
                      </div>
                    </div>
                  </div>

                  <!-- About Tab -->
                  <div v-if="activeTab === 'about'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">{{ t.about }}</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                      <div class="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-slate-200">
                        S
                      </div>
                      <h4 class="text-lg font-bold text-slate-900">Steady</h4>
                      <p class="text-sm text-slate-500 mb-6">{{ t.slogan }}</p>
                      
                      <div class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                        <span>Version 1.0.0</span>
                        <span class="w-1 h-1 rounded-full bg-slate-400"></span>
                        <span>Beta</span>
                      </div>

                      <div class="mt-8 pt-8 border-t border-slate-100 text-xs text-slate-400">
                        {{ t.rights }}
                      </div>
                    </div>
                  </div>

                </div>
              </div>

            </DialogPanel>
          </TransitionChild>
        </div>
      </div>
    </Dialog>
  </TransitionRoot>
</template>
