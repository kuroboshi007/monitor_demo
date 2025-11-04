<template>
  <n-layout>
    <!-- Header with breadcrumb and dark/light toggle -->
    <n-layout-header
      style="height: 64px; display: flex; align-items: center; padding: 0 16px">
      <n-breadcrumb separator="/">
        <n-breadcrumb-item v-for="(crumb, index) in breadcrumbs" :key="index">
          <span v-if="index === breadcrumbs.length - 1">{{ crumb.title }}</span>
          <router-link v-else :to="crumb.path">{{ crumb.title }}</router-link>
        </n-breadcrumb-item>
      </n-breadcrumb>
      <div style="margin-left: auto">
        <!-- Buttons to toggle dark/light mode -->
        <n-button v-show="isDark" @click="isDark = false"> Dark </n-button>
        <n-button v-show="!isDark" @click="isDark = true"> Light </n-button>
      </div>
    </n-layout-header>
    <!-- Main content area renders the current route -->
    <n-layout-content content-class="main_content">
      <RouterView />
    </n-layout-content>
  </n-layout>
</template>

<script setup lang="ts">
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  useMessage,
  useNotification,
} from "naive-ui";
import { computed, ref, watch, onMounted, onUnmounted, h } from "vue";
import { useRoute } from "vue-router";
import { useUIStore } from "../stores/ui";

// Accept a collapsed prop from the parent, even if not used directly here.
const props = defineProps<{
  collapsed: boolean;
}>();

// Access the UI store and keep dark mode in sync with it.
const ui = useUIStore();
ui.darkMode = true; // default to dark mode
const isDark = ref(ui.darkMode);
watch(isDark, (val) => {
  ui.darkMode = val;
});

// Use the route to build breadcrumb navigation.
const route = useRoute();
const breadcrumbs = computed(() => {
  return route.matched.map((record) => {
    return {
      title: (record.meta?.title as string) || (record.name as string),
      path: record.path,
    };
  });
});

// Use Naive UI's message and notification composables.
const message = useMessage();
const notification = useNotification();

// Function to show a notification about pending approvals.
function showApprovalNotification() {
  let confirmed = false;
  const n = notification.create({
    title: "工事承認のお願い",
    content:
      "現在、工事管理に承認待ちの工事が存在します。早急にご対応ください。",
    meta: new Date().toLocaleString("ja-JP"),
    action: () =>
      h(
        NButton,
        {
          text: true,
          type: "primary",
          onClick: () => {
            confirmed = true;
            n.destroy();
          },
        },
        {
          default: () => "確認しました",
        }
      ),
    onClose: () => {
      if (!confirmed) {
        message.warning("承認待ち案件の確認が必要です");
        return false;
      }
    },
  });
}

// Simulate fetching the number of pending approvals from a backend service.
function simulateFetchPendingApprovals(): boolean {
  return true;
}

/**
 * Check for pending approvals and trigger a notification if any exist.
 */
function checkPendingApprovals() {
  const hasPending = simulateFetchPendingApprovals();
  if (hasPending) {
    console.log("Pending approvals found, showing notification.");
    showApprovalNotification();
  }
}

onMounted(() => {
  // Perform an initial check when the component mounts.
  checkPendingApprovals();

  // Set up a timer to check every 5 minutes (5 * 60 * 1000 ms).
  const intervalId = setInterval(checkPendingApprovals, 5 * 60 * 1000);
  // test with shorter interval
  // const intervalId = setInterval(checkPendingApprovals, 20 * 1000);

  // When the component unmounts, clear the interval to avoid memory leaks.
  onUnmounted(() => {
    clearInterval(intervalId);
  });
});
</script>
