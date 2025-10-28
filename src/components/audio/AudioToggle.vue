<script setup lang="ts">
const props = defineProps<{
  muted: boolean;
}>();

const emit = defineEmits<{ toggle: [] }>();
</script>

<template>
  <button class="audio-toggle" :class="{ muted: props.muted }" type="button" @click="emit('toggle')">
    <span>{{ props.muted ? '🔇' : '🎶' }}</span>
    <small>{{ props.muted ? 'Uit' : 'Aan' }}</small>
  </button>
</template>

<style scoped>
.audio-toggle {
  border: none;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 16px;
  padding: 0.4rem 0.8rem;
  font-weight: 700;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.1);
}

.audio-toggle.muted {
  opacity: 0.6;
}

small {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
}
</style>
