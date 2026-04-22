import { useState, useCallback, useMemo } from 'react';
import { roscoQuestions, ROSCO_LETTERS } from '../data/roscoQuestions';
import { useGameState } from '../context/GameStateContext';
import type { RoscoQuestion } from '../types';

// Normalize for comparison: lowercase, trim
function normalize(s: string): string {
  return s.toLowerCase().trim();
}

// Get letter-only indices from answer (characters that user must type)
function getTypableIndices(answer: string): number[] {
  const indices: number[] = [];
  for (let i = 0; i < answer.length; i++) {
    const ch = answer[i];
    if (/[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/i.test(ch)) {
      indices.push(i);
    }
  }
  return indices;
}

export function useRosco() {
  const {
    state,
    updateRoscoStatus,
    setCurrentLetter,
    useHintForLetter,
    toggleRoscoPause,
    setRoscoComplete,
  } = useGameState();

  const rosco = state.rosco;
  const [userInputs, setUserInputs] = useState<Record<string, string[]>>({});

  const currentQuestion: RoscoQuestion | undefined = useMemo(
    () => roscoQuestions.find((q) => q.letter === rosco.currentLetter),
    [rosco.currentLetter]
  );

  const getCurrentInput = useCallback(
    (letter: string): string[] => {
      if (userInputs[letter]) return userInputs[letter];
      const q = roscoQuestions.find((q) => q.letter === letter);
      if (!q) return [];
      return new Array(q.answer.length).fill('');
    },
    [userInputs]
  );

  const setCharAt = useCallback(
    (letter: string, index: number, char: string) => {
      setUserInputs((prev) => {
        const q = roscoQuestions.find((q) => q.letter === letter);
        if (!q) return prev;
        const current = prev[letter] || new Array(q.answer.length).fill('');
        const next = [...current];
        next[index] = char;
        return { ...prev, [letter]: next };
      });
    },
    []
  );

  const checkAnswer = useCallback(
    (letter: string): boolean => {
      const q = roscoQuestions.find((q) => q.letter === letter);
      if (!q) return false;
      const input = userInputs[letter] || [];
      const userAnswer = q.answer
        .split('')
        .map((ch, i) => {
          if (/[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/.test(ch)) {
            return input[i] || '';
          }
          return ch;
        })
        .join('');
      return normalize(userAnswer) === normalize(q.answer);
    },
    [userInputs]
  );

  const submitAnswer = useCallback(
    (letter: string) => {
      const isCorrect = checkAnswer(letter);
      updateRoscoStatus(letter, isCorrect ? 'correct' : 'wrong');

      // Move to next pending letter
      const nextLetter = findNextPending(letter);
      if (nextLetter) {
        setCurrentLetter(nextLetter);
      } else {
        setRoscoComplete();
      }
    },
    [checkAnswer, updateRoscoStatus, setCurrentLetter, setRoscoComplete]
  );

  const skipLetter = useCallback(
    (letter: string) => {
      if (rosco.statuses[letter] === 'pending') {
        updateRoscoStatus(letter, 'skipped');
      }
      const nextLetter = findNextPending(letter, true);
      if (nextLetter) {
        setCurrentLetter(nextLetter);
      } else {
        // Check if there are skipped letters to revisit
        const skippedLetter = findNextSkipped(letter);
        if (skippedLetter) {
          updateRoscoStatus(skippedLetter, 'pending');
          setCurrentLetter(skippedLetter);
        } else {
          setRoscoComplete();
        }
      }
    },
    [rosco.statuses, updateRoscoStatus, setCurrentLetter, setRoscoComplete]
  );

  const requestHint = useCallback((): number | null => {
    if (!currentQuestion) return null;
    const typableIndices = getTypableIndices(currentQuestion.answer);
    const revealed = rosco.revealedHints[rosco.currentLetter] || [];
    const availableForHint = typableIndices.filter((i) => !revealed.includes(i));
    if (availableForHint.length === 0) return null;
    return useHintForLetter(rosco.currentLetter, currentQuestion.answer.length);
  }, [currentQuestion, rosco, useHintForLetter]);

  const findNextPending = (fromLetter: string, includeSkipped = false): string | null => {
    const idx = ROSCO_LETTERS.indexOf(fromLetter);
    for (let i = 1; i < ROSCO_LETTERS.length; i++) {
      const nextIdx = (idx + i) % ROSCO_LETTERS.length;
      const l = ROSCO_LETTERS[nextIdx];
      const st = rosco.statuses[l];
      if (st === 'pending' || (includeSkipped && st === 'skipped')) return l;
    }
    return null;
  };

  const findNextSkipped = (fromLetter: string): string | null => {
    const idx = ROSCO_LETTERS.indexOf(fromLetter);
    for (let i = 1; i < ROSCO_LETTERS.length; i++) {
      const nextIdx = (idx + i) % ROSCO_LETTERS.length;
      const l = ROSCO_LETTERS[nextIdx];
      if (rosco.statuses[l] === 'skipped') return l;
    }
    return null;
  };

  const stats = useMemo(() => {
    const values = Object.values(rosco.statuses);
    return {
      correct: values.filter((v) => v === 'correct').length,
      wrong: values.filter((v) => v === 'wrong').length,
      pending: values.filter((v) => v === 'pending').length,
      skipped: values.filter((v) => v === 'skipped').length,
      total: ROSCO_LETTERS.length,
    };
  }, [rosco.statuses]);

  const hintsRemaining = rosco.maxHints + rosco.bonusHints - rosco.hintsUsed;

  return {
    rosco,
    currentQuestion,
    getCurrentInput,
    setCharAt,
    submitAnswer,
    skipLetter,
    requestHint,
    togglePause: toggleRoscoPause,
    stats,
    hintsRemaining,
    userInputs,
  };
}
