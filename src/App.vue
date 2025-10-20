<template>
  <n-config-provider :theme="ui.darkMode ? darkTheme : null">
    <n-global-style />
    <n-message-provider>
      <n-layout has-sider class="dashboard_main">
        <!-- Side menu or blank placeholder -->
        <n-layout-sider
          v-if="!isWallPage"
          width="300"
          :style="{
            backgroundColor: isDark ? '#22272e' : 'var(--n-color)',
          }">
          <div class="title_box">
            <div class="logo">
              <n-avatar size="medium" :src="isDark ? logoDark : logoLight" />
            </div>
            <h2>Monitoring System</h2>
          </div>
          <n-menu
            :value="activeKey"
            :options="menuOptions"
            @update:value="handleMenuSelect" />
        </n-layout-sider>
        <!-- When displaying the WallView, render an empty sider to reserve space -->
        <n-layout-sider
          v-else
          width="300"
          :style="{
            backgroundColor: isDark ? '#22272e' : 'var(--n-color)',
          }">
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
        <!-- Main content -->
        <n-layout>
          <n-layout-header
            style="
              height: 64px;
              display: flex;
              align-items: center;
              padding: 0 16px;
            ">
            <n-breadcrumb separator="/">
              <n-breadcrumb-item
                v-for="(crumb, index) in breadcrumbs"
                :key="index">
                <span v-if="index === breadcrumbs.length - 1">{{
                  crumb.title
                }}</span>
                <router-link v-else :to="crumb.path">{{
                  crumb.title
                }}</router-link>
              </n-breadcrumb-item>
            </n-breadcrumb>
            <div style="margin-left: auto">
              <n-button v-show="isDark" @click="isDark = false">
                Dark
              </n-button>
              <n-button v-show="!isDark" @click="isDark = true">
                Light
              </n-button>
            </div>
          </n-layout-header>
          <n-layout-content content-class="main_content">
            <RouterView />
          </n-layout-content>
        </n-layout>
      </n-layout>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import {
  darkTheme,
  NConfigProvider,
  NMessageProvider,
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NButton,
  NAvatar,
  NBreadcrumb,
  NBreadcrumbItem,
  NGlobalStyle,
} from "naive-ui";
import { ref, watch, computed, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "./stores/ui";
import logoDark from "@/assets/img/cat_d.png";
import logoLight from "@/assets/img/cat_l.png";

// route & router
const router = useRouter();
const route = useRoute();
// UI store for dark mode toggle
const ui = useUIStore();
const isDark = ref(ui.darkMode);

// keep UI store in sync
watch(isDark, (val) => {
  ui.darkMode = val;
});

// Determine if current route is wall view (no menu)
const isWallPage = computed(() => route.path.startsWith("/wall"));

// menu options
interface MenuOption {
  key: string;
  label: string;
  children?: MenuOption[];
}

const menuOptions: MenuOption[] = [
  { label: "ダッシュボード", key: "dashboard" },
  { label: "ライセンス管理", key: "license" },
  {
    label: "ユーザ管理",
    key: "users",
    children: [
      { label: "QQ社ユーザ管理", key: "users/qq" },
      { label: "施工会社管理", key: "users/company" },
      { label: "施工会社ユーザ管理", key: "users/company-users" },
    ],
  },
  { label: "工事基本情報管理", key: "construction" },
  { label: "工事管理", key: "construction" },
  { label: "工事状況管理", key: "construction-status" },
];

// active menu key based on route
const activeKey = ref(route.path.split("/")[1] || "dashboard");

watch(
  () => route.path,
  (newPath) => {
    activeKey.value = newPath.split("/")[1] || "dashboard";
  }
);

function handleMenuSelect(key: string) {
  router.push("/" + key);
}

// compute breadcrumb items
const breadcrumbs = computed(() => {
  return route.matched.map((record) => {
    return {
      title: record.meta.title || record.name,
      path: record.path,
    };
  });
});
</script>
