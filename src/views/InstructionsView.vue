<script setup lang="ts">
import { useRouter } from 'vue-router';
import AppCard from '../components/ui/AppCard.vue';
import AppButton from '../components/ui/AppButton.vue';

const router = useRouter();
</script>

<template>
  <div class="page">
    <AppButton theme="ghost" icon="⬅️" class="back" @click="router.back()">Terug</AppButton>
    <h1>Speluitleg</h1>
    <p class="intro">
      Start een challenge, laat de spelers strijden en beloon de winnaars met een echt cadeautje. De game
      houdt optioneel scores bij en vermijdt recente challenges.
    </p>
    <div class="grid">
      <AppCard>
        <template #heading>Flow</template>
        <ol>
          <li>Ga naar Start spel.</li>
          <li>Kies “Start challenge”. Het spel kiest spelers + challenge.</li>
          <li>Timer loopt. Space = Start of Reroll. Enter = winnaars markeren.</li>
          <li>Kies 1 of meer winnaars. Confetti + cadeautje!</li>
        </ol>
      </AppCard>

      <AppCard>
        <template #heading>Bediening</template>
        <ul>
          <li>Space — Start challenge / Reroll (met cooldown)</li>
          <li>Enter — Markeer winnaar</li>
          <li>Toetsen 1-4 — Toggle winnaar per spelerslot</li>
        </ul>
      </AppCard>

      <AppCard>
        <template #heading>Tips</template>
        <ul>
          <li>Zet punten uit voor relaxte rondes.</li>
          <li>Gebruik Challenge-beheer om eigen opdrachten te importeren.</li>
          <li>Reroll heeft zachte cooldown om chaos te beperken.</li>
        </ul>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 940px;
  margin: 0 auto;
  color: #13203a;
}

.back {
  margin-bottom: 1rem;
}

h1 {
  margin: 0 0 0.5rem;
  color: #ce4d1c;
}

.intro {
  font-size: 1.1rem;
  color: #3b3561;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

ol,
ul {
  padding-left: 1.2rem;
  margin: 0;
  line-height: 1.6;
}
</style>
