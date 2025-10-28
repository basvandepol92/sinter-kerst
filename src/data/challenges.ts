import type { Challenge } from '../types/game';

export const defaultChallenges: Challenge[] = [
  {
    id: 'klok-klap',
    title: 'Klingelende Klok',
    description:
      'Loop alsof je een bezorg-Piet bent en tik onderweg vijf decorstukken aan. De snelste wint.',
    type: 'versus',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 'koek-koers',
    title: 'Koekjes Koers',
    description: 'Balanceer een pepernoot op een lepel. Wie het verst geraakt zonder te laten vallen wint.',
    type: 'individual',
    minPlayers: 1,
    maxPlayers: 1
  },
  {
    id: 'gift-glider',
    title: 'Gift Glider',
    description:
      'Maak in duo een slee van aanwezige materialen en glijd 2 meter. Jury kiest de meest creatieve slee.',
    type: 'versus',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 'sneeuw-mime',
    title: 'Sneeuw Mime',
    description:
      'Doe een winteractiviteit in pantomime. De rest raadt. Degene die het snelst correct raadt scoort.',
    type: 'individual',
    minPlayers: 1,
    maxPlayers: 1
  },
  {
    id: 'lichtlijn',
    title: 'Lichtjeslijn',
    description:
      'Leg een snoer van lichtgevende objecten zonder dat de lijn breekt. Meest rechte lijn wint.',
    type: 'versus',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 'pakjespong',
    title: 'Pakjes Pong',
    description:
      'Versus battle: kaats een zachte kerstbal over de tafel. Laat hem niet vallen! Eerste tot 5 punten wint.',
    type: 'versus',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 'duo-dans',
    title: 'Duo Dans der Rendieren',
    description: 'Maak met zijn tweeën een korte syncro-dans op de chiptune beat. Publiek stemt.',
    type: 'versus',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 'rijm-rap',
    title: 'Rijm Rap Blitz',
    description:
      'Spit in 45 seconden een rijm over cadeaus voor iemand naar keuze. Publiek kiest de winnaar.',
    type: 'individual',
    minPlayers: 1,
    maxPlayers: 1
  },
  {
    id: 'puzzel-piet',
    title: 'Puzzel-Piet Relay',
    description:
      'Bouw in duo een mini-kersthuisje met blokken. Wissel elke 20 seconden. Klaar? Roep “Ho-Ho!”.',
    type: 'versus',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 'sok-shuffle',
    title: 'Sokken Shuffle',
    description:
      'Versus: schuif in dikke kerstsokken over de vloer en verzamel kaartjes. Meeste kaartjes wint.',
    type: 'versus',
    minPlayers: 2,
    maxPlayers: 4
  },
  {
    id: 'mystery-melodie',
    title: 'Mystery Melodie',
    description:
      'Fluit of neurie een feestnummer. Wie het lied als eerste herkent, scoort een punt.',
    type: 'individual',
    minPlayers: 1,
    maxPlayers: 1
  },
  {
    id: 'sneeuw-stapel',
    title: 'Sneeuwvlok Stapel',
    description:
      'Individueel: stapel marshmallows zo hoog mogelijk binnen de tijd. Toren om? Opnieuw beginnen.',
    type: 'individual',
    minPlayers: 1,
    maxPlayers: 1
  }
];

export default defaultChallenges;
