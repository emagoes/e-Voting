<template>
  <div id="app-root" class="min-vh-100">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { initializeDatabase } from './services/db';

onMounted(async () => {
  await initializeDatabase();
});
</script>
