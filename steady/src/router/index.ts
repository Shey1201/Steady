import { createRouter, createWebHashHistory, RouteRecordRaw } from "vue-router";
import { useUserStore } from "../stores/user";

const routes: RouteRecordRaw[] = [
  { path: "/login", name: "Login", component: () => import("../pages/Login.vue") },
  { path: "/", redirect: "/corpus" },
  { path: "/corpus", name: "CorpusOverview", component: () => import("../pages/CorpusOverview.vue") },
  { path: "/reading", name: "Reading", component: () => import("../pages/Reading.vue") },
  { path: "/article/:id", name: "Article", component: () => import("../pages/Article.vue") },
  { path: "/review", name: "ReviewSession", component: () => import("../pages/ReviewSession.vue") },
];

const router = createRouter({
  history: createWebHashHistory(),
  routes,
});

router.beforeEach((to, _from, next) => {
  const userStore = useUserStore();
  if (to.name !== "Login" && !userStore.isAuthenticated) {
    next({ name: "Login" });
  } else if (to.name === "Login" && userStore.isAuthenticated) {
    next({ name: "CorpusOverview" });
  } else {
    next();
  }
});

export default router;
