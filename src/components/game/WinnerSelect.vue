<script setup lang="ts">
import type { Player } from '../../types/game';

const props = defineProps<{
  players: Player[];
  modelValue: string[];
  open: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [string[]];
  confirm: [];
  close: [];
}>();

const spriteIsImage = (value: string) => value?.startsWith('/') || value?.includes('.') || value?.startsWith('data:');

const toggle = (id: string) => {
  const exists = props.modelValue.includes(id);
  if (exists) {
    emit(
      'update:modelValue',
      props.modelValue.filter((value) => value !== id)
    );
  } else {
    emit('update:modelValue', [...props.modelValue, id]);
  }
};
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="winner-overlay" @click.self="emit('close')">
      <div class="dialog">
        <h3>Wie heeft gewonnen?</h3>
        <p>Kies één of meerdere spelers. Enter = bevestigen.</p>
        <div class="grid">
          <button
            v-for="player in players"
            :key="player.id"
            type="button"
            class="chip"
            :class="{ active: modelValue.includes(player.id) }"
            @click="toggle(player.id)"
          >
            <span class="sprite" :class="{ image: spriteIsImage(player.sprite) }">
              <img
                v-if="spriteIsImage(player.sprite)"
                :src="player.sprite"
                :alt="`Avatar van ${player.name}`"
                loading="lazy"
                decoding="async"
              />
              <span v-else>{{ player.sprite }}</span>
            </span>
            <strong>{{ player.name }}</strong>
          </button>
        </div>
        <div class="actions">
          <button type="button" class="ghost" @click="emit('close')">Annuleren</button>
          <button type="button" class="primary" :disabled="!modelValue.length" @click="emit('confirm')">
            Bevestig winnaars
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.winner-overlay {
  position: fixed;
  inset: 0;
  background: var(--winner-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 20;
  padding: 1rem;
}

.dialog {
  background: var(--dialog-bg);
  padding: 2rem;
  border-radius: 28px;
  width: min(480px, 100%);
  box-shadow: 0 20px 60px rgba(15, 19, 36, 0.3);
  border: 1px solid var(--overlay-card-border);
}

h3 {
  margin: 0 0 0.5rem;
}

p {
  margin-top: 0;
  color: var(--dialog-muted);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.8rem;
  margin: 1.2rem 0;
}

.chip {
  border: none;
  border-radius: 18px;
  padding: 0.8rem;
  font-size: 1rem;
  cursor: pointer;
  background: var(--chip-surface);
  display: flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 700;
  transition: transform 0.15s ease, background 0.15s ease;
}

.chip.active {
  background: var(--chip-surface-active);
  transform: translateY(-2px);
}

.sprite {
  width: 2.4rem;
  height: 2.4rem;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.sprite.image {
  font-size: 0;
}

.sprite img {
  height: 100%;
  object-fit: cover;
}

.actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
}

.actions .ghost,
.actions .primary {
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.4rem;
  font-weight: 700;
  cursor: pointer;
}

.actions .ghost {
  background: var(--dialog-ghost);
}

.actions .primary {
  background: linear-gradient(120deg, #ff9b73, #ffd25a);
}

.actions .primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

:global(.dark-mode) .dialog {
  color: var(--page-text);
  backdrop-filter: blur(16px);
}
</style>
