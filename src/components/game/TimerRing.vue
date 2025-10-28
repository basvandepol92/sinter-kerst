<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  duration: number;
  remaining: number;
  status: 'idle' | 'running' | 'timeup' | 'complete' | 'ready';
}>();

const normalizedRemaining = computed(() => {
  if (props.duration === 0) return 0;
  return Math.max(0, Math.min(1, props.remaining / props.duration));
});

const radius = 44;
const circumference = 2 * Math.PI * radius;

const dashArray = computed(() => `${circumference}`);
const dashOffset = computed(() => circumference * (1 - normalizedRemaining.value));
</script>

<template>
  <div class="timer">
    <svg viewBox="0 0 100 100">
      <circle class="bg" cx="50" cy="50" r="44" />
      <circle
        class="progress"
        cx="50"
        cy="50"
        r="44"
        :style="{ strokeDasharray: dashArray, strokeDashoffset: dashOffset }"
      />
    </svg>
    <div class="value">
      <span>{{ Math.ceil(Math.max(0, remaining)) }}s</span>
    </div>
  </div>
</template>

<style scoped>
.timer {
  position: relative;
  width: 96px;
  height: 96px;
}

svg {
  transform: rotate(-90deg);
  width: 100%;
  height: 100%;
}

.bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.35);
  stroke-width: 8;
}

.progress {
  fill: none;
  stroke: #ff7b99;
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.2s linear;
}

.value {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  color: #ff4f8a;
  font-size: 1rem;
}
</style>
