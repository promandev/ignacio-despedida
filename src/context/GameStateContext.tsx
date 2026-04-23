import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { GameState, ThemeName, HorcruxId, RoscoLetterStatus } from '../types';
import { ROSCO_LETTERS } from '../data/roscoQuestions';
import { subscribeToState, saveState, loadCachedState, isFirebaseConfigured } from '../firebase/config';

const buildInitialRoscoStatuses = (): Record<string, RoscoLetterStatus> => {
  const s: Record<string, RoscoLetterStatus> = {};
  ROSCO_LETTERS.forEach((l) => (s[l] = 'pending'));
  return s;
};

const INITIAL_STATE: GameState = {
  currentTheme: 'carmena',
  transitionTriggered: false,
  showTransitionModal: true,
  showMarineroModal: true,
  forcedUserTheme: null,
  showDosChat: false,
  counters: {
    copas: 0,
    aguasConGas: 0,
    discursosMadridCentral: 0,
    frotaManos: 0,
  },
  horcruxes: {
    diario: false,
    anillo: false,
    guardapelo: false,
    copa: false,
    diadema: false,
    nagini: false,
    harry: false,
  },
  rosco: {
    statuses: buildInitialRoscoStatuses(),
    revealedHints: {},
    hintsUsed: 0,
    maxHints: 2,
    bonusHints: 0,
    currentLetter: 'A',
    isPaused: true,
    isComplete: false,
    timeRemaining: 70, // 1 min 10 sec base time
    timeBonusFromHorcruxes: 0,
  },
};

function hydrateGameState(raw: Partial<GameState> | null | undefined): GameState {
  if (!raw || typeof raw !== 'object') return INITIAL_STATE;

  return {
    ...INITIAL_STATE,
    ...raw,
    horcruxes: { ...INITIAL_STATE.horcruxes, ...(raw.horcruxes || {}) },
    rosco: {
      ...INITIAL_STATE.rosco,
      ...(raw.rosco || {}),
      statuses: { ...INITIAL_STATE.rosco.statuses, ...(raw.rosco?.statuses || {}) },
      revealedHints: raw.rosco?.revealedHints || {},
    },
    counters: { ...INITIAL_STATE.counters, ...(raw.counters || {}) },
  };
}

type CounterKey = 'copas' | 'aguasConGas' | 'discursosMadridCentral' | 'frotaManos';

interface GameStateContextType {
  state: GameState;
  setTheme: (theme: ThemeName) => void;
  triggerTransition: () => void;
  setThemeWithModal: (theme: ThemeName, withModal: boolean) => void;
  setShowTransitionModal: (show: boolean) => void;
  setShowMarineroModal: (show: boolean) => void;
  triggerMarineroTransition: () => void;
  toggleHorcrux: (id: HorcruxId) => void;
  setHorcrux: (id: HorcruxId, value: boolean) => void;
  updateRoscoStatus: (letter: string, status: RoscoLetterStatus) => void;
  setCurrentLetter: (letter: string) => void;
  revealHint: (letter: string, charIndex: number) => void;
  useHintForLetter: (letter: string, answerLength: number) => number | null;
  toggleRoscoPause: () => void;
  setRoscoComplete: () => void;
  addBonusHint: () => void;
  removeBonusHint: () => void;
  resetRoscoLetter: (letter: string) => void;
  resetRosco: () => void;
  setRoscoTimeRemaining: (seconds: number) => void;
  addRoscoTimeBonus: (seconds: number) => void;
  incrementCounter: (key: CounterKey) => void;
  decrementCounter: (key: CounterKey) => void;
  setCounter: (key: CounterKey, value: number) => void;
  batchUpdate: (patch: Partial<GameState>) => void;
  resetTransitionTriggered: () => void;
  setForcedUserTheme: (theme: ThemeName | null) => void;
  setShowDosChat: (show: boolean) => void;
  isFirebase: boolean;
}

const GameStateContext = createContext<GameStateContextType | null>(null);

const FALLBACK_CONTEXT: GameStateContextType = {
  state: INITIAL_STATE,
  setTheme: () => {},
  triggerTransition: () => {},
  setThemeWithModal: () => {},
  setShowTransitionModal: () => {},
  setShowMarineroModal: () => {},
  triggerMarineroTransition: () => {},
  toggleHorcrux: () => {},
  setHorcrux: () => {},
  updateRoscoStatus: () => {},
  setCurrentLetter: () => {},
  revealHint: () => {},
  useHintForLetter: () => null,
  toggleRoscoPause: () => {},
  setRoscoComplete: () => {},
  addBonusHint: () => {},
  removeBonusHint: () => {},
  resetRoscoLetter: () => {},
  resetRosco: () => {},
  setRoscoTimeRemaining: () => {},
  addRoscoTimeBonus: () => {},
  incrementCounter: () => {},
  decrementCounter: () => {},
  setCounter: () => {},
  batchUpdate: () => {},
  resetTransitionTriggered: () => {},
  setForcedUserTheme: () => {},
  setShowDosChat: () => {},
  isFirebase: isFirebaseConfigured,
};

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    const cached = loadCachedState();
    return hydrateGameState(cached || null);
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Subscribe to Firebase or localStorage changes
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = subscribeToState((firebaseState) => {
        if (firebaseState) {
          setState(hydrateGameState(firebaseState));
        }
      });
      return unsub;
    } else {
      const handler = (e: StorageEvent) => {
        if (e.key === 'gameState' && e.newValue) {
          try {
            setState(hydrateGameState(JSON.parse(e.newValue) as Partial<GameState>));
          } catch {
            setState(INITIAL_STATE);
          }
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }
  }, []);

  const update = useCallback((updater: (prev: GameState) => GameState) => {
    setState((prev) => {
      const next = updater(prev);
      saveState(next);
      return next;
    });
  }, []);

  const setTheme = useCallback((theme: ThemeName) => {
    update((s) => ({ ...s, currentTheme: theme }));
  }, [update]);

  const triggerTransition = useCallback(() => {
    update((s) => ({ ...s, transitionTriggered: true, currentTheme: 'slytherin' }));
  }, [update]);

  const toggleHorcrux = useCallback((id: HorcruxId) => {
    update((s) => ({
      ...s,
      horcruxes: { ...s.horcruxes, [id]: !s.horcruxes[id] },
    }));
  }, [update]);

  const setHorcrux = useCallback((id: HorcruxId, value: boolean) => {
    update((s) => ({
      ...s,
      horcruxes: { ...s.horcruxes, [id]: value },
    }));
  }, [update]);

  const updateRoscoStatus = useCallback((letter: string, status: RoscoLetterStatus) => {
    update((s) => ({
      ...s,
      rosco: {
        ...s.rosco,
        statuses: { ...s.rosco.statuses, [letter]: status },
      },
    }));
  }, [update]);

  const setCurrentLetter = useCallback((letter: string) => {
    update((s) => ({
      ...s,
      rosco: { ...s.rosco, currentLetter: letter },
    }));
  }, [update]);

  const revealHint = useCallback((letter: string, charIndex: number) => {
    update((s) => {
      const existing = s.rosco.revealedHints[letter] || [];
      if (existing.includes(charIndex)) return s;
      return {
        ...s,
        rosco: {
          ...s.rosco,
          revealedHints: {
            ...s.rosco.revealedHints,
            [letter]: [...existing, charIndex],
          },
          hintsUsed: s.rosco.hintsUsed + 1,
        },
      };
    });
  }, [update]);

  const useHintForLetter = useCallback((letter: string, answerLength: number): number | null => {
    const s = stateRef.current;
    const totalHints = s.rosco.maxHints + s.rosco.bonusHints;
    if (s.rosco.hintsUsed >= totalHints) return null;

    const existing = s.rosco.revealedHints[letter] || [];
    const available: number[] = [];
    for (let i = 0; i < answerLength; i++) {
      if (!existing.includes(i)) available.push(i);
    }
    if (available.length === 0) return null;

    const idx = available[Math.floor(Math.random() * available.length)];
    revealHint(letter, idx);
    return idx;
  }, [revealHint]);

  const toggleRoscoPause = useCallback(() => {
    update((s) => ({
      ...s,
      rosco: { ...s.rosco, isPaused: !s.rosco.isPaused },
    }));
  }, [update]);

  const setRoscoComplete = useCallback(() => {
    update((s) => ({
      ...s,
      rosco: { ...s.rosco, isComplete: true, isPaused: true },
    }));
  }, [update]);

  const addBonusHint = useCallback(() => {
    update((s) => ({
      ...s,
      rosco: { ...s.rosco, bonusHints: s.rosco.bonusHints + 1 },
    }));
  }, [update]);

  const removeBonusHint = useCallback(() => {
    update((s) => ({
      ...s,
      rosco: { ...s.rosco, bonusHints: Math.max(0, s.rosco.bonusHints - 1) },
    }));
  }, [update]);

  const resetRoscoLetter = useCallback((letter: string) => {
    update((s) => ({
      ...s,
      rosco: {
        ...s.rosco,
        statuses: { ...s.rosco.statuses, [letter]: 'pending' },
        revealedHints: { ...s.rosco.revealedHints, [letter]: [] },
      },
    }));
  }, [update]);

  const resetRosco = useCallback(() => {
    update((s) => ({
      ...s,
      rosco: INITIAL_STATE.rosco,
    }));
  }, [update]);

  const setRoscoTimeRemaining = useCallback((seconds: number) => {
    update((s) => ({
      ...s,
      rosco: { ...s.rosco, timeRemaining: Math.max(0, seconds) },
    }));
  }, [update]);

  const addRoscoTimeBonus = useCallback((seconds: number) => {
    update((s) => ({
      ...s,
      rosco: {
        ...s.rosco,
        timeRemaining: s.rosco.timeRemaining + seconds,
        timeBonusFromHorcruxes: s.rosco.timeBonusFromHorcruxes + seconds,
      },
    }));
  }, [update]);

  const setShowTransitionModal = useCallback((show: boolean) => {
    update((s) => ({ ...s, showTransitionModal: show }));
  }, [update]);

  const setShowMarineroModal = useCallback((show: boolean) => {
    update((s) => ({ ...s, showMarineroModal: show }));
  }, [update]);

  const triggerMarineroTransition = useCallback(() => {
    update((s) => ({ ...s, transitionTriggered: true, currentTheme: 'marinero' }));
  }, [update]);

  const setThemeWithModal = useCallback((theme: ThemeName, withModal: boolean) => {
    update((s) => ({ ...s, currentTheme: theme, showTransitionModal: withModal }));
  }, [update]);

  const incrementCounter = useCallback((key: CounterKey) => {
    update((s) => ({
      ...s,
      counters: { ...s.counters, [key]: s.counters[key] + 1 },
    }));
  }, [update]);

  const decrementCounter = useCallback((key: CounterKey) => {
    update((s) => ({
      ...s,
      counters: { ...s.counters, [key]: Math.max(0, s.counters[key] - 1) },
    }));
  }, [update]);

  const setCounter = useCallback((key: CounterKey, value: number) => {
    update((s) => ({
      ...s,
      counters: { ...s.counters, [key]: Math.max(0, value) },
    }));
  }, [update]);

  const batchUpdate = useCallback((patch: Partial<GameState>) => {
    update((s) => ({ ...s, ...patch }));
  }, [update]);

  const resetTransitionTriggered = useCallback(() => {
    update((s) => ({ ...s, transitionTriggered: false }));
  }, [update]);

  const setForcedUserTheme = useCallback((theme: ThemeName | null) => {
    update((s) => ({ ...s, forcedUserTheme: theme }));
  }, [update]);

  const setShowDosChat = useCallback((show: boolean) => {
    update((s) => ({ ...s, showDosChat: show }));
  }, [update]);

  return (
    <GameStateContext.Provider
      value={{
        state,
        setTheme,
        triggerTransition,
        setThemeWithModal,
        setShowTransitionModal,
        setShowMarineroModal,
        triggerMarineroTransition,
        toggleHorcrux,
        setHorcrux,
        updateRoscoStatus,
        setCurrentLetter,
        revealHint,
        useHintForLetter,
        toggleRoscoPause,
        setRoscoComplete,
        addBonusHint,
        removeBonusHint,
        resetRoscoLetter,
        resetRosco,
        setRoscoTimeRemaining,
        addRoscoTimeBonus,
        incrementCounter,
        decrementCounter,
        setCounter,
        batchUpdate,
        resetTransitionTriggered,
        setForcedUserTheme,
        setShowDosChat,
        isFirebase: isFirebaseConfigured,
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}

export function useGameState() {
  const ctx = useContext(GameStateContext);
  if (!ctx) {
    // In dev hot-reload edge cases, avoid blank-screen crashes and keep UI usable.
    console.error('useGameState called without provider; using safe fallback context.');
    return FALLBACK_CONTEXT;
  }
  return ctx;
}
