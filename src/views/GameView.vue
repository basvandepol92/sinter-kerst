<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppButton from '../components/ui/AppButton.vue';
import SpriteAvatar from '../components/players/SpriteAvatar.vue';
import ChallengeCard from '../components/game/ChallengeCard.vue';
import WinnerSelect from '../components/game/WinnerSelect.vue';
import TimerRing from '../components/game/TimerRing.vue';
import ConfettiLayer from '../components/decor/ConfettiLayer.vue';
import { useGameStore } from '../stores/gameStore';
import { useAudioEngine } from '../composables/useAudioEngine';
import type { Challenge, ChallengeType } from '../types/game';

const router = useRouter();
const store = useGameStore();
const audio = useAudioEngine();

const scoreboardPlayers = computed(() => store.players);
const enabledPlayers = computed(() => store.players.filter((player) => player.enabled));
const activePlayers = computed(() =>
  store.players.filter((player) => store.activePlayerIds.includes(player.id))
);

const modalOpen = ref(false);
const stage = ref<'idle' | 'challenge' | 'players' | 'complete'>('idle');
const challengeReady = ref(false);
const playersReady = ref(false);
const rollingChallenge = ref<Challenge | null>(null);
const challengeMessage = ref('Loten...');
type PreviewPlayer = { id: string; name: string; sprite: string; color: string; accent: string };
const previewPlayers = ref<PreviewPlayer[]>([]);
const winnerSelectionOpen = ref(false);
const winnerSelection = ref<string[]>([]);
const muted = ref(false);
const safeTimerDuration = computed(() => {
  const value = Number(store.currentTimerLimit ?? store.settings.timerSeconds ?? 0);
  return Number.isFinite(value) && value > 0 ? value : 60;
});

let challengeInterval: number | null = null;
let challengeTimeout: number | null = null;
let playerInterval: number | null = null;
let playerTimeout: number | null = null;
const raf = ref<number | null>(null);

const randomChallenge = () => {
  if (!store.challenges.length) return null;
  const index = Math.floor(Math.random() * store.challenges.length);
  return store.challenges[index];
};

const randomPlayerMix = (type: ChallengeType) => {
  if (!enabledPlayers.value.length) {
    return [
      { id: `none-${Math.random()}`, name: '???', sprite: '', color: '#eee', accent: '#fff' }
    ];
  }
  const pool = [...enabledPlayers.value].sort(() => Math.random() - 0.5);
  const min = type === 'individual' ? 1 : 2;
  const max = type === 'individual' ? 1 : Math.min(4, pool.length);
  if (max < min) {
    return pool.slice(0, max).map((player) => ({
      id: `${player.id}-${Math.random()}`,
      name: player.name,
      sprite: player.sprite,
      color: player.color,
      accent: player.accent
    }));
  }
  const count = Math.min(max, Math.max(min, Math.floor(Math.random() * (max - min + 1)) + min));
  return pool.slice(0, count).map((player) => ({
    id: `${player.id}-${Math.random()}`,
    name: player.name,
    sprite: player.sprite,
    color: player.color,
    accent: player.accent
  }));
};

const updateFakeChallenge = () => {
  rollingChallenge.value = randomChallenge();
};

const updateFakePlayers = (type: ChallengeType) => {
  previewPlayers.value = randomPlayerMix(type);
};

const stopAnimation = () => {
  if (challengeInterval) {
    clearInterval(challengeInterval);
    challengeInterval = null;
  }
  if (challengeTimeout) {
    clearTimeout(challengeTimeout);
    challengeTimeout = null;
  }
  if (playerInterval) {
    clearInterval(playerInterval);
    playerInterval = null;
  }
  if (playerTimeout) {
    clearTimeout(playerTimeout);
    playerTimeout = null;
  }
};

const revealPlayers = () => {
  playersReady.value = true;
  stage.value = 'complete';
  previewPlayers.value = activePlayers.value.map((player) => ({
    id: player.id,
    name: player.name,
    sprite: player.sprite,
    color: player.color,
    accent: player.accent
  }));
};

const finishSelection = () => {
  const challenge = store.activeChallenge;
  if (!challenge) {
    challengeMessage.value = 'Geen challenge beschikbaar';
    previewPlayers.value = [];
    challengeReady.value = false;
    playersReady.value = false;
    return;
  }
  challengeMessage.value = challenge.title;
  challengeReady.value = true;
  stage.value = 'players';
  updateFakePlayers(challenge.type);
  playerInterval = window.setInterval(() => updateFakePlayers(challenge.type), 140);
  playerTimeout = window.setTimeout(() => {
    if (playerInterval) clearInterval(playerInterval);
    playerInterval = null;
    revealPlayers();
  }, 1400);
};

const spinChallenge = (action: () => boolean | null | undefined) => {
  stopAnimation();
  if (!enabledPlayers.value.length) {
    challengeMessage.value = 'Geen spelers actief';
    return;
  }
  stage.value = 'challenge';
  challengeReady.value = false;
  playersReady.value = false;
  updateFakeChallenge();
  challengeInterval = window.setInterval(updateFakeChallenge, 120);
  challengeTimeout = window.setTimeout(() => {
    if (challengeInterval) clearInterval(challengeInterval);
    challengeInterval = null;
    const result = action();
    if (result === false) {
      challengeMessage.value = 'Even wachten voor reroll';
      previewPlayers.value = [];
      stage.value = 'idle';
      return;
    }
    finishSelection();
  }, 1500);
};

const openModal = () => {
  modalOpen.value = true;
  previewPlayers.value = [];
  spinChallenge(() => !!store.rollChallenge());
};

const closeModal = () => {
  stopAnimation();
  modalOpen.value = false;
  challengeReady.value = false;
  playersReady.value = false;
  stage.value = 'idle';
  previewPlayers.value = [];
};

const handleReroll = () => {
  if (stage.value === 'challenge' || stage.value === 'players') return;
  if (!store.rerollReady) return;
  spinChallenge(() => store.reroll());
};

const startTimer = async () => {
  if (!playersReady.value) return;
  const started = store.startOrResumeChallenge();
  if (started) {
    await audio.ensureContext();
  } else {
    const fallback = safeTimerDuration.value;
    store.setTimerSeconds(fallback);
    store.timer.remaining = fallback;
  }
};

const openWinnerPicker = () => {
  if (!playersReady.value || !activePlayers.value.length) return;
  winnerSelection.value = [];
  winnerSelectionOpen.value = true;
};

const confirmWinner = () => {
  store.markWinners(winnerSelection.value);
  winnerSelectionOpen.value = false;
  audio.playWinChord();
  closeModal();
};

const handleMuteToggle = async () => {
  muted.value = !muted.value;
  await audio.ensureContext();
  audio.setMuted(muted.value);
  if (!muted.value) {
    audio.startLoop();
  }
};

const handleBackdropClick = () => {
  if (stage.value === 'challenge' || stage.value === 'players') return;
  closeModal();
};

const tickTimer = () => {
  store.tickTimer();
  raf.value = requestAnimationFrame(tickTimer);
};

onMounted(() => {
  raf.value = requestAnimationFrame(tickTimer);
});

onBeforeUnmount(() => {
  if (raf.value) cancelAnimationFrame(raf.value);
  stopAnimation();
});

watch(
  () => store.gamePhase,
  (phase, prev) => {
    if (phase === 'timeup' && prev !== 'timeup') {
      audio.playTimerPing();
    }
  }
);

const hasFinalSelection = computed(() => playersReady.value && !!store.activeChallenge);
</script>

<template>
  <div class="game">
    <ConfettiLayer :trigger="store.winnerBurst" />
    <header class="score-header">
      <div class="title-block">
        <p class="eyebrow">Scorebord</p>
        <h1>Tijd voor een challenge</h1>
      </div>
      <div class="header-actions">
        <AppButton theme="ghost" icon="⬅️" size="sm" @click="router.push('/')">Menu</AppButton>
        <AppButton size="lg" icon="🎲" :disabled="!enabledPlayers.length" @click="openModal">
          Next challenge
        </AppButton>
        <AppButton theme="ghost" icon="🎧" size="sm" @click="handleMuteToggle">
          {{ muted ? 'Muziek uit' : 'Muziek aan' }}
        </AppButton>
      </div>
    </header>

    <section class="score-grid">
      <div
        v-for="player in scoreboardPlayers"
        :key="player.id"
        class="score-card"
        :class="{ inactive: !player.enabled }"
      >
        <SpriteAvatar
          :name="player.name"
          :sprite="player.sprite"
          :color="player.color"
          :accent="player.accent"
          variant="hero"
          :disabled="!player.enabled"
        />
        <p class="label">Score</p>
        <p class="value">{{ player.score }}</p>
      </div>
    </section>

    <transition name="fade">
      <div v-if="modalOpen" class="challenge-overlay" @click.self="handleBackdropClick">
        <div class="modal-card">
          <div class="modal-header">
            <div>
              <p class="eyebrow">Challenge Flow</p>
              <h2>Wie doet er mee?</h2>
            </div>
            <AppButton theme="ghost" icon="✖" size="sm" @click="handleBackdropClick">
              Sluiten
            </AppButton>
          </div>

          <div class="slots">
            <div class="slot">
              <p class="eyebrow">Challenge</p>
              <div class="slot-window" :class="{ animating: stage === 'challenge' && !challengeReady }">
                <div v-if="!challengeReady" class="rolling-card">
                  <ChallengeCard v-if="rollingChallenge" :challenge="rollingChallenge" />
                  <p v-else class="placeholder">{{ challengeMessage }}</p>
                </div>
                <div v-else class="card-wrapper">
                  <ChallengeCard :challenge="store.activeChallenge" />
                </div>
              </div>
            </div>
            <div class="slot">
              <p class="eyebrow">Spelers</p>
              <div class="slot-window participants" :class="{ animating: stage === 'players' && !playersReady }">
                <div v-if="!playersReady" class="preview-avatars">
                  <SpriteAvatar
                    v-for="player in previewPlayers"
                    :key="player.id"
                    :name="player.name"
                    :sprite="player.sprite"
                    :color="player.color"
                    :accent="player.accent"
                    variant="hero"
                  />
                </div>
                <div v-else class="participant-tags">
                  <SpriteAvatar
                    v-for="player in activePlayers"
                    :key="player.id"
                    :name="player.name"
                    :sprite="player.sprite"
                    :color="player.color"
                    :accent="player.accent"
                    variant="hero"
                  />
                </div>
              </div>
            </div>
          </div>

          <div v-if="hasFinalSelection" class="utilities">
            <div class="timer-block">
              <TimerRing
                :duration="safeTimerDuration"
                :remaining="store.timer.remaining"
                :status="store.gamePhase"
              />
              <AppButton
                size="sm"
                icon="⏱️"
                :disabled="!hasFinalSelection || store.timer.running"
                @click="startTimer"
              >
                Start timer
              </AppButton>
            </div>
            <p class="status-text">
              {{
                store.gamePhase === 'running'
                  ? 'Timer loopt...'
                  : store.gamePhase === 'timeup'
                    ? 'Tijd voorbij'
                    : 'Klaar om te spelen'
              }}
            </p>
          </div>

          <div class="modal-actions">
            <AppButton
              theme="ghost"
              icon="🔁"
              :disabled="
                stage === 'challenge' ||
                stage === 'players' ||
                store.timer.running ||
                !store.rerollReady
              "
              @click="handleReroll"
            >
              Reroll
            </AppButton>
            <AppButton
              theme="danger"
              icon="🏅"
              :disabled="!hasFinalSelection || (store.gamePhase !== 'running' && store.gamePhase !== 'timeup')"
              @click="openWinnerPicker"
            >
              Markeer winnaar
            </AppButton>
          </div>
        </div>
      </div>
    </transition>

    <WinnerSelect
      :players="activePlayers"
      v-model="winnerSelection"
      :open="winnerSelectionOpen"
      @confirm="confirmWinner"
      @close="winnerSelectionOpen = false"
    />
  </div>
</template>

<style scoped>
.game {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: inherit;
}

.score-header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--surface-panel-bg);
  border-radius: 28px;
  padding: 1.5rem;
  box-shadow: var(--surface-panel-shadow);
  border: 1px solid var(--surface-panel-border);
}

.title-block h1 {
  margin: 0;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.3em;
  font-size: 0.75rem;
  margin: 0;
  color: #fd6fa5;
  font-weight: 800;
}

.header-actions {
  display: flex;
  gap: 0.8rem;
  flex-wrap: wrap;
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.2rem;
}

.score-card {
  background: var(--score-card-bg);
  border-radius: 28px;
  padding: 1.2rem;
  text-align: center;
  box-shadow: var(--score-card-shadow);
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.score-card.inactive {
  opacity: 0.4;
}

.label {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.value {
  margin: 0;
  font-size: 2rem;
  font-weight: 800;
  color: #ff7b99;
}

.challenge-overlay {
  position: fixed;
  inset: 0;
  background: var(--modal-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  z-index: 50;
}

.modal-card {
  width: min(1100px, 100%);
  background: var(--modal-bg);
  border-radius: 32px;
  padding: clamp(1.2rem, 2vw, 2rem);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.2);
  max-height: 90vh;
  overflow: auto;
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  border: 1px solid var(--overlay-card-border);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.slots {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.slot-window {
  border-radius: 24px;
  background: var(--surface-soft-bg);
  min-height: 220px;
  padding: 1rem;
  box-shadow: inset 0 0 0 2px var(--slot-border);
}

.slot-window.animating {
  animation: pulseSlot 0.8s ease-in-out infinite;
}

.rolling-card {
  animation: slideCards 0.9s ease-in-out infinite;
}

.rolling-card :deep(.challenge-card) {
  transform: scale(0.95);
  opacity: 0.85;
}

.placeholder {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--placeholder-text);
  text-align: center;
}

.card-wrapper {
  max-height: 340px;
  overflow: hidden;
}

.participant-tags {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.participant-tags :deep(.avatar.hero) {
  background: var(--avatar-hero-bg);
}

.preview-avatars {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}

.preview-avatars :deep(.avatar.hero) {
  background: var(--avatar-hero-bg-alt);
}

.utilities {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  background: var(--utilities-bg);
  border-radius: 22px;
  padding: 1rem 1.2rem;
}

.timer-block {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-text {
  margin: 0;
  font-weight: 700;
  color: var(--status-strong);
}

:global(.dark-mode) .modal-card {
  color: var(--page-text);
  backdrop-filter: blur(14px);
}

:global(.dark-mode) .score-header,
:global(.dark-mode) .score-card,
:global(.dark-mode) .utilities {
  backdrop-filter: blur(12px);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes pulseSlot {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.01);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes slideCards {
  0% {
    transform: translateY(-10px);
    opacity: 0.5;
  }
  50% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(10px);
    opacity: 0.5;
  }
}
</style>
