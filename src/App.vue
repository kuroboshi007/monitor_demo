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
          }"
          :collapsed="collapsed"
          collapse-mode="width"
          :collapsed-width="64"
          show-trigger
          @collapse="collapsed = true"
          @expand="collapsed = false">
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
  NIcon,
  useMessage,
  useNotification,
} from "naive-ui";
import { ref, watch, computed, h } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUIStore } from "./stores/ui";
import logoDark from "@/assets/img/cat_d.png";
import logoLight from "@/assets/img/cat_l.png";
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

// router hooks
const router = useRouter();
const route = useRoute();

// UI store for dark mode toggle
const ui = useUIStore();
const isDark = ref(ui.darkMode);

const collapsed = ref(false);
const message = useMessage();
const notification = useNotification();

// keep store synced with state
watch(isDark, (val) => {
  ui.darkMode = val;
});

// determine if current route is the wall view.  We use window.location
// directly as a fallback so that the correct layout is applied
// immediately when opening a new monitor window, before vue‑router
// finishes loading the route.  This prevents the side menu from
// flashing the default menu for a brief moment.
const isWallPage = computed(() => {
  const path = route.path || window.location.pathname;
  return path.startsWith("/wall");
});

// define menu options
interface MenuOption {
  key: string;
  label: string;
  children?: MenuOption[];
}

function renderIcon(icon: Component) {
  return () => h(NIcon, null, { default: () => h(icon) });
}

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

// active menu key based on current route
const activeKey = ref(route.path.split("/")[1] || "dashboard");

watch(
  () => route.path,
  (newPath) => {
    activeKey.value = newPath.split("/")[1] || "dashboard";
  }
);

// handle menu selection: navigate to the selected page
function handleMenuSelect(key: string) {
  router.push("/" + key);
}

// compute breadcrumbs based on matched routes
const breadcrumbs = computed(() => {
  return route.matched.map((record) => {
    return {
      title: (record.meta?.title as string) || (record.name as string),
      path: record.path,
    };
  });
});

function handleClick2() {
  let markAsRead = false;
  const n = notification.create({
    title: "Satisfaction",
    content: `I cant get no satisfaction
I cant get no satisfaction
Cause I try and I try and I try and I try
I cant get no, I cant get no`,
    meta: "2019-5-27 15:11",
    action: () =>
      h(
        NButton,
        {
          text: true,
          type: "primary",
          onClick: () => {
            markAsRead = true;
            n.destroy();
          },
        },
        {
          default: () => "Mark as Read",
        }
      ),
    onClose: () => {
      if (!markAsRead) {
        message.warning("Please mark as read");
        return false;
      }
    },
  });
}
</script>
