<script setup lang="ts">
import { RouterView } from 'vue-router';
import SnowField from './components/decor/SnowField.vue';
import BackgroundImage from './images/background.png';
</script>

<template>
  <div class="app-shell">
    <img class="bg" :src="BackgroundImage" alt="" aria-hidden="true" />
    <div class="overlay"></div>
    <SnowField />
    <main class="app-main">
      <RouterView />
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  position: relative;
  min-height: 100vh;
  overflow: hidden;
}

.bg {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
}

.overlay {
  position: fixed;
  inset: 0;
  background: var(--page-overlay);
  z-index: 1;
}

.app-main {
  position: relative;
  z-index: 3;
  padding: clamp(16px, 3vw, 40px);
  min-height: 100vh;
}
</style>
