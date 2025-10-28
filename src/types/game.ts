export type ChallengeType = 'individual' | 'versus';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: ChallengeType;
  minPlayers: number;
  maxPlayers: number;
  timerOverrideSeconds?: number | null;
}

export interface Player {
  id: string;
  name: string;
  color: string;
  accent: string;
  sprite: string;
  enabled: boolean;
  score: number;
}

export type ParticipantsMode = 'auto' | 'solo' | 'duo' | 'trio' | 'all';

export interface GameSettings {
  keepScore: boolean;
  timerSeconds: number;
  participantsMode: ParticipantsMode;
  forceTimerSound: boolean;
  recentChallengeWindow: number;
  avoidRepeats: boolean;
  maxAutoPlayers: number;
  darkMode: boolean;
}

export interface ChallengeRecord {
  challengeId: string;
  playerIds: string[];
  winnerIds: string[];
  timestamp: number;
}
