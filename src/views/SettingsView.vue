<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import AppCard from '../components/ui/AppCard.vue';
import AppButton from '../components/ui/AppButton.vue';
import SpriteAvatar from '../components/players/SpriteAvatar.vue';
import { useGameStore } from '../stores/gameStore';

const store = useGameStore();
const router = useRouter();

const participantModes = [
  { value: 'auto', label: 'Variabel' },
  { value: 'solo', label: 'Individueel' },
  { value: 'duo', label: 'Duo' },
  { value: 'trio', label: 'Trio' },
  { value: 'all', label: 'Iedereen' }
] as const;

const seedLabel = computed(() => `Seed: ${store.seedValue}`);
</script>

<template>
  <div class="page">
    <AppButton theme="ghost" icon="⬅️" class="back" @click="router.back()">Terug</AppButton>
    <h1>Instellingen</h1>
    <div class="grid">
      <AppCard>
        <template #heading>Spelers</template>
        <p>Selecteer wie meedoet.</p>
        <div class="player-grid">
          <label
            v-for="player in store.players"
            :key="player.id"
            class="player-chip"
            :class="{ inactive: !player.enabled }"
          >
            <input type="checkbox" :checked="player.enabled" @change="store.togglePlayer(player.id)" />
            <SpriteAvatar
              :name="player.name"
              :sprite="player.sprite"
              :color="player.color"
              :accent="player.accent"
              :disabled="!player.enabled"
              compact
            />
            <small class="status">{{ player.enabled ? 'Doet mee' : 'Pauze' }}</small>
          </label>
        </div>
      </AppCard>

      <AppCard>
        <template #heading>Scores & punten</template>
        <label class="toggle">
          <input type="checkbox" :checked="store.settings.keepScore" @change="store.setKeepScore(!store.settings.keepScore)" />
          <span>Punten bijhouden</span>
        </label>
        <AppButton class="mt" theme="ghost" size="sm" @click="store.resetScores()">Reset scores</AppButton>
      </AppCard>

      <AppCard>
        <template #heading>Weergave</template>
        <label class="toggle">
          <input type="checkbox" :checked="store.settings.darkMode" @change="store.setDarkMode(!store.settings.darkMode)" />
          <span>Dark mode</span>
        </label>
        <p class="hint">Schakel over op een donkere uitstraling.</p>
      </AppCard>

      <AppCard>
        <template #heading>Spelverloop</template>
        <div class="field">
          <label>Timer per challenge</label>
          <div class="field-row">
            <input
              type="range"
              min="20"
              max="180"
              step="5"
              :value="store.settings.timerSeconds"
              @input="store.setTimerSeconds(parseInt(($event.target as HTMLInputElement).value, 10))"
            />
            <span>{{ store.settings.timerSeconds }}s</span>
          </div>
        </div>

        <div class="field">
          <label>Aantal spelers per challenge</label>
          <div class="chips">
            <button
              v-for="mode in participantModes"
              :key="mode.value"
              type="button"
              :class="['chip', { active: store.settings.participantsMode === mode.value }]"
              @click="store.setParticipantsMode(mode.value)"
            >
              {{ mode.label }}
            </button>
          </div>
        </div>

        <div class="field">
          <label>Max. spelers bij variabel</label>
          <input
            type="number"
            min="1"
            max="4"
            :value="store.settings.maxAutoPlayers"
            @input="store.setMaxAutoPlayers(parseInt(($event.target as HTMLInputElement).value, 10))"
          />
        </div>
      </AppCard>

      <AppCard>
        <template #heading>Challenge selectie</template>
        <div class="field">
          <label>Herhaal recente challenges voorkomen</label>
          <label class="toggle">
            <input type="checkbox" :checked="store.settings.avoidRepeats" @change="store.setAvoidRepeats(!store.settings.avoidRepeats)" />
            <span>{{ store.settings.avoidRepeats ? 'Aan' : 'Uit' }}</span>
          </label>
        </div>
        <div class="field" v-if="store.settings.avoidRepeats">
          <label>Venster (laatste N challenges)</label>
          <input
            type="number"
            min="1"
            max="12"
            :value="store.settings.recentChallengeWindow"
            @input="store.setRecentWindow(parseInt(($event.target as HTMLInputElement).value, 10))"
          />
        </div>
        <div class="field seed">
          <label>Volgorde random seed</label>
          <div class="seed-row">
            <span>{{ seedLabel }}</span>
            <AppButton size="sm" theme="ghost" @click="store.randomizeSeed()">Nieuw</AppButton>
          </div>
        </div>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1024px;
  margin: 0 auto;
}

.back {
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.player-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
}

.player-chip {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  cursor: pointer;
  border-radius: 20px;
  padding: 0.6rem 0.4rem;
  background: var(--player-chip-bg);
  border: 2px solid var(--player-chip-border);
  transition: border-color 0.2s ease, transform 0.2s ease;
}

.player-chip:hover {
  border-color: var(--player-chip-hover-border);
  transform: translateY(-2px);
}

.player-chip.inactive {
  background: var(--player-chip-inactive-bg);
  border-color: var(--player-chip-inactive-border);
}

.player-chip input {
  display: none;
}

.status {
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--player-chip-status);
}

.player-chip:not(.inactive) .status {
  color: var(--player-chip-status-active);
}

.toggle {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
}

.toggle input {
  width: 20px;
  height: 20px;
}

.field {
  margin-bottom: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.field-row {
  display: flex;
  align-items: center;
  gap: 0.8rem;
}

.chips {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.chip {
  border: none;
  padding: 0.45rem 1rem;
  border-radius: 999px;
  background: var(--chip-bg);
  font-weight: 700;
  cursor: pointer;
}

.chip.active {
  background: var(--chip-active-bg);
}

.seed {
  margin-top: 1.5rem;
}

.seed-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

input[type='number'] {
  border-radius: 12px;
  border: 1px solid var(--input-border);
  padding: 0.4rem 0.6rem;
  font-size: 1rem;
}

input[type='range'] {
  width: 100%;
}

.mt {
  margin-top: 1rem;
}

.hint {
  margin: 0.5rem 0 0;
  color: var(--text-muted);
  font-size: 0.9rem;
}
</style>
