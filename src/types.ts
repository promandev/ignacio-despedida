export type ThemeName = 'carmena' | 'slytherin';

export type HorcruxId = 'diario' | 'anillo' | 'guardapelo' | 'copa' | 'diadema' | 'nagini' | 'harry';

export type RoscoLetterStatus = 'pending' | 'correct' | 'wrong' | 'skipped';

export interface HorcruxState {
  diario: boolean;
  anillo: boolean;
  guardapelo: boolean;
  copa: boolean;
  diadema: boolean;
  nagini: boolean;
  harry: boolean;
}

export interface RoscoState {
  statuses: Record<string, RoscoLetterStatus>;
  revealedHints: Record<string, number[]>;
  hintsUsed: number;
  maxHints: number;
  bonusHints: number;
  currentLetter: string;
  isPaused: boolean;
  isComplete: boolean;
}

export interface CountersState {
  copas: number;
  aguasConGas: number;
  discursosMadridCentral: number;
  frotaManos: number;
}

export interface GameState {
  currentTheme: ThemeName;
  transitionTriggered: boolean;
  showTransitionModal: boolean;
  forcedUserTheme: ThemeName | null;
  horcruxes: HorcruxState;
  rosco: RoscoState;
  counters: CountersState;
}

export interface RoscoQuestion {
  letter: string;
  hint: string;
  answer: string;
}

export interface Horcrux {
  id: HorcruxId;
  name: string;
  emoji: string;
  challenge: string;
  badgeImage: string;
  order: number;
}
