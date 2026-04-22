import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  isTransforming: boolean;
  onComplete: () => void;
}

export default function ThemeTransition({ isTransforming, onComplete }: Props) {
  const [phase, setPhase] = useState(0);
  // Phase 0: idle, 1: glitch start, 2: image morph, 3: color shift, 4: complete

  useEffect(() => {
    if (!isTransforming) {
      setPhase(0);
      return;
    }

    // Phase sequence
    setPhase(1);
    const t1 = setTimeout(() => setPhase(2), 1000);   // glitch → morph
    const t2 = setTimeout(() => setPhase(3), 5000);   // morph → color shift
    const t3 = setTimeout(() => {
      setPhase(4);
      onComplete();
    }, 7500);  // complete

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [isTransforming, onComplete]);

  if (!isTransforming && phase === 0) return null;

  return (
    <AnimatePresence>
      {(isTransforming || phase > 0) && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[150] flex items-center justify-center overflow-hidden"
        >
          {/* Background transition */}
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundColor: phase >= 3 ? '#0a0f0a' : '#F5F5F0',
            }}
            transition={{ duration: 2 }}
          />

          {/* Lightning / glitch flashes */}
          {phase >= 1 && phase < 4 && (
            <>
              <motion.div
                animate={{
                  opacity: [0, 1, 0, 0.7, 0, 1, 0, 0, 0.5, 0],
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-emerald-400/10 z-10"
              />
              <motion.div
                animate={{ opacity: [0, 0.3, 0] }}
                transition={{ duration: 0.15, repeat: Infinity, repeatDelay: 0.5 }}
                className="absolute inset-0 bg-white/5 z-10"
              />
            </>
          )}

          {/* Central image morph */}
          <div className="relative w-72 h-72 md:w-96 md:h-96 z-20">
            {/* Carmena image — fades out */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                opacity: phase >= 2 ? 0 : 1,
                scale: phase >= 1 ? [1, 1.02, 0.98, 1.01, 1] : 1,
                filter: phase >= 2 ? 'blur(8px) brightness(2)' : 'blur(0px) brightness(1)',
              }}
              transition={{
                opacity: { duration: 2.5 },
                scale: { duration: 0.5, repeat: phase >= 1 && phase < 2 ? Infinity : 0 },
                filter: { duration: 2.5 },
              }}
            >
              <img
                src="/images/carmena/ignacio.png"
                alt="Carmena"
                className="w-full h-full object-contain rounded-2xl"
              />
            </motion.div>

            {/* Slytherin image — fades in */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              animate={{
                opacity: phase >= 2 ? 1 : 0,
                scale: phase >= 2 ? [0.9, 1.05, 1] : 0.8,
                filter: phase >= 2 && phase < 3 ? 'brightness(1.3) contrast(1.1)' : 'brightness(1) contrast(1)',
              }}
              transition={{
                opacity: { duration: 3, delay: 0.5 },
                scale: { duration: 3, delay: 0.5 },
                filter: { duration: 1.5, delay: 2.5 },
              }}
            >
              <img
                src="/images/slytherin/ignacio.png"
                alt="Slytherin"
                className="w-full h-full object-contain rounded-2xl"
              />
              {/* Green glow behind */}
              <motion.div
                animate={{ opacity: phase >= 2 ? [0, 0.6, 0.3] : 0 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 rounded-2xl shadow-[0_0_80px_20px_rgba(16,185,129,0.4)] -z-10"
              />
            </motion.div>

            {/* Glitch lines overlay */}
            {phase >= 1 && phase < 3 && (
              <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden rounded-2xl">
                {[...Array(8)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute left-0 right-0 h-[2px] bg-emerald-400/40"
                    style={{ top: `${10 + i * 12}%` }}
                    animate={{
                      x: ['-100%', '100%'],
                      opacity: [0, 0.8, 0],
                    }}
                    transition={{
                      duration: 0.3 + Math.random() * 0.5,
                      repeat: Infinity,
                      delay: Math.random() * 2,
                      repeatDelay: 1 + Math.random() * 3,
                    }}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Text overlay */}
          <div className="absolute bottom-16 left-0 right-0 text-center z-20 px-4">
            <AnimatePresence mode="wait">
              {phase === 1 && (
                <motion.p
                  key="p1"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-emerald-400 font-cinzel text-lg md:text-xl"
                >
                  Algo oscuro se acerca...
                </motion.p>
              )}
              {phase === 2 && (
                <motion.p
                  key="p2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-emerald-300 font-cinzel text-xl md:text-2xl font-bold"
                >
                  ⚡ La transformación ha comenzado ⚡
                </motion.p>
              )}
              {phase === 3 && (
                <motion.p
                  key="p3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="text-gold font-cinzel text-xl md:text-2xl font-bold"
                >
                  🐍 Bienvenido a Slytherin 🐍
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* Corner snakes decoration */}
          {phase >= 2 && (
            <>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.5, scale: 1, rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, rotate: { duration: 4, repeat: Infinity } }}
                className="absolute top-10 left-10 text-5xl z-10"
              >
                🐍
              </motion.span>
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 0.5, scale: 1, rotate: [0, -10, 10, 0] }}
                transition={{ duration: 1, delay: 0.3, rotate: { duration: 4, repeat: Infinity } }}
                className="absolute bottom-10 right-10 text-5xl z-10"
              >
                🐍
              </motion.span>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
