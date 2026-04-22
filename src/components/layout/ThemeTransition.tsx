import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isTransforming: boolean;
  onComplete: () => void;
}

// Fixed values for glitch lines (avoids re-render randomness)
const GLITCH_LINES = [
  { top: 8,  dur: 0.28, delay: 0.1,  repDelay: 1.2 },
  { top: 19, dur: 0.42, delay: 0.9,  repDelay: 2.1 },
  { top: 31, dur: 0.35, delay: 0.4,  repDelay: 1.7 },
  { top: 44, dur: 0.22, delay: 1.5,  repDelay: 2.8 },
  { top: 56, dur: 0.38, delay: 0.7,  repDelay: 1.4 },
  { top: 67, dur: 0.31, delay: 2.1,  repDelay: 3.2 },
  { top: 78, dur: 0.45, delay: 0.2,  repDelay: 1.9 },
  { top: 89, dur: 0.26, delay: 1.8,  repDelay: 2.5 },
];

// Earthquake shake keyframes (subtle)
const QUAKE_X = [0, -4, 5, -3, 5, -2, 4, -4, 3, -3, 2, 0];
const QUAKE_Y = [0, 2, -2, 3, -2, 3, -2, 1, -3, 2, -1, 0];

export default function ThemeTransition({ isTransforming, onComplete }: Props) {
  const [phase, setPhase] = useState(0);
  // Phase 0: idle | 1: earthquake+glitch | 2: image morph | 3: color shift | 4: complete

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (!isTransforming) {
      setPhase(0);
      return;
    }

    setPhase(1);
    const t1 = setTimeout(() => setPhase(2), 900);   // glitch → morph
    const t2 = setTimeout(() => setPhase(3), 3800);  // morph → color shift
    const t3 = setTimeout(() => {
      setPhase(4);
      onCompleteRef.current();
    }, 5500);  // complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isTransforming]);

  if (!isTransforming && phase === 0) return null;

  const isShaking = phase >= 1 && phase < 3;

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
          {/* ── Background ─────────────────────────────────── */}
          <motion.div
            className="absolute inset-0"
            animate={{ backgroundColor: phase >= 3 ? '#0a0f0a' : '#180800' }}
            transition={{ duration: 2.5 }}
          />

          {/* ── Blood-red vignette pulse (phase 1-2) ───────── */}
          {phase >= 1 && phase < 3 && (
            <motion.div
              animate={{ opacity: [0, 0.4, 0, 0.55, 0, 0.35, 0] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(200,0,0,0.35)_0%,transparent_70%)] z-10"
            />
          )}

          {/* ── Green evil glow (phase 3) ───────────────────── */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0.3, 0.6, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.2)_0%,transparent_70%)] z-10"
            />
          )}

          {/* ── Lightning flashes ──────────────────────────── */}
          {phase >= 1 && phase < 4 && (
            <>
              <motion.div
                animate={{ opacity: [0, 0.9, 0, 0, 0.6, 0, 0.4, 0] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 0.2 }}
                className="absolute inset-0 bg-white/10 z-10"
              />
              <motion.div
                animate={{ opacity: [0, 0.6, 0, 0.8, 0, 0.4, 0] }}
                transition={{ duration: 0.35, repeat: Infinity, repeatDelay: 0.6 }}
                className="absolute inset-0 bg-emerald-400/15 z-10"
              />
            </>
          )}

          {/* ── SCREEN EARTHQUAKE wrapper ──────────────────── */}
          <motion.div
            animate={isShaking ? { x: QUAKE_X, y: QUAKE_Y } : { x: 0, y: 0 }}
            transition={
              isShaking
                ? { duration: 0.9, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                : { duration: 0.3 }
            }
            className="relative flex items-center justify-center w-full h-full"
          >
            {/* ── Image card with individual shake ───────────── */}
            <motion.div
              animate={
                isShaking
                  ? {
                      x: [-2, 3, -4, 2, -3, 4, -2, 3, -2, 1, 0],
                      y: [1, -2, 3, -1, 2, -1, 2, -2, 1, -1, 0],
                      rotate: [-0.4, 0.6, -0.8, 0.4, -0.6, 0.7, -0.4, 0.4, 0],
                    }
                  : { x: 0, y: 0, rotate: 0 }
              }
              transition={
                isShaking
                  ? { duration: 0.6, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' }
                  : { duration: 0.4 }
              }
              className="relative w-64 h-64 md:w-80 md:h-80 z-20"
            >
              {/* Animated glow border */}
              <motion.div
                animate={{
                  boxShadow:
                    phase >= 2
                      ? [
                          '0 0 20px 4px rgba(16,185,129,0.4)',
                          '0 0 70px 16px rgba(16,185,129,0.75)',
                          '0 0 30px 6px rgba(16,185,129,0.5)',
                        ]
                      : '0 0 0px 0px transparent',
                }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-0 rounded-2xl z-40 pointer-events-none"
              />

              {/* Carmena → fades out */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  opacity: phase >= 2 ? 0 : 1,
                  scale: phase >= 1 ? [1, 1.03, 0.97, 1.02, 1] : 1,
                  filter:
                    phase >= 2
                      ? 'blur(12px) brightness(3) saturate(0)'
                      : 'blur(0px) brightness(1) saturate(1)',
                }}
                transition={{
                  opacity: { duration: 1.5 },
                  scale: { duration: 0.4, repeat: phase >= 1 && phase < 2 ? Infinity : 0 },
                  filter: { duration: 1.5 },
                }}
              >
                <img
                  src="/images/carmena/ignacio.png"
                  alt="Carmena"
                  className="w-full h-full object-contain rounded-2xl"
                />
              </motion.div>

              {/* Slytherin → fades in */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{
                  opacity: phase >= 2 ? 1 : 0,
                  scale: phase >= 2 ? [0.85, 1.08, 1] : 0.8,
                  filter:
                    phase >= 2 && phase < 3
                      ? 'brightness(1.5) contrast(1.3) saturate(1.4)'
                      : 'brightness(1) contrast(1) saturate(1)',
                }}
                transition={{
                  opacity: { duration: 1.8, delay: 0.3 },
                  scale: { duration: 1.8, delay: 0.3 },
                  filter: { duration: 1, delay: 1.5 },
                }}
              >
                <img
                  src="/images/slytherin/ignacio.png"
                  alt="Slytherin"
                  className="w-full h-full object-contain rounded-2xl"
                />
                <motion.div
                  animate={{ opacity: phase >= 2 ? [0, 0.85, 0.45, 0.7, 0.5] : 0 }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                  className="absolute inset-0 rounded-2xl shadow-[0_0_100px_30px_rgba(16,185,129,0.55)] -z-10"
                />
              </motion.div>

              {/* Glitch scan lines */}
              {phase >= 1 && phase < 3 && (
                <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
                  {GLITCH_LINES.map((g, i) => (
                    <motion.div
                      key={i}
                      className="absolute left-0 right-0 h-[2px] bg-emerald-300/60"
                      style={{ top: `${g.top}%` }}
                      animate={{ x: ['-100%', '120%'], opacity: [0, 1, 0] }}
                      transition={{ duration: g.dur, repeat: Infinity, delay: g.delay, repeatDelay: g.repDelay }}
                    />
                  ))}
                  {/* Red glitch slice */}
                  <motion.div
                    className="absolute left-0 right-0 h-[5px] bg-red-500/35"
                    style={{ top: '42%' }}
                    animate={{ x: ['-100%', '110%'], opacity: [0, 0.8, 0] }}
                    transition={{ duration: 0.18, repeat: Infinity, repeatDelay: 1.4 }}
                  />
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* ── Floating symbols ───────────────────────────── */}
          {phase >= 2 && (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
              {['☠', '🐍', '⚡', '💀', '🌑', '☽', '🔮', '⚗️'].map((sym, i) => (
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

          {/* ── Text overlay ───────────────────────────────── */}
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
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ duration: 0.4, repeat: Infinity }}
                    className="text-red-400 font-cinzel text-lg md:text-xl font-bold tracking-widest"
                  >
                    ⚠️ ALERTA DE TRANSFORMACIÓN ⚠️
                  </motion.p>
                  <p className="text-gray-400 text-sm mt-1">Algo oscuro se despierta...</p>
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
                    animate={{ scale: [1, 1.06, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="text-emerald-300 font-cinzel text-xl md:text-2xl font-bold"
                  >
                    ⚡ La transformación ha comenzado ⚡
                  </motion.p>
                  <p className="text-gray-500 text-xs mt-2 tracking-widest uppercase">
                    Manuela Carmena → Lord Malfoy
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
                    animate={{ textShadow: ['0 0 8px #10b981', '0 0 40px #10b981', '0 0 8px #10b981'] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-emerald-400 font-cinzel text-2xl md:text-3xl font-bold"
                  >
                    🐍 Bienvenido a Slytherin 🐍
                  </motion.p>
                  <p className="text-gold font-cinzel text-sm mt-2 tracking-widest">
                    Purus Sanguis · Slytherin · 2026
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Corner snakes ──────────────────────────────── */}
          {phase >= 2 && (
            <>
              {[
                { cls: 'top-8 left-8',    rot: [0, 15, -15, 0],  delay: 0   },
                { cls: 'top-8 right-8',   rot: [0, -15, 15, 0],  delay: 0.3 },
                { cls: 'bottom-8 left-8', rot: [0, 12, -12, 0],  delay: 0.6 },
                { cls: 'bottom-8 right-8',rot: [0, -12, 12, 0],  delay: 0.9 },
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
                  🐍
                </motion.span>
              ))}
            </>
          )}

          {/* ── Giant Slytherin crest watermark (phase 3) ──── */}
          {phase >= 3 && (
            <motion.div
              initial={{ opacity: 0, scale: 2 }}
              animate={{ opacity: 0.05, scale: 1 }}
              transition={{ duration: 2 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
            >
              <span className="text-[20rem] select-none">🐍</span>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
