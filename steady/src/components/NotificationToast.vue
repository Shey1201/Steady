<script setup lang="ts">
import { useUiStore } from "../stores/ui";
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  InformationCircleIcon, 
  ExclamationTriangleIcon,
  XMarkIcon 
} from "@heroicons/vue/24/solid";

const ui = useUiStore();

const icons = {
  success: CheckCircleIcon,
  error: XCircleIcon,
  info: InformationCircleIcon,
  warning: ExclamationTriangleIcon,
};

const colors = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
  info: "bg-blue-50 text-blue-800 border-blue-200",
  warning: "bg-amber-50 text-amber-800 border-amber-200",
};

const iconColors = {
  success: "text-green-500",
  error: "text-red-500",
  info: "text-blue-500",
  warning: "text-amber-500",
};
</script>

<template>
  <div class="fixed top-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 w-full max-w-md pointer-events-none px-4">
    <TransitionGroup 
      enter-active-class="transition ease-out duration-300"
      enter-from-class="transform -translate-y-4 opacity-0 scale-95"
      enter-to-class="transform translate-y-0 opacity-100 scale-100"
      leave-active-class="transition ease-in duration-200"
      leave-from-class="transform translate-y-0 opacity-100 scale-100"
      leave-to-class="transform -translate-y-4 opacity-0 scale-95"
    >
      <div 
        v-for="notification in ui.notifications" 
        :key="notification.id"
        class="pointer-events-auto flex items-start p-4 rounded-xl shadow-lg border backdrop-blur-sm bg-white/95"
      >
        <component 
          :is="icons[notification.type]" 
          class="w-6 h-6 flex-shrink-0 mr-3"
          :class="iconColors[notification.type]"
        />
        <div class="flex-1 pt-0.5">
          <p class="text-sm font-medium text-slate-900">{{ notification.message }}</p>
        </div>
        <button 
          @click="ui.removeNotification(notification.id)"
          class="ml-3 flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <XMarkIcon class="w-5 h-5" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>
