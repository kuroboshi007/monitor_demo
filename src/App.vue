<template>
  <div id="app">
    <nav class="nav">
      <button @click="$router.push('/map')">Map</button>
      <button @click="$router.push('/wall')">Monitor</button>
    </nav>
    <router-view />
  </div>
</template>

<script setup lang="ts">
// 没有额外逻辑
</script>

<style scoped>
#app {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.nav {
  display: flex;
  padding: 8px;
  background-color: #f5f5f5;
  gap: 8px;
}

.nav button {
  padding: 6px 12px;
  border: none;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
}

.nav button:hover {
  background: #e0e0e0;
}

router-view {
  flex: 1;
  position: relative;
}
</style>
