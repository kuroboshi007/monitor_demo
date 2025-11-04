<template>
  <!-- When not on a wall view, render the normal navigation sider -->
  <n-layout-sider
    v-if="!isWallPage"
    width="300"
    :style="{ backgroundColor: isDark ? '#22272e' : 'var(--n-color)' }"
    :collapsed="collapsed"
    collapse-mode="width"
    :collapsed-width="64"
    show-trigger
    @collapse="emit('update:collapsed', true)"
    @expand="emit('update:collapsed', false)">
    <div class="title_box">
      <div class="logo">
        <n-avatar size="medium" :src="isDark ? logoDark : logoLight" />
      </div>
      <h2 v-show="!collapsed">Monitoring System</h2>
    </div>
    <n-menu
      :value="activeKey"
      :options="menuOptions"
      @update:value="handleMenuSelect" />
  </n-layout-sider>
  <!-- When viewing the wall page, reserve space with an empty sider -->
  <n-layout-sider
    v-else
    width="300"
    :style="{ backgroundColor: isDark ? '#22272e' : 'var(--n-color)' }">
    <div
      style="
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #888;
      ">
      Wall View
    </div>
  </n-layout-sider>
</template>

<script setup lang="ts">
import { NLayoutSider, NAvatar, NMenu, NIcon } from "naive-ui";
import { computed, h, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "../stores/ui";
import {
  FileTrayFull as FileTrayFullIcon,
  FileTray as FileTrayIcon,
  HomeOutline as HomeIcon,
  PersonOutline as PersonIcon,
  Key as KeyIcon,
  Map as MapIcon,
} from "@vicons/ionicons5";
import type { MenuOption } from "naive-ui";
import type { Component } from "vue";
import logoDark from "@/assets/img/cat_d.png";
import logoLight from "@/assets/img/cat_l.png";

// Accept a collapsed prop from the parent (App.vue) to control the sider's state.
const props = defineProps<{
  collapsed: boolean;
}>();

// Emit an update:collapsed event so the parent can keep track of collapsed state.
const emit = defineEmits<{
  (e: "update:collapsed", value: boolean): void;
}>();

// Access the UI store to read and update the dark mode preference.
const ui = useUIStore();

// Expose the dark mode value as a computed property so it stays in sync with the store.
const isDark = computed({
  get: () => ui.darkMode,
  set: (val: boolean) => {
    ui.darkMode = val;
  },
});

// Router and route hooks for navigation and determining the active menu key.
const router = useRouter();
const route = useRoute();

// Track which menu item is active based on the current route path.
const activeKey = ref(route.path.split("/")[1] || "dashboard");
watch(
  () => route.path,
  (newPath) => {
    activeKey.value = newPath.split("/")[1] || "dashboard";
  }
);

// Helper to render an icon component in the menu.
function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

// Define the options for the side menu.  These mirror the original App.vue menu.
const menuOptions: MenuOption[] = [
  { label: "ダッシュボード", key: "dashboard", icon: renderIcon(HomeIcon) },
  { label: "ライセンス管理", key: "license", icon: renderIcon(KeyIcon) },
  {
    label: "ユーザ管理",
    key: "users",
    icon: renderIcon(PersonIcon),
    children: [
      { label: "QQ社ユーザ管理", key: "users/qq" },
      { label: "施工会社管理", key: "users/company" },
      { label: "施工会社ユーザ管理", key: "users/company-users" },
    ],
  },
  {
    label: "工事基本情報管理",
    key: "construction-basic",
    icon: renderIcon(FileTrayFullIcon),
  },
  {
    label: "工事管理",
    key: "construction",
    icon: renderIcon(FileTrayIcon),
  },
  {
    label: "工事状況管理",
    key: "construction-status",
    icon: renderIcon(MapIcon),
  },
];

// Navigate to the selected menu item.
function handleMenuSelect(key: string) {
  router.push("/" + key);
}

// Determine whether the current route corresponds to the wall view.
const isWallPage = computed(
  () => route.meta.isWall === true || route.path.startsWith("/wall")
);
</script>
