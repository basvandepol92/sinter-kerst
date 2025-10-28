<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppButton from '../components/ui/AppButton.vue';
import SpriteAvatar from '../components/players/SpriteAvatar.vue';
import { useGameStore } from '../stores/gameStore';
import { useAudioEngine } from '../composables/useAudioEngine';
import LogoImage from '../images/logo.png';

const router = useRouter();
const store = useGameStore();
const audio = useAudioEngine();

const startGame = async () => {
  await audio.ensureContext();
  await audio.startLoop();
  router.push('/spel');
};
</script>

<template>
  <div class="splash">
    <div class="hero">
      <img :src="LogoImage" alt="Sinter-kerst 2025" />
      <div class="subtitle-banner">
        <span>Vrolijke party-game met challenges, punten en cadeaus</span>
      </div>
    </div>
    <div class="players">
      <SpriteAvatar
        v-for="player in store.players"
        :key="player.id"
        :name="player.name"
        :sprite="player.sprite"
        :color="player.color"
        :accent="player.accent"
        variant="hero"
      />
    </div>
    <div class="actions">
      <AppButton size="lg" icon="🎮" @click="startGame">Start spel</AppButton>
      <AppButton theme="ghost" @click="router.push('/instellingen')">Instellingen</AppButton>
      <AppButton theme="ghost" @click="router.push('/challenges')">Challenge-beheer</AppButton>
      <AppButton theme="ghost" @click="router.push('/uitleg')">Speluitleg</AppButton>
    </div>
  </div>
</template>

<style scoped>
.splash {
  max-width: 880px;
  margin: 0 auto;
  text-align: center;
}

.hero {
  text-align: center;
  margin-bottom: 2rem;
}

.hero img {
  width: min(420px, 70vw);
  height: auto;
  display: block;
  margin: 0 auto 1rem;
}

.subtitle-banner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0.75rem 1.5rem;
  border-radius: 999px;
  background: linear-gradient(120deg, rgba(255, 123, 153, 0.9), rgba(255, 210, 90, 0.9));
  box-shadow: 0 12px 30px rgba(255, 123, 153, 0.3);
  color: #fff;
  font-weight: 700;
  font-size: 1rem;
  letter-spacing: 0.02em;
}

.subtitle-banner span {
  text-transform: uppercase;
  letter-spacing: 0.2em;
}

.players {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin: 2.5rem 0;
}

.actions {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
}
</style>
