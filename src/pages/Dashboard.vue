<template>
  <div class="page">
    <h1>Dashboard</h1>
    <p>Welcome to the Monitor Demo Dashboard!</p>
    <p>
      Use the navigation buttons above to explore the Map and Monitor views.
    </p>
    <button @click="$router.push('/map')">Go to Map View</button>
    <button @click="$router.push('/wall')">Go to Monitor View</button>
  </div>
</template>

<script setup lang="ts"></script>
