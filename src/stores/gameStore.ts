import { computed, reactive, ref } from 'vue';
import { defineStore } from 'pinia';
import type { Challenge, ChallengeRecord, GameSettings, ParticipantsMode, Player } from '../types/game';
import defaultChallenges from '../data/challenges';
import JulotGif from '../images/Julot.png';
import FloGif from '../images/Flo.png';
import TessGif from '../images/Tess.png';
import BasGif from '../images/Bas.png';

type GamePhase = 'idle' | 'ready' | 'running' | 'timeup' | 'complete';

const playerPalette: Player[] = [
  {
    id: 'julot',
    name: 'Julot',
    color: '#ff8a8a',
    accent: '#ffd1d1',
    sprite: JulotGif,
    enabled: true,
    score: 0
  },
  {
    id: 'flo',
    name: 'Flo',
    color: '#6dd5ff',
    accent: '#c9f1ff',
    sprite: FloGif,
    enabled: true,
    score: 0
  },
  {
    id: 'tess',
    name: 'Tess',
    color: '#ffbe3d',
    accent: '#ffe3a8',
    sprite: TessGif,
    enabled: true,
    score: 0
  },
  {
    id: 'bas',
    name: 'Bas',
    color: '#c98bff',
    accent: '#f1d9ff',
    sprite: BasGif,
    enabled: true,
    score: 0
  }
];

const defaultSettings: GameSettings = {
  keepScore: true,
  timerSeconds: 75,
  participantsMode: 'auto',
  forceTimerSound: true,
  recentChallengeWindow: 4,
  avoidRepeats: true,
  maxAutoPlayers: 4
};

const rerollCooldownMs = 0;

const createMulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const clonePlayers = () => playerPalette.map((player) => ({ ...player }));
const cloneChallenges = () => defaultChallenges.map((challenge) => ({ ...challenge }));

export const useGameStore = defineStore('game', () => {
  const players = ref<Player[]>(clonePlayers());
  const challenges = ref<Challenge[]>(cloneChallenges());
  const challengeHistory = ref<ChallengeRecord[]>([]);
  const settings = reactive<GameSettings>({ ...defaultSettings });

  const activeChallengeId = ref<string | null>(null);
  const activePlayerIds = ref<string[]>([]);
  const gamePhase = ref<GamePhase>('idle');
  const timer = reactive({
    running: false,
    remaining: settings.timerSeconds,
    endsAt: 0
  });
  const rerollAvailableAt = ref(0);
  const recentChallengeIds = ref<string[]>([]);
  const winnerBurst = ref(0);
  const seedValue = ref<number>(Date.now() % 100_000);
  let seededRandom = createMulberry32(seedValue.value);

  const scoreboard = computed(() => {
    return [...players.value].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  });

  const enabledPlayers = computed(() => players.value.filter((p) => p.enabled));

  const activeChallenge = computed(() =>
    challenges.value.find((c) => c.id === activeChallengeId.value) ?? null
  );

  const rerollReady = computed(() => Date.now() >= rerollAvailableAt.value);

  const getActiveDuration = () =>
    activeChallenge.value?.timerOverrideSeconds ?? settings.timerSeconds;

  const currentTimerLimit = computed(() => getActiveDuration());

  const randomFloat = () => {
    return seededRandom();
  };

  const shuffle = <T>(input: T[]): T[] => {
    const arr = [...input];
    for (let i = arr.length - 1; i > 0; i -= 1) {
      const j = Math.floor(randomFloat() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const determineGroupSize = (mode: ParticipantsMode): number => {
    const poolSize = enabledPlayers.value.length;
    if (poolSize === 0) {
      return 0;
    }

    switch (mode) {
      case 'solo':
        return 1;
      case 'duo':
        return Math.min(2, poolSize);
      case 'trio':
        return Math.min(3, poolSize);
      case 'all':
        return poolSize;
      default:
        if (poolSize === 1) return 1;
        const maxAuto = Math.min(settings.maxAutoPlayers, poolSize);
        const count = Math.floor(randomFloat() * maxAuto) + 1;
        return Math.min(Math.max(count, 1), poolSize);
    }
  };

  const pickPlayers = (count: number): string[] => {
    if (count === 0) return [];
    const pool = enabledPlayers.value;
    if (pool.length <= count) {
      return pool.map((p) => p.id);
    }
    return shuffle(pool)
      .slice(0, count)
      .map((p) => p.id);
  };

  const eligibleChallenges = (availableCount: number) => {
    let pool = challenges.value.filter((challenge) => availableCount >= challenge.minPlayers);
    if (settings.avoidRepeats && settings.recentChallengeWindow > 0) {
      pool = pool.filter((challenge) => !recentChallengeIds.value.includes(challenge.id));
    }
    if (pool.length === 0) {
      pool = challenges.value.filter((challenge) => availableCount >= challenge.minPlayers);
    }
    return pool;
  };

  const pushRecentChallenge = (challengeId: string) => {
    if (!settings.avoidRepeats || settings.recentChallengeWindow <= 0) {
      return;
    }
    recentChallengeIds.value.push(challengeId);
    while (recentChallengeIds.value.length > settings.recentChallengeWindow) {
      recentChallengeIds.value.shift();
    }
  };

  const removeRecent = (challengeId: string | null) => {
    if (!challengeId) return;
    const idx = recentChallengeIds.value.indexOf(challengeId);
    if (idx !== -1) {
      recentChallengeIds.value.splice(idx, 1);
    }
  };

  const resolveParticipantCount = (challenge: Challenge, desired: number) => {
    const maxAllowed = Math.min(challenge.maxPlayers, enabledPlayers.value.length);
    const minRequired = challenge.minPlayers;
    if (maxAllowed < minRequired) return null;
    let count = desired;
    if (count <= 0) {
      count = minRequired;
    }
    count = Math.min(count, maxAllowed);
    count = Math.max(count, minRequired);
    return count;
  };

  const rollChallenge = () => {
    const availablePlayers = enabledPlayers.value.length;
    if (!availablePlayers) {
      activeChallengeId.value = null;
      activePlayerIds.value = [];
      return null;
    }
    const desiredPlayers = determineGroupSize(settings.participantsMode);
    const pool = eligibleChallenges(availablePlayers);
    if (pool.length === 0) {
      activeChallengeId.value = null;
      activePlayerIds.value = [];
      return null;
    }

    const chosen = pool[Math.floor(randomFloat() * pool.length)];
    const participantCount = resolveParticipantCount(chosen, desiredPlayers);
    if (!participantCount) {
      activeChallengeId.value = null;
      activePlayerIds.value = [];
      return null;
    }
    const selection = pickPlayers(participantCount);
    removeRecent(activeChallengeId.value);
    activeChallengeId.value = chosen.id;
    pushRecentChallenge(chosen.id);
    activePlayerIds.value = selection;
    timer.running = false;
    const duration = chosen.timerOverrideSeconds ?? settings.timerSeconds;
    timer.remaining = duration;
    timer.endsAt = 0;
    gamePhase.value = 'ready';
    return chosen;
  };

  const startOrResumeChallenge = () => {
    if (!activeChallenge.value || gamePhase.value === 'complete' || gamePhase.value === 'timeup') {
      rollChallenge();
    }
    if (!activeChallenge.value) {
      return false;
    }
    const duration = getActiveDuration();
    timer.remaining = duration;
    timer.endsAt = performance.now() + duration * 1000;
    timer.running = true;
    gamePhase.value = 'running';
    return true;
  };

  const reroll = () => {
    if (!rerollReady.value) {
      return false;
    }
    rollChallenge();
    rerollAvailableAt.value = Date.now() + rerollCooldownMs;
    gamePhase.value = 'ready';
    return true;
  };

  const markWinners = (winnerIds: string[]) => {
    if (!winnerIds.length || !activeChallenge.value) return;
    const validWinnerIds = winnerIds.filter((id) => activePlayerIds.value.includes(id));
    if (!validWinnerIds.length) return;

    if (settings.keepScore) {
      players.value = players.value.map((player) =>
        validWinnerIds.includes(player.id) ? { ...player, score: player.score + 1 } : player
      );
    }

    challengeHistory.value.push({
      challengeId: activeChallenge.value.id,
      playerIds: [...activePlayerIds.value],
      winnerIds: [...validWinnerIds],
      timestamp: Date.now()
    });

    timer.running = false;
    timer.remaining = 0;
    timer.endsAt = 0;
    gamePhase.value = 'complete';
    winnerBurst.value += 1;
  };

  const tickTimer = () => {
    if (!timer.running) return;
    const remainingMs = timer.endsAt - performance.now();
    timer.remaining = Math.max(0, remainingMs / 1000);
    if (timer.remaining <= 0) {
      timer.running = false;
      timer.remaining = 0;
      gamePhase.value = 'timeup';
    }
  };

  const resetScores = () => {
    players.value = players.value.map((player) => ({ ...player, score: 0 }));
  };

  const togglePlayer = (id: string) => {
    players.value = players.value.map((player) =>
      player.id === id ? { ...player, enabled: !player.enabled } : player
    );
  };

  const updatePlayer = (id: string, payload: Partial<Player>) => {
    players.value = players.value.map((player) =>
      player.id === id ? { ...player, ...payload } : player
    );
  };

  const setTimerSeconds = (value: number) => {
    settings.timerSeconds = Math.max(10, value);
    if (!activeChallenge.value?.timerOverrideSeconds && !timer.running) {
      timer.remaining = settings.timerSeconds;
    }
  };

  const setParticipantsMode = (mode: ParticipantsMode) => {
    settings.participantsMode = mode;
  };

  const setMaxAutoPlayers = (value: number) => {
    settings.maxAutoPlayers = Math.max(1, Math.min(value, players.value.length || 1));
  };

  const setKeepScore = (value: boolean) => {
    settings.keepScore = value;
  };

  const setRecentWindow = (value: number) => {
    settings.recentChallengeWindow = Math.max(0, value);
    recentChallengeIds.value = recentChallengeIds.value.slice(-settings.recentChallengeWindow);
  };

  const setAvoidRepeats = (value: boolean) => {
    settings.avoidRepeats = value;
  };

  const upsertChallenge = (payload: Challenge) => {
    const exists = challenges.value.findIndex((challenge) => challenge.id === payload.id);
    if (exists === -1) {
      challenges.value = [...challenges.value, payload];
    } else {
      challenges.value.splice(exists, 1, payload);
    }
  };

  const deleteChallenge = (id: string) => {
    challenges.value = challenges.value.filter((challenge) => challenge.id !== id);
    if (activeChallengeId.value === id) {
      activeChallengeId.value = null;
      activePlayerIds.value = [];
      gamePhase.value = 'idle';
    }
  };

  const importChallenges = (payload: Challenge[]) => {
    challenges.value = payload;
    activeChallengeId.value = null;
    activePlayerIds.value = [];
    recentChallengeIds.value = [];
    gamePhase.value = 'idle';
  };

  const setSeed = (seed: number) => {
    seedValue.value = seed;
    seededRandom = createMulberry32(seedValue.value);
  };

  const randomizeSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000));
  };

  const clearHistory = () => {
    challengeHistory.value = [];
  };

  const resetGame = () => {
    activeChallengeId.value = null;
    activePlayerIds.value = [];
    timer.running = false;
    timer.remaining = settings.timerSeconds;
    timer.endsAt = 0;
    gamePhase.value = 'idle';
  };

  return {
    // state
    players,
    challenges,
    challengeHistory,
    settings,
    activeChallengeId,
    activePlayerIds,
    activeChallenge,
    gamePhase,
    timer,
    rerollAvailableAt,
    rerollReady,
    winnerBurst,
    scoreboard,
    seedValue,
    currentTimerLimit,

    // getters
    enabledPlayers,

    // actions
    rollChallenge,
    startOrResumeChallenge,
    reroll,
    markWinners,
    tickTimer,
    resetScores,
    togglePlayer,
    updatePlayer,
    setTimerSeconds,
    setParticipantsMode,
    setMaxAutoPlayers,
    setKeepScore,
    setRecentWindow,
    setAvoidRepeats,
    upsertChallenge,
    deleteChallenge,
    importChallenges,
    randomizeSeed,
    setSeed,
    clearHistory,
    resetGame
  };
});
