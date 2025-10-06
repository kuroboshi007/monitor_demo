<template>
  <!-- 配置 Naive UI 全局主题，切换暗色模式 -->
  <n-config-provider :theme="ui.darkMode ? darkTheme : null">
    <n-message-provider>
      <RouterView />
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme, NConfigProvider, NMessageProvider } from "naive-ui";
import { useUIStore } from "./stores/ui";

const ui = useUIStore();
</script>
