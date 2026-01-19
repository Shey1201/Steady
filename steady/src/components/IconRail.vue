<script setup lang="ts">
import { 
  BookOpenIcon, 
  ListBulletIcon, 
  Squares2X2Icon, 
  Cog6ToothIcon, 
  BeakerIcon 
} from "@heroicons/vue/24/outline";
import { useUiStore } from "../stores/ui";
const ui = useUiStore();
const emit = defineEmits<{ (e: "open-settings"): void }>();
</script>

<template>
  <div class="w-16 border-r border-slate-200 bg-white flex flex-col items-center py-4 h-screen shrink-0">
    <!-- Logo -->
    <div class="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center font-black text-xl mb-8">L</div>
    
    <!-- Top Navigation -->
    <div class="flex flex-col gap-4 w-full items-center">
      <router-link to="/corpus" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors" active-class="bg-slate-100 shadow-sm">
        <ListBulletIcon class="w-6 h-6 text-slate-700" />
      </router-link>
      <router-link to="/reading" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors" active-class="bg-slate-100 shadow-sm">
        <BookOpenIcon class="w-6 h-6 text-slate-700" />
      </router-link>
      <router-link to="/review" class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors relative" active-class="bg-slate-100 shadow-sm">
        <Squares2X2Icon class="w-6 h-6 text-slate-700" />
        <div class="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
      </router-link>
    </div>

    <!-- Bottom Navigation -->
    <div class="mt-auto flex flex-col gap-4 w-full items-center">
      <button class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors" @click="ui.toggleQuickLookup()">
        <BeakerIcon class="w-6 h-6 text-slate-700" />
      </button>
      <button class="w-10 h-10 rounded-lg flex items-center justify-center hover:bg-slate-100 transition-colors" @click="emit('open-settings')">
        <Cog6ToothIcon class="w-6 h-6 text-slate-700" />
      </button>
    </div>
  </div>
</template>
