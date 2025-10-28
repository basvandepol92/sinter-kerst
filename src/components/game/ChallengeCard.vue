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
  background: var(--card-bg);
  border-radius: 28px;
  padding: clamp(1.4rem, 3vw, 2.6rem);
  box-shadow: var(--card-shadow);
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
  color: var(--card-heading);
}

.description {
  font-size: 1.05rem;
  line-height: 1.5;
  color: var(--status-strong);
}

.meta {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.7rem 1.2rem;
  font-weight: 600;
  color: var(--text-muted);
}

:global(.dark-mode) .challenge-card {
  backdrop-filter: blur(12px);
}
</style>
