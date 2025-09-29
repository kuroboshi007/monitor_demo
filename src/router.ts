import { createRouter, createWebHistory } from "vue-router";
import MapView from "./pages/MapView.vue";
import WallView from "./pages/WallView.vue";

export default createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/map" },
    { path: "/map", component: MapView },
    { path: "/wall", component: WallView },
  ],
});
