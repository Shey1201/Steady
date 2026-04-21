import { defineStore } from "pinia";
import { authService, type User } from "../services/auth";

export const useUserStore = defineStore("user", {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    wechat: {
      isBound: false,
      notifications: {
        dailyQuote: false,
        weeklyReport: false,
        checkInReminder: false,
      }
    }
  }),
  actions: {
    async login(email: string, password: string) {
      try {
        const user = await authService.login(email, password);
        this.user = user;
        this.isAuthenticated = true;
        // Mock fetching user settings or fetch real settings if backend supports it
        this.wechat.isBound = email.includes("wechat");
        return true;
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },
    async register(email: string, password: string, name?: string) {
      try {
        const user = await authService.register(email, password, name);
        this.user = user;
        this.isAuthenticated = true;
        return true;
      } catch (error) {
        console.error("Registration failed:", error);
        throw error;
      }
    },
    logout() {
      authService.logout();
      this.user = null;
      this.isAuthenticated = false;
      this.wechat.isBound = false;
    },
    bindWechat() {
      this.wechat.isBound = true;
    },
    unbindWechat() {
      this.wechat.isBound = false;
      this.wechat.notifications = {
        dailyQuote: false,
        weeklyReport: false,
        checkInReminder: false,
      };
    }
  },
  persist: true,
});
