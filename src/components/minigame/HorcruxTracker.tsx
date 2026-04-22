import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameState } from '../../context/GameStateContext';
import { useAuth } from '../../hooks/useAuth';
import { horcruxes } from '../../data/horcruxes';
import type { HorcruxId, Horcrux } from '../../types';

const HORCRUX_SECONDS = 1;
const COMPLETION_BONUS = 13;

interface HorcruxModalProps {
  horcrux: Horcrux;
  secondsGained: number;
  onClose: () => void;
}

function HorcruxModal({ horcrux, secondsGained, onClose }: HorcruxModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative glass rounded-2xl p-8 max-w-sm w-full text-center border border-gold/40 shadow-2xl shadow-gold/20"
          initial={{ scale: 0.7, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.7, opacity: 0, y: 40 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <div className="relative inline-block mb-4">
            <motion.img
              src={horcrux.badgeImage}
              alt={horcrux.name}
              className="w-36 h-36 object-contain mx-auto badge-unlocked"
              animate={{ scale: [0.8, 1] }}
              transition={{ duration: 0.5, delay: 0.2 }}
            />
          </div>
          <h3 className="font-cinzel text-xl font-bold text-gold mb-2">
            ✨ ¡Horrocrux recuperado!
          </h3>
          <h4 className="font-cinzel text-base font-semibold text-emerald-400 mb-3">
            {horcrux.name}
          </h4>
          <p className="text-gray-400 text-sm mb-5 leading-relaxed italic">
            "{horcrux.lore}"
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 font-bold text-lg mb-6">
            ⏱ +{secondsGained}s al Rosco
          </div>
          <br />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 bg-gold text-black font-bold rounded-xl text-sm"
          >
            ¡Genial!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface CompletionModalProps {
  onClose: () => void;
}

function CompletionModal({ onClose }: CompletionModalProps) {
  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          className="relative glass rounded-2xl p-8 max-w-sm w-full text-center border border-gold/40 shadow-2xl shadow-gold/20"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.7, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        >
          <motion.div
            className="text-7xl mb-4"
            animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.3, 1] }}
            transition={{ duration: 1, repeat: 1, delay: 0.2 }}
          >
            🏆
          </motion.div>
          <h3 className="font-cinzel text-2xl font-bold text-gold mb-2">
            ¡Todos los Horrocruxes!
          </h3>
          <p className="text-gray-300 text-sm mb-4 leading-relaxed">
            Lord Voldemort está a salvo. Has completado los 7 Horrocruxes.
          </p>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/40 text-gold font-bold text-xl mb-6">
            ⏱ +{COMPLETION_BONUS}s bonus extra
          </div>
          <p className="text-gray-500 text-xs mb-6">
            Además de los {horcruxes.length}s ganados uno a uno, recibes {COMPLETION_BONUS}s extra por completar todos.
          </p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="px-6 py-2 bg-gold text-black font-bold rounded-xl text-sm"
          >
            ¡A por el Rosco!
          </motion.button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default function HorcruxTracker() {
  const { state, toggleHorcrux } = useGameState();
  const { isAdmin } = useAuth();
  const { addRoscoTimeBonus } = useGameState();
  const completedCount = Object.values(state.horcruxes).filter(Boolean).length;

  const [gainedModal, setGainedModal] = useState<{ horcrux: Horcrux; seconds: number } | null>(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  // Track whether we already gave the completion bonus
  const [completionBonusGiven, setCompletionBonusGiven] = useState(
    () => completedCount === 7
  );

  const handleToggle = (h: Horcrux) => {
    const wasCompleted = state.horcruxes[h.id as HorcruxId];

    // Non-admin cannot deselect
    if (wasCompleted && !isAdmin) return;

    toggleHorcrux(h.id as HorcruxId);

    if (!wasCompleted) {
      // Gaining a horcrux: add 1 second and show modal
      addRoscoTimeBonus(HORCRUX_SECONDS);
      const newCount = completedCount + 1;

      setGainedModal({ horcrux: h, seconds: HORCRUX_SECONDS });

      if (newCount === 7 && !completionBonusGiven) {
        // Schedule completion modal after the gain modal closes
        setCompletionBonusGiven(true);
        setTimeout(() => {
          addRoscoTimeBonus(COMPLETION_BONUS);
          setShowCompletionModal(true);
        }, 200);
      }
    }
  };

  const totalBonus = completedCount * HORCRUX_SECONDS + (completedCount === 7 ? COMPLETION_BONUS : 0);

  return (
    <div>
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-emerald-400 mb-2">
          🔮 Los 7 Horrocruxes
        </h2>
        <p className="text-gray-400 text-sm">
          Recupera cada Horrocrux completando las pruebas
        </p>
        {/* Seconds info */}
        <div className="mt-3 flex flex-wrap justify-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-600/30 text-emerald-300">
            ⏱ +1s por Horrocrux
          </span>
          <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold">
            ⭐ +{COMPLETION_BONUS}s si completas los 7
          </span>
          {totalBonus > 0 && (
            <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-600/30 text-blue-300 font-bold">
              Total ganado: +{totalBonus}s
            </span>
          )}
        </div>
        {/* Progress bar */}
        <div className="mt-4 max-w-xs mx-auto">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{completedCount}/7 completados</span>
            <span>{Math.round((completedCount / 7) * 100)}%</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-600 to-gold rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${(completedCount / 7) * 100}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Badges row */}
      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {horcruxes.map((h) => (
          <motion.div
            key={h.id}
            animate={state.horcruxes[h.id as HorcruxId] ? { scale: [1, 1.15, 1] } : {}}
            className="text-center"
          >
            <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden flex items-center justify-center">
              <img
                src={h.badgeImage}
                alt={h.name}
                className={`w-12 h-12 md:w-14 md:h-14 object-contain ${
                  state.horcruxes[h.id as HorcruxId] ? 'badge-unlocked' : 'badge-locked'
                }`}
              />
            </div>
            <span className="text-[10px] text-gray-500 mt-1 block">{h.emoji}</span>
          </motion.div>
        ))}
      </div>

      {/* Challenge cards */}
      <div className="space-y-4">
        {horcruxes.map((h, i) => {
          const completed = state.horcruxes[h.id as HorcruxId];
          const canToggle = !completed || isAdmin;
          return (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`
                glass rounded-xl p-4 md:p-5 transition-all
                ${completed ? 'border-emerald-500/30 bg-emerald-900/10' : 'border-transparent'}
              `}
            >
              <div className="flex items-start gap-4">
                {/* Badge */}
                <div className="flex-shrink-0">
                  <img
                    src={h.badgeImage}
                    alt={h.name}
                    className={`w-12 h-12 object-contain ${
                      completed ? 'badge-unlocked' : 'badge-locked'
                    }`}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3 className={`font-cinzel font-bold text-sm md:text-base ${
                      completed ? 'text-emerald-400' : 'text-gray-300'
                    }`}>
                      {h.emoji} {h.name}
                    </h3>
                    <span className="text-xs text-gray-600 flex-shrink-0">
                      Prueba {h.order}
                    </span>
                  </div>
                  <p className={`text-xs md:text-sm leading-relaxed ${
                    completed ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    {h.challenge}
                  </p>
                  <p className="text-xs text-emerald-600 mt-1 font-semibold">
                    ⏱ +{HORCRUX_SECONDS}s al Rosco
                  </p>
                </div>

                {/* Checkbox */}
                <button
                  onClick={() => handleToggle(h)}
                  disabled={!canToggle}
                  title={!canToggle ? 'Solo el admin puede desmarcar' : undefined}
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-lg border-2 transition-all
                    flex items-center justify-center
                    ${completed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-gray-600 hover:border-emerald-500 text-transparent hover:text-emerald-500/30'}
                    ${!canToggle ? 'cursor-not-allowed opacity-70' : ''}
                  `}
                >
                  <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>

              {completed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 pt-3 border-t border-emerald-800/30 flex items-center gap-2"
                >
                  <span className="text-emerald-500 text-xs font-semibold">✅ Horrocrux recuperado · +{HORCRUX_SECONDS}s añadido al Rosco</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* All completed info */}
      {completedCount === 7 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-8 p-6 text-center glass rounded-2xl border border-gold/30"
        >
          <div className="text-4xl mb-3">🏆</div>
          <h3 className="font-cinzel text-xl font-bold text-gold mb-2">
            ¡Todos los Horrocruxes recuperados!
          </h3>
          <p className="text-gray-400 text-sm mb-3">
            Lord Voldemort está a salvo. Draco ha demostrado su valía como un verdadero Malfoy.
          </p>
          <div className="flex flex-wrap justify-center gap-3 text-sm">
            <span className="px-3 py-1 rounded-full bg-emerald-900/40 border border-emerald-500/30 text-emerald-300">
              +{horcruxes.length}s (horrocruxes individuales)
            </span>
            <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/30 text-gold">
              +{COMPLETION_BONUS}s (bonus completar todos)
            </span>
            <span className="px-3 py-1 rounded-full bg-blue-900/40 border border-blue-500/30 text-blue-300 font-bold">
              = +{horcruxes.length + COMPLETION_BONUS}s total al Rosco
            </span>
          </div>
        </motion.div>
      )}

      {/* Modals */}
      {gainedModal && (
        <HorcruxModal
          horcrux={gainedModal.horcrux}
          secondsGained={gainedModal.seconds}
          onClose={() => setGainedModal(null)}
        />
      )}
      {showCompletionModal && (
        <CompletionModal onClose={() => setShowCompletionModal(false)} />
      )}
    </div>
  );
}
