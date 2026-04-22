import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../context/GameStateContext';

// April 25, 2026, 9:00 AM Madrid time (CEST = UTC+2) => 7:00 UTC
const TARGET_UTC = new Date('2026-04-25T07:00:00Z').getTime();

interface Props {
  /** When true, show the modal immediately (triggered from admin panel) */
  forceShow?: boolean;
  /** Called when user clicks OK in forceShow mode (instead of triggerTransition) */
  onConfirm?: () => void;
}

export default function TransitionModal({ forceShow = false, onConfirm }: Props) {
  const { state, triggerTransition } = useGameState();
  const [showModal, setShowModal] = useState(false);
  const [transforming, setTransforming] = useState(false);

  // Show when forced from admin
  useEffect(() => {
    if (forceShow) {
      setShowModal(true);
      setTransforming(false);
    }
  }, [forceShow]);

  // Time-based check (only when not already triggered and modal enabled)
  useEffect(() => {
    if (state.transitionTriggered || state.currentTheme === 'slytherin') return;
    if (!state.showTransitionModal) return;
    if (forceShow) return;

    const check = () => {
      if (Date.now() >= TARGET_UTC) {
        setShowModal(true);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [state.transitionTriggered, state.currentTheme, forceShow]);

  const handleOk = () => {
    setTransforming(true);
    setTimeout(() => {
      setShowModal(false);
      if (forceShow && onConfirm) {
        // Admin-triggered: start the ThemeTransition animation
        onConfirm();
      } else {
        // Time-triggered: triggerTransition sets theme + flag
        triggerTransition();
      }
    }, 500);
  };

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: transforming ? [1, 1.05, 0.95, 0] : 1,
              opacity: transforming ? [1, 1, 1, 0] : 1,
            }}
            transition={transforming ? { duration: 0.5 } : { type: 'spring', damping: 20 }}
            className="bg-gradient-to-br from-gray-900 via-emerald-950 to-gray-900 border border-emerald-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-emerald-500/20 text-center"
          >
            {/* Lightning icon */}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              ⚡
            </motion.div>

            {/* Glitch-style text */}
            <h2 className="text-xl md:text-2xl font-bold text-emerald-400 mb-4 font-cinzel">
              Oh, oh... Algo está pasando...
            </h2>

            <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
              No tiene sentido seguir hablando de Manuela Carmena cuando hay cosas más
              importantes en el mundo que están ocurriendo...
            </p>

            {/* Mysterious dots animation */}
            <motion.div
              className="flex justify-center gap-1 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="w-2 h-2 rounded-full bg-emerald-400"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1, delay: i * 0.2, repeat: Infinity }}
                />
              ))}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOk}
              disabled={transforming}
              className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl
                         transition-all shadow-lg shadow-emerald-600/30 disabled:opacity-50 text-sm md:text-base"
            >
              {transforming ? '🌀 Transformando...' : 'Revelar la verdad'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
