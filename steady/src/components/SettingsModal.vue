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
  EyeIcon, 
  EyeSlashIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  CircleStackIcon
} from "@heroicons/vue/24/outline";

const emit = defineEmits<{ (e: "close"): void }>();
const lib = useLibraryStore();
const corpus = useCorpusStore();
const writing = useWritingStore();
const ui = useUiStore();
const userStore = useUserStore();

// Navigation State
const activeTab = ref("account");

const navigation = [
  { id: 'account', name: 'Account', icon: UserIcon },
  { id: 'general', name: 'General', icon: AdjustmentsHorizontalIcon },
  { id: 'notify', name: 'Notifications', icon: BellIcon },
  { id: 'storage', name: 'Storage & Data', icon: CircleStackIcon },
  { id: 'about', name: 'About', icon: InformationCircleIcon },
];

// Gemini API Key State
const apiKey = ref<string>(localStorage.getItem("STEADY_GEMINI_API_KEY") || "");
const showApiKey = ref(false);

function updateKey(v: string) {
  apiKey.value = v;
  try { 
    if (v) {
      localStorage.setItem("STEADY_GEMINI_API_KEY", v); 
    } else {
      localStorage.removeItem("STEADY_GEMINI_API_KEY");
    }
  } catch {}
}

// Data Management State
const confirmClear = ref(false);

function clearAllData() {
  lib.articles = [];
  corpus.clear();
  writing.drafts = [];
  try { localStorage.clear(); } catch {}
  ui.closeQuickLookup();
  apiKey.value = "";
  userStore.unbindWechat();
  userStore.logout();
  alert("All data has been cleared. The app will now reset.");
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
                  <h2 class="text-lg font-bold text-slate-800">Settings</h2>
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
                    Sign Out
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
                    <h3 class="text-xl font-bold text-slate-800 mb-4">Account</h3>
                    
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
                              <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px] font-bold tracking-wide uppercase border border-slate-200">Free Plan</span>
                            </div>
                            <p class="text-sm text-slate-500 mt-0.5">{{ userStore.user?.email || 'user@example.com' }}</p>
                          </div>
                        </div>
                      </div>

                      <div class="mt-6 pt-6 border-t border-slate-100">
                        <div class="flex items-center justify-between mb-3">
                          <span class="text-sm font-medium text-slate-600">Account Status</span>
                          <span class="text-xs font-bold px-2 py-0.5 rounded" :class="userStore.wechat.isBound ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'">
                            {{ userStore.wechat.isBound ? 'BOUND' : 'UNBOUND' }}
                          </span>
                        </div>
                        
                        <div v-if="!userStore.wechat.isBound" class="bg-slate-50 rounded-lg p-3 text-xs text-slate-500 mb-4 leading-relaxed">
                          Bind your WeChat account to enable Daily Quotes, Learning Reports, and Check-in Reminders.
                        </div>

                        <button 
                          v-if="!userStore.wechat.isBound"
                          @click="userStore.bindWechat()"
                          class="w-full py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors text-sm font-bold shadow-sm shadow-emerald-100"
                        >
                          Bind WeChat Account
                        </button>
                        <button 
                          v-else
                          @click="userStore.unbindWechat()"
                          class="w-full py-2.5 border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors text-sm font-medium"
                        >
                          Unbind Account
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- General Tab -->
                  <div v-if="activeTab === 'general'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">General Settings</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      <!-- Gemini Key -->
                      <div class="p-6">
                        <div class="mb-3">
                          <label class="block text-sm font-bold text-slate-900 mb-1">Gemini API Key</label>
                          <p class="text-xs text-slate-500">Leave empty to use the built-in default key.</p>
                        </div>
                        <div class="relative max-w-md">
                          <input
                            :type="showApiKey ? 'text' : 'password'"
                            class="w-full h-10 rounded-lg border border-slate-300 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            :value="apiKey"
                            placeholder="sk-..."
                            @input="(e:any) => updateKey(e.target.value)"
                          />
                          <button 
                            @click="showApiKey = !showApiKey"
                            class="absolute inset-y-0 right-0 px-3 text-slate-400 hover:text-slate-600"
                          >
                            <EyeIcon v-if="!showApiKey" class="w-4 h-4" />
                            <EyeSlashIcon v-else class="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <!-- Clipboard -->
                      <div class="p-6 flex items-center justify-between">
                        <div>
                          <div class="text-sm font-bold text-slate-900">Clipboard Monitor</div>
                          <div class="text-xs text-slate-500 mt-1">Auto-detect copied text from other apps</div>
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
                    </div>
                  </div>

                  <!-- Notifications Tab -->
                  <div v-if="activeTab === 'notify'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">Notifications</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      
                      <!-- Daily Quote -->
                      <div class="p-6 flex items-center justify-between">
                        <div>
                          <div class="text-sm font-bold text-slate-900">Daily Quote</div>
                          <div class="text-xs text-slate-500 mt-1">Push a motivational quote every morning</div>
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
                          <div class="text-sm font-bold text-slate-900">Learning Report</div>
                          <div class="text-xs text-slate-500 mt-1">Weekly summary of your reading progress</div>
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
                          <div class="text-sm font-bold text-slate-900">Check-in Reminder</div>
                          <div class="text-xs text-slate-500 mt-1">Daily reminder to keep your streak</div>
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
                      Please bind your WeChat account in the Account tab to enable notifications.
                    </div>
                  </div>

                  <!-- Storage & Data Tab -->
                  <div v-if="activeTab === 'storage'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">Storage & Data</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                      <div class="flex items-center justify-between mb-4">
                        <h4 class="font-bold text-slate-900">Clear Data</h4>
                        <span class="text-xs text-slate-400">Local Only</span>
                      </div>
                      
                      <div v-if="!confirmClear">
                        <p class="text-sm text-slate-500 mb-4">
                          Permanently delete all articles, history, and settings. This action cannot be undone.
                        </p>
                        <button 
                          @click="confirmClear = true"
                          class="px-4 py-2 bg-slate-100 text-slate-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors text-sm font-medium"
                        >
                          Clear All Data
                        </button>
                      </div>

                      <div v-else class="bg-red-50 rounded-lg p-4 border border-red-100">
                         <div class="flex items-start gap-3 mb-3">
                            <ShieldCheckIcon class="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div class="text-sm text-red-800 font-medium">
                              Are you absolutely sure? This will wipe everything and reset the app.
                            </div>
                         </div>
                         <div class="flex gap-3">
                           <button 
                            @click="clearAllData"
                            class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-bold shadow-sm"
                           >
                             Yes, Delete Everything
                           </button>
                           <button 
                            @click="confirmClear = false"
                            class="px-4 py-2 bg-white text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50 text-sm font-medium"
                           >
                             Cancel
                           </button>
                         </div>
                      </div>
                    </div>
                  </div>

                  <!-- About Tab -->
                  <div v-if="activeTab === 'about'" class="space-y-6">
                    <h3 class="text-xl font-bold text-slate-800 mb-4">About</h3>
                    
                    <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
                      <div class="w-16 h-16 bg-slate-900 rounded-2xl mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4 shadow-lg shadow-slate-200">
                        S
                      </div>
                      <h4 class="text-lg font-bold text-slate-900">Steady</h4>
                      <p class="text-sm text-slate-500 mb-6">Minimalist Reading & Learning</p>
                      
                      <div class="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-medium text-slate-600">
                        <span>Version 1.0.0</span>
                        <span class="w-1 h-1 rounded-full bg-slate-400"></span>
                        <span>Beta</span>
                      </div>

                      <div class="mt-8 pt-8 border-t border-slate-100 text-xs text-slate-400">
                        © 2024 Steady App. All rights reserved.
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
