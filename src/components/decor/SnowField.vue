<script setup lang="ts">
const flakes = Array.from({ length: 200 }).map((_, index) => ({
  id: index,
  left: Math.random() * 100,
  size: 6 + Math.random() * 8,
  duration: 6 + Math.random() * 12,
  delay: Math.random() * -12
}));
</script>

<template>
  <div class="snow-field" aria-hidden="true">
    <span
      v-for="flake in flakes"
      :key="flake.id"
      class="flake"
      :style="{
        left: `${flake.left}%`,
        width: `${flake.size}px`,
        height: `${flake.size}px`,
        animationDuration: `${flake.duration}s`,
        animationDelay: `${flake.delay}s`
      }"
    />
  </div>
</template>

<style scoped>
.snow-field {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 1;
}

.flake {
  position: absolute;
  top: -10px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 70%);
  border-radius: 50%;
  animation-name: fall;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

@keyframes fall {
  0% {
    transform: translateY(-10px) translateX(0);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) translateX(40px);
    opacity: 0.2;
  }
}
</style>
