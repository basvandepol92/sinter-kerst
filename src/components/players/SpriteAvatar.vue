<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  name: string;
  sprite: string;
  color: string;
  accent: string;
  active?: boolean;
  compact?: boolean;
  variant?: 'default' | 'hero';
  showScore?: number | null;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  active: false,
  compact: false,
  variant: 'default',
  showScore: null,
  disabled: false
});

const spriteIsImage = computed(() => {
  const value = props.sprite ?? '';
  return value.startsWith('/') || value.includes('.') || value.startsWith('data:');
});
</script>

<template>
  <div
    class="avatar"
    :class="[{ active, compact, disabled }, variant]"
    :style="{ background: color, boxShadow: `0 8px 20px ${accent}` }"
  >
    <span class="sprite" :class="{ image: spriteIsImage }">
      <img
        v-if="spriteIsImage"
        :src="sprite"
        :alt="`Avatar van ${name}`"
        loading="lazy"
        decoding="async"
      />
      <span v-else>{{ sprite }}</span>
    </span>
    <span class="name">{{ name }}</span>
    <span v-if="showScore !== null" class="score">+{{ showScore }}</span>
  </div>
</template>

<style scoped>
.avatar {
  display: inline-flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  color: #0f1324;
  font-weight: 700;
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.avatar.compact {
  flex-direction: column;
  border-radius: 18px;
  padding: 0.6rem;
  text-align: center;
}

.sprite {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.35);
  font-size: 1.4rem;
}

.sprite.image {
  font-size: 0;
  background: rgba(255, 255, 255, 0.1);
}

.sprite img {
  height: 100%;
  object-fit: cover;
}

.name {
  font-size: 0.95rem;
}

.avatar.active {
  transform: translateY(-4px) scale(1.05);
}

.avatar.disabled {
  opacity: 0.4;
  filter: grayscale(0.4);
}

.score {
  background: rgba(255, 255, 255, 0.6);
  padding: 0.1rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8rem;
}

.avatar.hero {
  flex-direction: column;
  border-radius: 28px;
  padding: 1rem 1.2rem;
  gap: 0.9rem;
  font-size: 1.1rem;
}

.avatar.hero .sprite {
  width: 6rem;
  height: 10rem;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.45);
}

.avatar.hero .name {
  font-size: 1.1rem;
}
</style>
