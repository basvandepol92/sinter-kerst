<script setup lang="ts">
import type { Challenge } from '../../types/game';

defineProps<{
  challenge: Challenge | null;
}>();
</script>

<template>
  <div class="challenge-card">
    <template v-if="challenge">
      <p class="type">
        {{ challenge.type === 'individual' ? 'INDIVIDUAL' : 'VERSUS' }}
        <template v-if="challenge.timerOverrideSeconds">
          · ⏱️ {{ challenge.timerOverrideSeconds }}s
        </template>
      </p>
      <h2>{{ challenge.title }}</h2>
      <p class="description">{{ challenge.description }}</p>
      <ul class="meta">
        <li>
          <template v-if="challenge.type === 'individual'">👤 Solo</template>
          <template v-else>👥 {{ challenge.minPlayers }}-{{ challenge.maxPlayers }}</template>
        </li>
      </ul>
    </template>
    <template v-else>
      <h2>Kies “Start spel” om te beginnen</h2>
      <p class="description">We loten automatisch spelers en een nieuwe challenge.</p>
    </template>
  </div>
</template>

<style scoped>
.challenge-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 28px;
  padding: clamp(1.4rem, 3vw, 2.6rem);
  box-shadow: 0 24px 60px rgba(15, 19, 36, 0.18);
  min-height: 340px;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.type {
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.25em;
  color: #ff769c;
  font-weight: 800;
}

h2 {
  margin: 0;
  font-size: clamp(1.6rem, 3vw, 2.5rem);
  color: #ce4d1c;
}

.description {
  font-size: 1.05rem;
  line-height: 1.5;
  color: #27314b;
}

.meta {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1.2rem;
  font-weight: 600;
  color: #3d4163;
}
</style>
