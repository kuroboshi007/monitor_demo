<template>
  <n-layout has-sider class="dashboard_main">
    <!-- 侧边栏菜单 -->
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
        <n-breadcrumb>
          <n-breadcrumb-item href="/"> Home</n-breadcrumb-item>
          <n-breadcrumb-item> {{ currentLabel }} </n-breadcrumb-item>
        </n-breadcrumb>
        <div style="margin-left: auto">
          <!-- <n-switch v-model:value="isDark" /> -->
          <n-button v-show="isDark" @click="isDark = false"> Dark </n-button>
          <n-button v-show="!isDark" @click="isDark = true"> Light </n-button>
        </div>
      </n-layout-header>
      <n-layout-content style="padding: 16px">
        <router-view />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script setup lang="ts">
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
import { useUIStore } from "../stores/ui";
import logoDark from "@/assets/img/cat_d.png";
import logoLight from "@/assets/img/cat_l.png";

const router = useRouter();
const route = useRoute();
const ui = useUIStore();
const isDark = ref(ui.darkMode);

// 当开关变化时，更新全局 UI store
watch(isDark, (val) => {
  ui.darkMode = val;
});

// 定义侧边栏菜单项
interface MenuOption {
  key: string;
  label: string;
}

const menuOptions: MenuOption[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "license", label: "License Management" },
  { key: "users", label: "User Management" },
  { key: "companies", label: "Company Management" },
  { key: "constructions", label: "Construction Management" },
  { key: "status", label: "Construction Status" },
];

const activeKey = ref(route.path.split("/")[1] || "dashboard");

// 当前路由变化时同步高亮
watch(
  () => route.path,
  (newPath) => {
    activeKey.value = newPath.split("/")[1] || "dashboard";
  }
);

function handleMenuSelect(key: string) {
  router.push("/" + key);
}

// 根据菜单项key映射当前标题
const currentLabel = computed(() => {
  const found = menuOptions.find((m) => m.key === activeKey.value);
  return found ? found.label : "";
});
</script>
