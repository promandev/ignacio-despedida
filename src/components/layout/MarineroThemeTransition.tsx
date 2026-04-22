import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isTransforming: boolean;
  onComplete: () => void;
}

// Wave scan lines
const WAVE_LINES = [
  { top: 10, dur: 0.45, delay: 0.1, repDelay: 1.0 },
  { top: 22, dur: 0.55, delay: 0.5, repDelay: 1.8 },
  { top: 35, dur: 0.40, delay: 0.8, repDelay: 1.5 },
  { top: 48, dur: 0.50, delay: 0.3, repDelay: 2.0 },
  { top: 60, dur: 0.35, delay: 1.2, repDelay: 1.3 },
  { top: 72, dur: 0.60, delay: 0.6, repDelay: 2.2 },
  { top: 85, dur: 0.42, delay: 1.0, repDelay: 1.7 },
];

// Ship rocking keyframes
const ROCK_X = [0, -3, 4, -2, 3, -4, 2, -3, 3, -2, 1, 0];
const ROCK_Y = [0, 3, -2, 4, -3, 2, -3, 2, -2, 3, -1, 0];

export default function MarineroThemeTransition({ isTransforming, onComplete }: Props) {
  const [phase, setPhase] = useState(0);
  // Phase 0: idle
  // Phase 1: Draco showcase — green glow, dramatic entrance (2.5s)
  // Phase 2: Overlap — marinero rises over Draco, both visible (3s)
  // Phase 3: Calm sea — marinero only (2s)
  // Phase 4: complete

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isTransforming) {
      setPhase(0);
      return;
    }

    setPhase(1);
    const t1 = setTimeout(() => setPhase(2), 2500);
    const t2 = setTimeout(() => setPhase(3), 5500);
    const t3 = setTimeout(() => {
      setPhase(4);
      onCompleteRef.current();
    }, 7500);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isTransforming]);

  if (!isTransforming && phase === 0) return null;

  const isRocking = phase >= 2 && phase < 3;

  return (
    <AnimatePresence>
      {(isTransforming || phase > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden"
        >
          {/* Background: Slytherin dark green → transitional → deep ocean blue */}
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundColor:
                phase >= 3 ? '#0a1e3d' : phase >= 2 ? '#0a1520' : '#0a0f0a',
            }}
            transition={{ duration: 2 }}
          />

          {/* Slytherin green vignette (phase 1) */}
          {phase === 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.6, 0.35] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.3)_0%,transparent_70%)] z-10"
            />
          )}

          {/* Storm vignette pulse (phase 2) */}
          {phase === 2 && (
            <motion.div
              animate={{ opacity: [0, 0.35, 0, 0.5, 0, 0.3, 0] }}
              transition={{ duration: 1.4, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,80,180,0.35)_0%,transparent_70%)] z-10"
            />
          )}

          {/* Ocean glow (phase 3) */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.6, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(56,189,248,0.2)_0%,transparent_70%)] z-10"
            />
          )}

          {/* Lightning / flicker flashes (phase 2 transition) */}
          {phase === 2 && (
            <>
              <motion.div
                animate={{ opacity: [0, 0.7, 0, 0, 0.5, 0, 0.3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 0.4 }}
                className="absolute inset-0 bg-white/8 z-10"
              />
              <motion.div
                animate={{ opacity: [0, 0.5, 0, 0.7, 0, 0.3, 0] }}
                transition={{ duration: 0.4, repeat: Infinity, repeatDelay: 0.8 }}
                className="absolute inset-0 bg-sky-400/10 z-10"
              />
            </>
          )}

          {/* SCREEN ROCKING wrapper (only during overlap phase) */}
          <motion.div
            animate={isRocking ? { x: ROCK_X, y: ROCK_Y } : { x: 0, y: 0 }}
            transition={
              isRocking
                ? { duration: 1.2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                : { duration: 0.3 }
            }
            className="relative flex items-center justify-center w-full h-full"
          >
            {/* Image card container */}
            <motion.div
              animate={
                isRocking
                  ? {
                      x: [-2, 3, -3, 2, -2, 3, -2, 2, -1, 1, 0],
                      y: [2, -3, 4, -2, 3, -2, 3, -3, 2, -1, 0],
                      rotate: [-1, 1.5, -2, 1, -1.5, 2, -1, 1, 0],
                    }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={
                isRocking
                  ? { duration: 0.8, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                  : { duration: 0.4 }
              }
              className="relative w-64 h-64 md:w-80 md:h-80 z-20"
            >
              {/* Green glow around Draco (phase 1) */}
              <motion.div
                animate={{
                  boxShadow:
                    phase === 1
                      ? [
                          '0 0 30px 8px rgba(16,185,129,0.5)',
                          '0 0 80px 20px rgba(16,185,129,0.7)',
                          '0 0 40px 10px rgba(16,185,129,0.5)',
                        ]
                      : phase >= 2
                      ? [
                          '0 0 20px 4px rgba(56,189,248,0.4)',
                          '0 0 70px 16px rgba(56,189,248,0.75)',
                          '0 0 30px 6px rgba(56,189,248,0.5)',
                        ]
                      : '0 0 0px 0px transparent',
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl z-40 pointer-events-none"
              />

              {/* ── DRACO IMAGE ── */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{
                  // Phase 1: dramatic entrance, full visibility
                  // Phase 2: still visible but fading as marinero overlaps
                  // Phase 3+: gone
                  opacity:
                    phase === 1
                      ? 1
                      : phase === 2
                      ? [1, 0.7, 0.4, 0]
                      : 0,
                  scale:
                    phase === 1
                      ? [0.85, 1.05, 1]
                      : phase === 2
                      ? [1, 0.97, 0.93]
                      : 0.9,
                  filter:
                    phase >= 3
                      ? 'blur(12px) brightness(0) saturate(0)'
                      : phase === 2
                      ? 'blur(0px) brightness(1) saturate(1)'
                      : 'blur(0px) brightness(1.1) saturate(1.1)',
                }}
                transition={{
                  opacity: {
                    duration: phase === 1 ? 0.8 : 2.5,
                    ease: 'easeInOut',
                  },
                  scale: {
                    duration: phase === 1 ? 1.2 : 2.5,
                    ease: 'easeInOut',
                  },
                  filter: { duration: 1.5 },
                }}
              >
                <img
                  src="/images/slytherin/ignacio-draco.png"
                  alt="Draco Malfoy"
                  className="w-full h-full object-contain rounded-2xl"
                />
                {/* Slytherin green aura behind Draco */}
                {phase === 1 && (
                  <motion.div
                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 rounded-2xl shadow-[0_0_80px_25px_rgba(16,185,129,0.5)] -z-10"
                  />
                )}
              </motion.div>

              {/* ── MARINERO IMAGE ── rises from below, overlapping Draco */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  opacity: phase >= 2 ? 1 : 0,
                  scale: phase >= 2 ? [0.8, 1.08, 1] : 0.7,
                  y: phase >= 2 ? [60, -5, 0] : 80,
                  filter:
                    phase === 2
                      ? 'brightness(1.4) contrast(1.15) saturate(1.2)'
                      : 'brightness(1) contrast(1) saturate(1)',
                }}
                transition={{
                  opacity: { duration: 1.5, delay: phase === 2 ? 0.5 : 0 },
                  scale: { duration: 2, delay: phase === 2 ? 0.5 : 0, ease: 'easeOut' },
                  y: { duration: 2, delay: phase === 2 ? 0.5 : 0, ease: 'easeOut' },
                  filter: { duration: 1, delay: 2 },
                }}
              >
                <img
                  src="/images/marinero/ignacio.png"
                  alt="Marinero"
                  className="w-full h-full object-contain rounded-2xl"
                />
                <motion.div
                  animate={{ opacity: phase >= 2 ? [0, 0.85, 0.45, 0.7, 0.5] : 0 }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl shadow-[0_0_100px_30px_rgba(56,189,248,0.55)] -z-10"
                />
              </motion.div>

              {/* Wave scan lines (overlap phase) */}
              {phase === 2 && (
                <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
                  {WAVE_LINES.map((g, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-0 right-0 h-[2px] bg-sky-300/60"
                      style={{ top: `${g.top}%` }}
                      animate={{ x: ['-100%', '120%'], opacity: [0, 1, 0] }}
                      transition={{ duration: g.dur, repeat: Infinity, delay: g.delay, repeatDelay: g.repDelay }}
                    />
                  ))}
                  <motion.div
                    className="absolute left-0 right-0 h-[5px] bg-sky-500/35"
                    style={{ top: '50%' }}
                    animate={{ x: ['-100%', '110%'], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.22, repeat: Infinity, repeatDelay: 1.6 }}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Floating Slytherin sparks (phase 1) */}
          {phase === 1 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
              {['🐍', '✦', '⚡', '🐍', '✦', '💚'].map((sym, i) => (
                <motion.span
                  key={`slytherin-${i}`}
                  className="absolute text-xl"
                  style={{ left: `${10 + i * 14}%`, bottom: '-6%' }}
                  animate={{ y: [0, -(500 + i * 50)], opacity: [0, 0.5, 0] }}
                  transition={{ duration: 3.5 + i * 0.3, repeat: Infinity, delay: i * 0.4, ease: 'easeOut' }}
                >
                  {sym}
                </motion.span>
              ))}
            </div>
          )}

          {/* Floating sea symbols (phase 2+) */}
          {phase >= 2 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
              {['⚓', '🌊', '⛵', '🐚', '🐬', '🌀', '🐙', '🦈'].map((sym, i) => (
                <motion.span
                  key={i}
                  className="absolute text-2xl opacity-40"
                  style={{ left: `${6 + i * 11}%`, bottom: '-8%' }}
                  animate={{ y: [0, -(600 + i * 40)], opacity: [0, 0.55, 0] }}
                  transition={{ duration: 4 + i * 0.4, repeat: Infinity, delay: i * 0.5, ease: 'easeOut' }}
                >
                  {sym}
                </motion.span>
              ))}
            </div>
          )}

          {/* Text overlay */}
          <div className="absolute bottom-14 left-0 right-0 text-center z-30 px-4">
            <AnimatePresence mode="wait">
              {phase === 1 && (
                <motion.div
                  key="p1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.p
                    animate={{ opacity: [0.7, 1, 0.7], textShadow: ['0 0 8px #10b981', '0 0 30px #10b981', '0 0 8px #10b981'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-emerald-400 font-cinzel text-xl md:text-2xl font-bold tracking-widest"
                  >
                    🐍 Lord Draco Malfoy 🐍
                  </motion.p>
                  <p className="text-gray-400 text-sm mt-2">La serpiente acecha por última vez...</p>
                </motion.div>
              )}
              {phase === 2 && (
                <motion.div
                  key="p2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                >
                  <motion.p
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.5, repeat: Infinity }}
                    className="text-sky-400 font-cinzel text-lg md:text-xl font-bold tracking-widest"
                  >
                    🌊 ¡La marea lo arrastra! 🌊
                  </motion.p>
                  <p className="text-gray-500 text-xs mt-2 tracking-widest uppercase">
                    Lord Malfoy → Marinero de Altura
                  </p>
                </motion.div>
              )}
              {phase === 3 && (
                <motion.div
                  key="p3"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ type: 'spring', damping: 12 }}
                >
                  <motion.p
                    animate={{ textShadow: ['0 0 8px #38bdf8', '0 0 40px #38bdf8', '0 0 8px #38bdf8'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-sky-400 font-cinzel text-2xl md:text-3xl font-bold"
                  >
                    ⚓ Bienvenido a bordo ⚓
                  </motion.p>
                  <p className="text-yellow-300 font-cinzel text-sm mt-2 tracking-widest">
                    Flota Especial · Marinero de Altura · 2026
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Corner anchors */}
          {phase >= 2 && (
            <>
              {[
                { cls: 'top-8 left-8', rot: [0, 15, -15, 0], delay: 0 },
                { cls: 'top-8 right-8', rot: [0, -15, 15, 0], delay: 0.3 },
                { cls: 'bottom-8 left-8', rot: [0, 12, -12, 0], delay: 0.6 },
                { cls: 'bottom-8 right-8', rot: [0, -12, 12, 0], delay: 0.9 },
              ].map((s, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 0.65, scale: 1, rotate: s.rot }}
                  transition={{
                    opacity: { duration: 0.5, delay: s.delay },
                    scale: { duration: 0.5, delay: s.delay },
                    rotate: { duration: 3 + i * 0.5, repeat: Infinity, delay: s.delay },
                  }}
                  className={`absolute ${s.cls} text-4xl md:text-5xl z-10`}
                >
                  ⚓
                </motion.span>
              ))}
            </>
          )}

          {/* Giant anchor watermark (phase 3) */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 0.05, scale: 1 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <span className="text-[20rem] select-none">⚓</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
