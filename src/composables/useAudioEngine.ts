import { ref } from 'vue';
import musicUrl from '../music/sinterkerst.mp3';

const context = ref<AudioContext | null>(null);
const masterGain = ref<GainNode | null>(null);
const musicSource = ref<AudioBufferSourceNode | null>(null);
const musicBuffer = ref<AudioBuffer | null>(null);
const isMuted = ref(false);

const ensureContext = async () => {
  if (!context.value) {
    context.value = new AudioContext();
    masterGain.value = context.value.createGain();
    masterGain.value.gain.value = 0.15;
    masterGain.value.connect(context.value.destination);
  }
  if (context.value.state === 'suspended') {
    await context.value.resume();
  }
  return context.value;
};

const masterVolume = () => {
  if (!masterGain.value) return;
  masterGain.value.gain.value = isMuted.value ? 0 : 0.15;
};

const playTone = async (frequency: number, duration = 0.2, volume = 0.12) => {
  const ctx = await ensureContext();
  if (!masterGain.value) {
    return;
  }

  const oscillator = ctx.createOscillator();
  const gainNode = ctx.createGain();

  oscillator.type = 'square';
  oscillator.frequency.value = frequency;

  gainNode.gain.value = isMuted.value ? 0 : volume;

  oscillator.connect(gainNode).connect(masterGain.value);

  const now = ctx.currentTime;
  oscillator.start(now);
  oscillator.stop(now + duration);
};

const loadMusic = async () => {
  if (musicBuffer.value) return musicBuffer.value;
  const ctx = await ensureContext();
  const response = await fetch(musicUrl);
  const arrayBuffer = await response.arrayBuffer();
  musicBuffer.value = await ctx.decodeAudioData(arrayBuffer);
  return musicBuffer.value;
};

const startLoop = async () => {
  const ctx = await ensureContext();
  const buffer = await loadMusic();
  if (!buffer || !masterGain.value) return;
  if (musicSource.value) {
    musicSource.value.stop();
    musicSource.value.disconnect();
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  source.connect(masterGain.value);
  source.start(0);
  musicSource.value = source;
  masterVolume();
};

const stopLoop = () => {
  if (musicSource.value) {
    musicSource.value.stop();
    musicSource.value.disconnect();
    musicSource.value = null;
  }
};

const playWinChord = () => {
  const intervals = [0, 4, 7, 12];
  intervals.forEach((interval, idx) => {
    window.setTimeout(() => {
      playTone(523.25 * Math.pow(2, interval / 12), 0.25, 0.18);
    }, idx * 90);
  });
};

const playTimerPing = () => {
  playTone(880, 0.15, 0.1);
};

const setMuted = (value: boolean) => {
  isMuted.value = value;
  masterVolume();
};

export const useAudioEngine = () => {
  return {
    isMuted,
    ensureContext,
    setMuted,
    startLoop,
    stopLoop,
    playWinChord,
    playTimerPing
  };
};
