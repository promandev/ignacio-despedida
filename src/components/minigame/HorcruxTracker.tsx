import { motion } from 'framer-motion';
import { useGameState } from '../../context/GameStateContext';
import { horcruxes } from '../../data/horcruxes';
import type { HorcruxId } from '../../types';

export default function HorcruxTracker() {
  const { state, toggleHorcrux } = useGameState();
  const completedCount = Object.values(state.horcruxes).filter(Boolean).length;

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
            animate={state.horcruxes[h.id] ? { scale: [1, 1.15, 1] } : {}}
            className="text-center"
          >
            <div
              className={`
                w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden
                flex items-center justify-center
                ${state.horcruxes[h.id] ? '' : ''}
              `}
            >
              <img
                src={h.badgeImage}
                alt={h.name}
                className={`w-12 h-12 md:w-14 md:h-14 object-contain ${
                  state.horcruxes[h.id] ? 'badge-unlocked' : 'badge-locked'
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
          const completed = state.horcruxes[h.id];
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
                </div>

                {/* Checkbox */}
                <button
                  onClick={() => toggleHorcrux(h.id as HorcruxId)}
                  className={`
                    flex-shrink-0 w-8 h-8 rounded-lg border-2 transition-all
                    flex items-center justify-center
                    ${completed
                      ? 'bg-emerald-600 border-emerald-500 text-white'
                      : 'border-gray-600 hover:border-emerald-500 text-transparent hover:text-emerald-500/30'}
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

              {/* Completion glow */}
              {completed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 pt-3 border-t border-emerald-800/30 flex items-center gap-2"
                >
                  <span className="text-emerald-500 text-xs font-semibold">✅ Horrocrux recuperado</span>
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Victory message */}
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
          <p className="text-gray-400 text-sm">
            Lord Voldemort está a salvo. Draco ha demostrado su valía como un verdadero Malfoy.
            Ahora, solo queda el Rosco Final...
          </p>
        </motion.div>
      )}
    </div>
  );
}
