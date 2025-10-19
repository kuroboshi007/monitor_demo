<template>
  <n-config-provider :theme="ui.darkMode ? darkTheme : null">
    <n-message-provider>
      <n-layout has-sider class="dashboard_main">
        <!-- sidemenu -->
        <n-layout-sider
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
          <!-- @update:value="menuValue = $event" /> -->
        </n-layout-sider>
        <!-- Main -->
        <n-layout>
          <n-layout-header
            style="
              height: 64px;
              display: flex;
              align-items: center;
              padding: 0 16px;
            ">
            <!-- <div style="font-size: 1.25rem; font-weight: 600">
          {{ currentLabel }}
        </div> -->
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
              <!-- <n-switch v-model:value="isDark" /> -->
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
import { darkTheme, NConfigProvider, NMessageProvider } from "naive-ui";
import { useUIStore } from "./stores/ui";
import { ref, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NSwitch,
  NButton,
  NAvatar,
  NBreadcrumb,
  NBreadcrumbItem,
} from "naive-ui";
import logoDark from "@/assets/img/cat_d.png";
import logoLight from "@/assets/img/cat_l.png";

const router = useRouter();
const route = useRoute();
const ui = useUIStore();
const isDark = ref(ui.darkMode);

// when the switch changes, update the global UI store
watch(isDark, (val) => {
  ui.darkMode = val;
});

// highlighted on first render.
// const menuValue = ref(route.path);

// Whenever the route changes, update the selected menu value. This keeps
// the sidebar and routing in sync when navigation occurs through other
// means (e.g., programmatically or via the breadcrumb).
// watch(
//   () => route.fullPath,
//   (newPath) => {
//     menuValue.value = newPath;
//   },
//   { immediate: true }
// );

// sidebar menu items
interface MenuOption {
  key: string;
  label: string;
}

const menuOptions = [
  {
    label: "ダッシュボード",
    key: "dashboard",
  },
  {
    label: "ライセンス管理",
    key: "license",
  },
  {
    label: "ユーザ管理",
    key: "users",
    children: [
      {
        label: "QQ社ユーザ管理",
        key: "users/qq",
      },
      {
        label: "施工会社管理",
        key: "users/company",
      },
      {
        label: "施工会社ユーザ管理",
        key: "users/company-users",
      },
    ],
  },
  {
    label: "工事基本情報管理",
    key: "construction",
  },
  {
    label: "工事管理",
    key: "construction",
  },
  {
    label: "工事状況管理",
    key: "construction-status",
  },
];

const activeKey = ref(route.path.split("/")[1] || "dashboard");

// when the current route changes, update the active menu item
watch(
  () => route.path,
  (newPath) => {
    activeKey.value = newPath.split("/")[1] || "dashboard";
  }
);

function handleMenuSelect(key: string) {
  router.push("/" + key);
}

// map the current title based on the menu item key
const currentLabel = computed(() => {
  const found = menuOptions.find((m) => m.key === activeKey.value);
  return found ? found.label : "";
});

// Compute breadcrumb items based on the current matched routes. Each
// breadcrumb item contains a title (from meta.title) and the path to
// navigate when clicked. The last breadcrumb is not a link.
const breadcrumbs = computed(() => {
  return route.matched.map((record) => {
    return {
      title: record.meta.title || record.name,
      path: record.path,
    };
  });
});
</script>
