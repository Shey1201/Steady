import { defineStore } from "pinia";

interface User {
  email: string;
  name?: string;
}

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
    login(email: string) {
      // 模拟登录逻辑
      this.user = { email, name: email.split("@")[0] };
      this.isAuthenticated = true;
      // Mock fetching user settings
      this.wechat.isBound = email.includes("wechat");
    },
    logout() {
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
