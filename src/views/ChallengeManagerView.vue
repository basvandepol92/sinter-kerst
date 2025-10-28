<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import AppCard from '../components/ui/AppCard.vue';
import AppButton from '../components/ui/AppButton.vue';
import { useGameStore } from '../stores/gameStore';
import type { Challenge, ChallengeType } from '../types/game';

const store = useGameStore();
const router = useRouter();

const filterType = ref<'all' | ChallengeType>('all');
const search = ref('');

const defaultForm: Challenge = {
  id: '',
  title: '',
  description: '',
  type: 'individual',
  minPlayers: 1,
  maxPlayers: 1,
  timerOverrideSeconds: null
};

const form = reactive<Challenge>({ ...defaultForm });
const editingId = ref<string | null>(null);
const formErrors = ref<string>('');

const filteredChallenges = computed(() => {
  return store.challenges.filter((challenge) => {
    const passType = filterType.value === 'all' || challenge.type === filterType.value;
    const term = search.value.trim().toLowerCase();
    const passSearch =
      term === '' ||
      challenge.title.toLowerCase().includes(term) ||
      challenge.description.toLowerCase().includes(term);
    return passType && passSearch;
  });
});

const resetForm = () => {
  Object.assign(form, {
    ...defaultForm,
    id: `custom-${Date.now()}`
  });
  editingId.value = null;
  formErrors.value = '';
};

resetForm();

const editChallenge = (challenge: Challenge) => {
  Object.assign(form, {
    ...challenge,
    minPlayers: challenge.type === 'individual' ? 1 : 2,
    maxPlayers: challenge.type === 'individual' ? 1 : 4
  });
  if (form.timerOverrideSeconds === undefined) {
    form.timerOverrideSeconds = null;
  }
  editingId.value = challenge.id;
};

const validateForm = () => {
  if (!form.id.trim() || !form.title.trim()) return 'Id en titel zijn verplicht.';
  if (!form.description.trim()) return 'Beschrijving ontbreekt.';
  return '';
};

const prepareChallenge = (challenge: Challenge): Challenge => {
  if (challenge.type === 'individual') {
    return {
      ...challenge,
      minPlayers: 1,
      maxPlayers: 1,
      timerOverrideSeconds: challenge.timerOverrideSeconds ?? null
    };
  }
  return {
    ...challenge,
    minPlayers: 2,
    maxPlayers: 4,
    timerOverrideSeconds: challenge.timerOverrideSeconds ?? null
  };
};

const saveChallenge = () => {
  const error = validateForm();
  if (error) {
    formErrors.value = error;
    return;
  }
  store.upsertChallenge(prepareChallenge({ ...form }));
  formErrors.value = '';
  resetForm();
};

const deleteChallenge = (id: string) => {
  if (confirm('Challenge verwijderen?')) {
    store.deleteChallenge(id);
  }
};

const isValidChallenge = (entry: any): entry is Challenge => {
  if (!entry || typeof entry !== 'object') return false;
  return (
    typeof entry.id === 'string' &&
    typeof entry.title === 'string' &&
    typeof entry.description === 'string' &&
    typeof entry.type === 'string' &&
    typeof entry.minPlayers === 'number' &&
    typeof entry.maxPlayers === 'number' &&
    (entry.timerOverrideSeconds === undefined ||
      entry.timerOverrideSeconds === null ||
      typeof entry.timerOverrideSeconds === 'number')
  );
};

const onImport = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (!target.files?.length) return;
  const file = target.files[0];
  const text = await file.text();
  try {
    const payload = JSON.parse(text) as Challenge[];
    if (!Array.isArray(payload) || !payload.every((item) => isValidChallenge(item))) {
      throw new Error('invalid');
    }
    const cleaned = payload.map((challenge) => prepareChallenge(challenge));
    store.importChallenges(cleaned);
  } catch (error) {
    alert('JSON ongeldig');
  } finally {
    target.value = '';
  }
};

const exportJson = () => {
  const data = JSON.stringify(store.challenges, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sinter-kerst-challenges.json';
  link.click();
  URL.revokeObjectURL(url);
};

const handleTimerOverrideInput = (event: Event) => {
  const value = (event.target as HTMLInputElement).value;
  if (value === '') {
    form.timerOverrideSeconds = null;
    return;
  }
  const parsed = Number(value);
  form.timerOverrideSeconds = Number.isFinite(parsed) ? Math.max(5, Math.floor(parsed)) : null;
};

watch(
  () => form.type,
  (type) => {
    if (type === 'individual') {
      form.minPlayers = 1;
      form.maxPlayers = 1;
    } else {
      form.minPlayers = 2;
      form.maxPlayers = 4;
    }
  }
);
</script>

<template>
  <div class="page">
    <AppButton theme="ghost" icon="⬅️" class="back" @click="router.back()">Terug</AppButton>
    <h1>Challenge-beheer</h1>
    <div class="toolbar">
      <input v-model="search" type="search" placeholder="Zoek..." />
      <div class="filters">
        <select v-model="filterType">
          <option value="all">Alle types</option>
          <option value="individual">Individual</option>
          <option value="versus">Versus</option>
        </select>
      </div>
      <div class="io">
        <AppButton size="sm" theme="ghost" icon="➕" @click="resetForm()">Nieuwe challenge</AppButton>
        <label class="import">
          Import JSON
          <input type="file" accept="application/json" @change="onImport" />
        </label>
        <AppButton size="sm" theme="ghost" @click="exportJson()">Exporteren</AppButton>
      </div>
    </div>

    <div class="layout">
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Titel</th>
              <th>Type</th>
              <th>Timer</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="challenge in filteredChallenges" :key="challenge.id">
              <td>{{ challenge.title }}</td>
              <td>{{ challenge.type === 'individual' ? 'Individual (solo)' : 'Versus (2-4)' }}</td>
              <td>
                <span v-if="challenge.timerOverrideSeconds">{{ challenge.timerOverrideSeconds }}s</span>
                <span v-else>Standaard</span>
              </td>
              <td class="actions">
                <button @click="editChallenge(challenge)">Bewerken</button>
                <button class="danger" @click="deleteChallenge(challenge.id)">✖</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <AppCard>
        <template #heading>{{ editingId ? 'Challenge bewerken' : 'Nieuwe challenge' }}</template>
        <form class="form" @submit.prevent="saveChallenge">
          <label>
            Titel
            <input v-model="form.title" required />
          </label>
          <label>
            Beschrijving
            <textarea v-model="form.description" required rows="3" />
          </label>
          <label>
            Type
            <select v-model="form.type">
              <option value="individual">Individual</option>
              <option value="versus">Versus</option>
            </select>
          </label>
          <p class="hint">Individual = 1 speler · Versus = 2-4 spelers</p>
          <label>
            Timer override (optioneel, seconden)
            <input
              type="number"
              min="5"
              :value="form.timerOverrideSeconds ?? ''"
              @input="handleTimerOverrideInput($event)"
              placeholder="Bijv. 60"
            />
            <small class="hint">Laat leeg om de timer uit Instellingen te gebruiken.</small>
          </label>

          <p v-if="formErrors" class="error">{{ formErrors }}</p>

          <div class="form-actions">
            <AppButton type="button" theme="ghost" size="sm" @click="resetForm()">Leegmaken</AppButton>
            <AppButton size="sm" type="submit">
              {{ editingId ? 'Opslaan' : 'Toevoegen' }}
            </AppButton>
          </div>
        </form>
      </AppCard>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1200px;
  margin: 0 auto;
  color: inherit;
}

.back {
  margin-bottom: 1rem;
}

.toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters {
  display: flex;
  gap: 0.6rem;
}

input[type='search'],
select {
  border-radius: 14px;
  border: 1px solid var(--input-border);
  padding: 0.5rem 0.9rem;
  font-size: 1rem;
  background: var(--form-input-bg);
  color: inherit;
}

.io {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.import {
  position: relative;
  overflow: hidden;
  border-radius: 999px;
  padding: 0.5rem 1rem;
  background: var(--import-bg);
  font-weight: 700;
  cursor: pointer;
}

.import input {
  position: absolute;
  inset: 0;
  opacity: 0;
  cursor: pointer;
}

.layout {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 1.5rem;
}

.table-wrapper {
  background: var(--table-bg);
  border-radius: 24px;
  padding: 1rem;
  box-shadow: var(--table-shadow);
  overflow: auto;
  max-height: 70vh;
  border: 1px solid var(--surface-panel-border);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.95rem;
}

th {
  text-align: left;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.15em;
  color: var(--table-head-color);
}

td,
th {
  padding: 0.6rem;
}

tbody tr:nth-child(even) {
  background: var(--table-row-alt);
}

.actions {
  display: flex;
  gap: 0.4rem;
}

.actions button {
  border: none;
  border-radius: 999px;
  padding: 0.3rem 0.8rem;
  cursor: pointer;
}

.actions .danger {
  background: var(--danger-bg);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.form label {
  font-weight: 700;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  font-size: 0.9rem;
}

.form input,
.form textarea,
.form select {
  border-radius: 12px;
  border: 1px solid var(--input-border);
  padding: 0.45rem 0.7rem;
  font-size: 0.95rem;
  background: var(--form-input-bg);
  color: inherit;
}

.columns {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.error {
  color: #d92f5b;
  font-weight: 700;
}

.hint {
  font-size: 0.75rem;
  color: var(--text-muted);
}

:global(.dark-mode) .table-wrapper {
  backdrop-filter: blur(12px);
}

@media (max-width: 960px) {
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
