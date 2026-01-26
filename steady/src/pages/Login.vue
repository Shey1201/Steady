<script setup lang="ts">
import { ref } from "vue";
import { useUserStore } from "../stores/user";
import { useRouter } from "vue-router";

const email = ref("");
const password = ref("");
const name = ref("");
const isRegister = ref(false);
const userStore = useUserStore();
const router = useRouter();
const isLoading = ref(false);
const errorMsg = ref("");

async function handleSubmit() {
  if (!email.value || !password.value) return;
  if (isRegister.value && !name.value) return;
  
  isLoading.value = true;
  errorMsg.value = "";
  
  try {
    if (isRegister.value) {
      await userStore.register(email.value, password.value, name.value);
    } else {
      await userStore.login(email.value, password.value);
    }
    router.push("/");
  } catch (error: any) {
    console.error(error);
    errorMsg.value = error.message || (isRegister.value ? "Registration failed" : "Login failed");
  } finally {
    isLoading.value = false;
  }
}

async function handleWeChatLogin() {
  isLoading.value = true;
  await new Promise((resolve) => setTimeout(resolve, 800));
  alert("WeChat Login is a demo feature.");
  isLoading.value = false;
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-6">
    <div class="max-w-md w-full bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-10 border border-slate-100">
      <div class="flex flex-col items-center mb-10">
        <div class="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-3xl mb-4 shadow-lg shadow-slate-200">
          S
        </div>
        <h1 class="text-2xl font-black text-slate-900">{{ isRegister ? 'Create Account' : 'Welcome to Steady' }}</h1>
        <p class="text-slate-500 mt-2 text-center">Minimalist language learning & reading companion</p>
      </div>

      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div v-if="errorMsg" class="p-3 bg-red-50 text-red-600 text-sm rounded-lg text-center">
          {{ errorMsg }}
        </div>
        
        <div v-if="isRegister">
          <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Name</label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="Your Name"
            class="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
          />
        </div>

        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Email Address</label>
          <input
            v-model="email"
            type="email"
            required
            placeholder="name@example.com"
            class="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
          />
        </div>
        <div>
          <label class="block text-sm font-bold text-slate-700 mb-2 ml-1">Password</label>
          <input
            v-model="password"
            type="password"
            required
            placeholder="••••••••"
            class="w-full h-12 rounded-xl border border-slate-200 px-4 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all"
          />
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full h-12 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all active:scale-[0.98] shadow-lg shadow-slate-200 disabled:bg-slate-400"
        >
          {{ isLoading ? (isRegister ? "Creating..." : "Signing in...") : (isRegister ? "Create Account" : "Sign In") }}
        </button>

        <div class="relative flex items-center justify-center my-2">
          <div class="absolute inset-0 flex items-center">
            <div class="w-full border-t border-slate-100"></div>
          </div>
          <span class="relative bg-white px-4 text-xs text-slate-400 font-medium">Or continue with</span>
        </div>

        <button
          type="button"
          @click="handleWeChatLogin"
          :disabled="isLoading"
          class="w-full h-12 rounded-xl bg-[#07C160] text-white font-bold hover:bg-[#06ad56] transition-all active:scale-[0.98] shadow-lg shadow-green-100 flex items-center justify-center gap-2"
        >
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8.696 15.848c0-.28-.14-.544-.384-.712a4.4 4.4 0 0 1-1.632-3.144c0-2.68 2.504-4.864 5.6-4.864 3.096 0 5.6 2.184 5.6 4.864 0 2.68-2.504 4.864-5.6 4.864-1.128 0-2.16-.288-3.04-.792a.6.6 0 0 0-.576.024l-1.408.816.368-1.568a.5.5 0 0 0-.168-.536 3.9 3.9 0 0 1-.864-2.512c0-2.4 2.144-4.352 4.8-4.352s4.8 1.952 4.8 4.352c0 2.4-2.144 4.352-4.8 4.352-1.008 0-1.936-.28-2.688-.752l-.96.56.248-1.072a.5.5 0 0 0-.144-.456ZM2.664 12.288c0 1.944 1.728 3.52 3.864 3.52.816 0 1.568-.224 2.184-.608.064-.04.144-.056.216-.04l1.24.28-.296-.864a.5.5 0 0 1 .056-.472 4.8 4.8 0 0 0 1.08-2.928c0-2.88-2.664-5.216-5.944-5.216C2.376 5.96 0 8.296 0 11.176c0 1.944 1.728 3.52 3.864 3.52.816 0 1.568-.224 2.184-.608l1.24.28-.296-.864a3.1 3.1 0 0 0 .64-1.832c0-1.84-1.744-3.328-3.896-3.328-2.152 0-3.896 1.488-3.896 3.328 0 1.84 1.744 3.328 3.896 3.328.648 0 1.256-.144 1.792-.4.152-.072.328-.024.432.112l.64 1.896-2.024-.464a.4.4 0 0 0-.36.136 4.9 4.9 0 0 1-2.672.784c-2.88 0-5.224-2.12-5.224-4.736S2.152 7.2 5.032 7.2c2.88 0 5.224 2.12 5.224 4.736 0 2.616-2.344 4.736-5.224 4.736-.88 0-1.712-.2-2.456-.56-.12-.056-.264-.04-.376.04l-1.064.76.28-1.184a.4.4 0 0 0-.128-.408 3.3 3.3 0 0 1-.68-2.024Z" />
            <path d="M16.9 11.6c0-2.6-2.4-4.7-5.4-4.7-3 0-5.4 2.1-5.4 4.7 0 2.6 2.4 4.7 5.4 4.7.6 0 1.2-.1 1.7-.3l.1-.04 1.1.6-.3-1 .06-.06c.9-.7 1.4-1.7 1.4-2.9zm-3.8 2.3c-.3 0-.5-.2-.5-.5 0-.3.2-.5.5-.5.3 0 .5.2.5.5 0 .3-.2.5-.5.5zm-3.2 0c-.3 0-.5-.2-.5-.5 0-.3.2-.5.5-.5.3 0 .5.2.5.5 0 .3-.2.5-.5.5zM7.6 13c-2.3 0-4.2-1.8-4.2-4s1.9-4 4.2-4c2.3 0 4.2 1.8 4.2 4S9.9 13 7.6 13c-.5 0-1-.1-1.4-.3l-.1-.03-.9.5.3-.8-.06-.06c-.7-.7-1.1-1.6-1.1-2.6zm2.5-2.2c-.2 0-.4-.2-.4-.4s.2-.4.4-.4.4.2.4.4-.2.4-.4.4zm-2.5 0c-.2 0-.4-.2-.4-.4s.2-.4.4-.4.4.2.4.4-.2.4-.4.4z"/>
          </svg>
          WeChat
        </button>
      </form>

      <div class="mt-10 pt-6 border-t border-slate-50 text-center">
        <p class="text-sm text-slate-400">
          {{ isRegister ? 'Already have an account?' : 'New here?' }}
          <button @click="isRegister = !isRegister" class="text-slate-900 font-bold hover:underline">
            {{ isRegister ? 'Sign In' : 'Create an account' }}
          </button>
        </p>
      </div>
    </div>
  </div>
</template>
