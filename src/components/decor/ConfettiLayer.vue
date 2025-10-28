<script setup lang="ts">
import { ref, watch } from 'vue';

const props = defineProps<{ trigger: number }>();

interface Piece {
  id: number;
  left: number;
  delay: number;
  color: string;
  duration: number;
}

const colors = ['#ff7998', '#ffd25a', '#6dd5ff', '#c98bff', '#9effa0'];
const pieces = ref<Piece[]>([]);
let counter = 0;

const burst = () => {
  const amount = 80;
  pieces.value = Array.from({ length: amount }, () => ({
    id: counter++,
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    duration: 2 + Math.random() * 1.5,
    color: colors[Math.floor(Math.random() * colors.length)]
  }));
  window.setTimeout(() => {
    pieces.value = [];
  }, 2500);
};

watch(
  () => props.trigger,
  (current, previous) => {
    if (current !== previous && current > 0) {
      burst();
    }
  }
);
</script>

<template>
  <div class="confetti-layer" aria-hidden="true">
    <span
      v-for="piece in pieces"
      :key="piece.id"
      class="piece"
      :style="{
        left: `${piece.left}%`,
        animationDelay: `${piece.delay}s`,
        animationDuration: `${piece.duration}s`,
        background: piece.color
      }"
    />
  </div>
</template>

<style scoped>
.confetti-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.piece {
  position: absolute;
  top: -10px;
  width: 8px;
  height: 16px;
  border-radius: 2px;
  animation-name: confetti-fall;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-10px) rotateZ(0deg);
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    transform: translateY(110vh) rotateZ(720deg);
    opacity: 0;
  }
}
</style>
