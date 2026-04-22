import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import type { GameState, ThemeName, HorcruxId, RoscoLetterStatus } from '../types';
import { ROSCO_LETTERS } from '../data/roscoQuestions';
import { subscribeToState, saveState, loadCachedState, isFirebaseConfigured } from '../firebase/config';

const buildInitialRoscoStatuses = (): Record<string, RoscoLetterStatus> => {
  const s: Record<string, RoscoLetterStatus> = {};
  ROSCO_LETTERS.forEach((l) => (s[l] = 'pending'));
  return s;
};

export const INITIAL_STATE: GameState = {
  currentTheme: 'carmena',
  transitionTriggered: false,
  showTransitionModal: true,
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
  },
};

type CounterKey = 'copas' | 'aguasConGas' | 'discursosMadridCentral' | 'frotaManos';

interface GameStateContextType {
  state: GameState;
  setTheme: (theme: ThemeName) => void;
  triggerTransition: () => void;
  setThemeWithModal: (theme: ThemeName, withModal: boolean) => void;
  setShowTransitionModal: (show: boolean) => void;
  toggleHorcrux: (id: HorcruxId) => void;
  setHorcrux: (id: HorcruxId, value: boolean) => void;
  updateRoscoStatus: (letter: string, status: RoscoLetterStatus) => void;
  setCurrentLetter: (letter: string) => void;
  revealHint: (letter: string, charIndex: number) => void;
  useHintForLetter: (letter: string, answerLength: number) => number | null;
  toggleRoscoPause: () => void;
  setRoscoComplete: () => void;
  addBonusHint: () => void;
  resetRoscoLetter: (letter: string) => void;
  resetRosco: () => void;
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

export function GameStateProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<GameState>(() => {
    const cached = loadCachedState();
    return cached || INITIAL_STATE;
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Subscribe to Firebase or localStorage changes
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = subscribeToState((firebaseState) => {
        if (firebaseState) {
          // Merge with defaults to handle missing fields
          const merged = {
            ...INITIAL_STATE,
            ...firebaseState,
            horcruxes: { ...INITIAL_STATE.horcruxes, ...firebaseState.horcruxes },
            rosco: {
              ...INITIAL_STATE.rosco,
              ...firebaseState.rosco,
              statuses: { ...INITIAL_STATE.rosco.statuses, ...(firebaseState.rosco?.statuses || {}) },
              revealedHints: firebaseState.rosco?.revealedHints || {},
            },
            counters: { ...INITIAL_STATE.counters, ...(firebaseState.counters || {}) },
          };
          setState(merged);
        }
      });
      return unsub;
    } else {
      const handler = (e: StorageEvent) => {
        if (e.key === 'gameState' && e.newValue) {
          setState(JSON.parse(e.newValue));
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

  const setShowTransitionModal = useCallback((show: boolean) => {
    update((s) => ({ ...s, showTransitionModal: show }));
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
        toggleHorcrux,
        setHorcrux,
        updateRoscoStatus,
        setCurrentLetter,
        revealHint,
        useHintForLetter,
        toggleRoscoPause,
        setRoscoComplete,
        addBonusHint,
        resetRoscoLetter,
        resetRosco,
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
  if (!ctx) throw new Error('useGameState must be used within GameStateProvider');
  return ctx;
}
