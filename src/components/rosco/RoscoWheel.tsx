import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ROSCO_LETTERS } from '../../data/roscoQuestions';
import type { RoscoLetterStatus } from '../../types';

interface Props {
  statuses: Record<string, RoscoLetterStatus>;
  currentLetter: string;
  onSelectLetter?: (letter: string) => void;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  pending: { bg: '#374151', text: '#9CA3AF', border: '#4B5563' },
  correct: { bg: '#059669', text: '#FFFFFF', border: '#34D399' },
  wrong: { bg: '#DC2626', text: '#FFFFFF', border: '#F87171' },
  skipped: { bg: '#D97706', text: '#FFFFFF', border: '#FBBF24' },
  active: { bg: '#2563EB', text: '#FFFFFF', border: '#60A5FA' },
};

export default function RoscoWheel({ statuses, currentLetter, onSelectLetter }: Props) {
  const letterPositions = useMemo(() => {
    const total = ROSCO_LETTERS.length;
    return ROSCO_LETTERS.map((letter, i) => {
      const angle = (i * 360) / total - 90; // Start from top
      const rad = (angle * Math.PI) / 180;
      // Responsive radius: we use viewBox coordinates
      const radius = 130;
      const cx = 160 + radius * Math.cos(rad);
      const cy = 160 + radius * Math.sin(rad);
      return { letter, cx, cy, angle };
    });
  }, []);

  return (
    <div className="w-full max-w-[340px] md:max-w-[400px] mx-auto">
      <svg viewBox="0 0 320 320" className="w-full h-auto drop-shadow-lg">
        {/* Background circle */}
        <circle cx="160" cy="160" r="145" fill="none" stroke="#1f2937" strokeWidth="1" opacity="0.3" />

        {/* Letter circles */}
        {letterPositions.map(({ letter, cx, cy }) => {
          const isActive = letter === currentLetter;
          const status = statuses[letter] || 'pending';
          const colors = isActive ? STATUS_COLORS.active : STATUS_COLORS[status];
          const r = isActive ? 16 : 14;

          return (
            <g
              key={letter}
              className="rosco-letter"
              onClick={() => onSelectLetter?.(letter)}
            >
              <motion.circle
                cx={cx}
                cy={cy}
                r={r}
                fill={colors.bg}
                stroke={colors.border}
                strokeWidth={isActive ? 2.5 : 1.5}
                animate={isActive ? { r: [14, 16, 14] } : {}}
                transition={isActive ? { duration: 1.5, repeat: Infinity } : {}}
              />
              <text
                x={cx}
                y={cy}
                textAnchor="middle"
                dominantBaseline="central"
                fill={colors.text}
                fontSize={isActive ? '12' : '10'}
                fontWeight="bold"
                fontFamily="Cinzel, serif"
                style={{ pointerEvents: 'none' }}
              >
                {letter}
              </text>
            </g>
          );
        })}

        {/* Center text */}
        <text
          x="160"
          y="152"
          textAnchor="middle"
          fill="#D4AF37"
          fontSize="28"
          fontWeight="bold"
          fontFamily="Cinzel, serif"
        >
          {currentLetter}
        </text>
        <text
          x="160"
          y="174"
          textAnchor="middle"
          fill="#6B7280"
          fontSize="9"
          fontFamily="Inter, sans-serif"
        >
          ROSCO
        </text>
      </svg>
    </div>
  );
}
