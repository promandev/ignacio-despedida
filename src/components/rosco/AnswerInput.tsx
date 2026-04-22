import { useRef, useEffect, useCallback } from 'react';

interface Props {
  answer: string;
  userInput: string[];
  revealedIndices: number[];
  onCharChange: (index: number, char: string) => void;
  disabled?: boolean;
  status?: 'pending' | 'correct' | 'wrong' | 'skipped';
}

export default function AnswerInput({
  answer,
  userInput,
  revealedIndices,
  onCharChange,
  disabled = false,
  status = 'pending',
}: Props) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Parse answer into characters with metadata
  const charMeta = answer.split('').map((ch, i) => {
    const isLetter = /[a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/.test(ch);
    const isSpace = ch === ' ';
    const isSpecial = !isLetter && !isSpace; // apostrophe, etc.
    const isRevealed = revealedIndices.includes(i);
    return { ch, i, isLetter, isSpace, isSpecial, isRevealed };
  });

  // Group by words (split by spaces)
  const words: typeof charMeta[] = [];
  let currentWord: typeof charMeta = [];
  charMeta.forEach((c) => {
    if (c.isSpace) {
      if (currentWord.length > 0) words.push(currentWord);
      currentWord = [];
    } else {
      currentWord.push(c);
    }
  });
  if (currentWord.length > 0) words.push(currentWord);

  // Focus next typable input
  const focusNext = useCallback((fromIndex: number, direction: 1 | -1 = 1) => {
    let idx = fromIndex + direction;
    while (idx >= 0 && idx < charMeta.length) {
      const meta = charMeta[idx];
      if (meta.isLetter && !meta.isRevealed) {
        inputRefs.current[idx]?.focus();
        return;
      }
      idx += direction;
    }
  }, [charMeta]);

  // Focus first empty input on mount
  useEffect(() => {
    if (disabled) return;
    const firstEmpty = charMeta.findIndex(
      (c) => c.isLetter && !c.isRevealed && !userInput[c.i]
    );
    if (firstEmpty >= 0) {
      setTimeout(() => inputRefs.current[firstEmpty]?.focus(), 100);
    }
  }, [answer]); // eslint-disable-line

  const handleInput = (index: number, value: string) => {
    if (disabled) return;
    const letter = value.replace(/[^a-záéíóúñüA-ZÁÉÍÓÚÑÜ]/gi, '').slice(-1);
    onCharChange(index, letter);
    if (letter) {
      focusNext(index, 1);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (disabled) return;
    if (e.key === 'Backspace') {
      if (!userInput[index]) {
        e.preventDefault();
        focusNext(index, -1);
      } else {
        onCharChange(index, '');
      }
    } else if (e.key === 'ArrowLeft') {
      focusNext(index, -1);
    } else if (e.key === 'ArrowRight') {
      focusNext(index, 1);
    }
  };

  const statusClass =
    status === 'correct' ? 'correct' : status === 'wrong' ? 'wrong' : '';

  return (
    <div className="flex flex-wrap justify-center gap-x-3 gap-y-2">
      {words.map((word, wordIdx) => (
        <div key={wordIdx} className="flex gap-1">
          {word.map((c) => {
            if (c.isSpecial) {
              return (
                <div
                  key={c.i}
                  className={`letter-box flex items-center justify-center bg-gray-700/30 border-gray-600 text-gray-400 ${statusClass}`}
                >
                  {c.ch}
                </div>
              );
            }

            if (c.isRevealed) {
              return (
                <div
                  key={c.i}
                  className={`letter-box revealed flex items-center justify-center ${statusClass}`}
                >
                  {c.ch.toUpperCase()}
                </div>
              );
            }

            return (
              <input
                key={c.i}
                ref={(el) => { inputRefs.current[c.i] = el; }}
                type="text"
                inputMode="text"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                maxLength={2}
                value={userInput[c.i] || ''}
                onChange={(e) => handleInput(c.i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(c.i, e)}
                disabled={disabled}
                className={`letter-box ${statusClass} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
}
