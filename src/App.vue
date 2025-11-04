<template>
  <n-config-provider :theme="ui.darkMode ? darkTheme : null">
    <n-message-provider>
      <n-notification-provider>
        <n-global-style />
        <n-layout has-sider class="dashboard_main">
          <menu-sidebar
            :collapsed="collapsed"
            @update:collapsed="(val) => (collapsed = val)" />
          <main-content :collapsed="collapsed" />
        </n-layout>
      </n-notification-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import {
  darkTheme,
  NConfigProvider,
  NMessageProvider,
  NNotificationProvider,
  NLayout,
  NGlobalStyle,
} from "naive-ui";
import { ref } from "vue";
import { useUIStore } from "./stores/ui";
import MenuSidebar from "./components/MenuSidebar.vue";
import MainContent from "./components/MainContent.vue";

const ui = useUIStore();
const collapsed = ref(false);
</script>
