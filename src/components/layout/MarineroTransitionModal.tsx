import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../context/GameStateContext';

// April 26, 2026, 10:00 AM Madrid time (CEST = UTC+2) => 8:00 UTC
const MARINERO_UTC = new Date('2026-04-26T08:00:00Z').getTime();

interface Props {
  forceShow?: boolean;
  onConfirm?: () => void;
}

export default function MarineroTransitionModal({ forceShow = false, onConfirm }: Props) {
  const { state, triggerMarineroTransition } = useGameState();
  const [showModal, setShowModal] = useState(false);
  const [transforming, setTransforming] = useState(false);

  useEffect(() => {
    if (forceShow) {
      setShowModal(true);
      setTransforming(false);
    }
  }, [forceShow]);

  useEffect(() => {
    if (state.transitionTriggered || state.currentTheme === 'marinero') return;
    if (!state.showMarineroModal) return;
    if (forceShow) return;
    if (state.forcedUserTheme != null) return;

    const check = () => {
      if (Date.now() >= MARINERO_UTC) {
        setShowModal(true);
      }
    };
    check();
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, [state.transitionTriggered, state.currentTheme, state.forcedUserTheme, state.showMarineroModal, forceShow]);

  const handleOk = () => {
    setTransforming(true);
    setTimeout(() => {
      setShowModal(false);
      if (forceShow && onConfirm) {
        onConfirm();
      } else {
        triggerMarineroTransition();
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
            className="bg-gradient-to-br from-gray-900 via-sky-950 to-gray-900 border border-sky-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-sky-500/20 text-center"
          >
            <motion.div
              animate={{ y: [0, -6, 0, 6, 0], rotate: [0, -5, 0, 5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="text-5xl mb-4"
            >
              ⚓
            </motion.div>

            <h2 className="text-xl md:text-2xl font-bold text-sky-400 mb-4 font-cinzel">
              ¡La marea está cambiando!
            </h2>

            <p className="text-gray-300 leading-relaxed mb-6 text-sm md:text-base">
              Se oyen olas a lo lejos... El viento sopla con fuerza y trae consigo
              el olor a salitre. Parece que alguien ha izado las velas...
            </p>

            <motion.div
              className="flex justify-center gap-2 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {['🌊', '⛵', '🌊'].map((emoji, i) => (
                <motion.span
                  key={i}
                  className="text-2xl"
                  animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 1.5, delay: i * 0.3, repeat: Infinity }}
                >
                  {emoji}
                </motion.span>
              ))}
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleOk}
              disabled={transforming}
              className="px-8 py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl
                         transition-all shadow-lg shadow-sky-600/30 disabled:opacity-50 text-sm md:text-base"
            >
              {transforming ? '🌀 Navegando...' : 'Zarpar al nuevo destino'}
            </motion.button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
