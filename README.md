# Sinter-kerst 2025

Party-game voor Team Milano (Julot, Flo, Tess, Bas). Gebouwd met Vue 3, Vite en Pinia. Het spel rouleert challenges, houdt scores bij en speelt feestelijke muziek en effecten af.

## Kenmerken

- **Startscherm**: logo, speler-avatars (GIF) en snelle toegang tot instellingen, challenge-beheer en uitleg.
- **Scorebord-scherm**:
  - Overzicht van alle spelers met actuele scores.
  - Pop-up voor nieuwe challenges met geanimeerde loting (eerst challengekaart, daarna spelers).
  - Reroll zonder limiet, timer-start, winnaarselectie met confetti en audio-effecten.
  - Ondersteuning voor keyboard-shortcuts en echte SinterKerst-muziek (`src/music/sinterkerst.mp3`).
- **Challenge-beheer**:
  - Filteren + zoeken in challenges.
  - CRUD, import/export van JSON.
  - Types: `Individual` (altijd solo) en `Versus` (altijd 2-4 spelers).
  - Timer-override per challenge.
- **Instellingen**:
  - Spelers in-/uitschakelen.
  - Score bijhouden, timerduur, deelnemersmodus, recente challenge-blocking, random seed.
- **Speluitleg**: korte flow, bedieningstips en suggesties.
- **Animaties & audio**:
  - Sneeuwval, confetti, timer-ring, keyboardbediening, muziek- en mute-functionaliteit.

## Installatie & scripts

```bash
npm install
npm run dev      # ontwikkelserver
npm run build    # productie-build
npm run preview  # build lokaal bekijken
npm run typecheck
```

> **Let op:** `npm run build` gebruikt een gepatchte `vue-tsc` (zie `node_modules/vue-tsc/bin/vue-tsc.js`) onder TypeScript 5.4.0.

## Projectstructuur (selectie)

```
src/
  App.vue
  assets/               # build-output via Vite
  components/
    audio/AudioToggle.vue
    decor/{SnowField,ConfettiLayer}.vue
    game/{ChallengeCard,TimerRing,WinnerSelect}.vue
    players/SpriteAvatar.vue
    ui/{AppButton,AppCard}.vue
  composables/useAudioEngine.{ts,js}
  data/challenges.ts    # standaard challenges
  router/index.ts
  stores/gameStore.{ts,js}
  views/{Splash,Game,Settings,ChallengeManager,Instructions}View.vue
  music/sinterkerst.mp3
```

### Belangrijke bestanden

- `src/views/GameView.vue`: hoofdscorebord, challenge-pop-up, timer en winnaarflow.
- `src/stores/gameStore.ts`: spelstatus, challenge-selectie, reroll, timer, scorelogica.
- `src/composables/useAudioEngine.ts`: audio-player (muziek, win-chord, timer-ping).
- `src/views/ChallengeManagerView.vue`: CRUD en import/export van challenges.
- `src/data/challenges.ts`: baseline challenge-set (solo vs versus automatisch aantal spelers).

## Assets

- Speler-GIFs (`src/images/{Julot,Flo,Tess,Bas}.gif`)
- Logo (`src/images/logo.png`)
- Achtergrond (`src/images/background.png`)
- Muziek (`src/music/sinterkerst.mp3`)

## Werkwijze bij aanpassingen

1. Voeg nieuwe challenges toe via `ChallengeManagerView` of JSON-import.
2. Zorg dat wijzigingen aan audio of timers ook in `useAudioEngine.{ts,js}` terechtkomen (beide versies updaten).
3. Houd `README.md` up-to-date na features of workflow-wijzigingen (zoals deze).

Veel plezier met Sinter-kerst 2025! 🎁🎄🎅🏻
