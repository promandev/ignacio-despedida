import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRosco } from '../../hooks/useRosco';
import { useGameState } from '../../context/GameStateContext';
import RoscoWheel from './RoscoWheel';
import AnswerInput from './AnswerInput';

export default function RoscoGame() {
  const {
    rosco,
    currentQuestion,
    getCurrentInput,
    setCharAt,
    submitAnswer,
    skipLetter,
    requestHint,
    togglePause,
    stats,
    hintsRemaining,
  } = useRosco();
  const { state } = useGameState();

  const currentInput = useMemo(
    () => (currentQuestion ? getCurrentInput(rosco.currentLetter) : []),
    [currentQuestion, getCurrentInput, rosco.currentLetter]
  );

  const revealedIndices = useMemo(
    () => rosco.revealedHints[rosco.currentLetter] || [],
    [rosco.revealedHints, rosco.currentLetter]
  );

  if (rosco.isComplete) {
    return <RoscoResults stats={stats} />;
  }

  return (
    <div>
      {/* Title */}
      <div className="text-center mb-6">
        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gold mb-2">
          🍩 Rosco de Harry Potter
        </h2>
        <p className="text-gray-400 text-sm">
          Ronda final de preguntas · Cada fallo implica beber
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex justify-center gap-4 mb-6 text-xs">
        <StatBadge color="bg-emerald-600" label="Correctas" value={stats.correct} />
        <StatBadge color="bg-red-600" label="Fallos" value={stats.wrong} />
        <StatBadge color="bg-amber-600" label="Saltadas" value={stats.skipped} />
        <StatBadge color="bg-gray-600" label="Pendientes" value={stats.pending} />
      </div>

      {/* Pause/Resume */}
      {rosco.isPaused && (
        <div className="text-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePause}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            ▶️ {stats.correct + stats.wrong + stats.skipped > 0 ? 'Continuar' : 'Comenzar'} Rosco
          </motion.button>
        </div>
      )}

      {/* Rosco Wheel */}
      <RoscoWheel
        statuses={rosco.statuses}
        currentLetter={rosco.currentLetter}
      />

      {/* Question & Answer area */}
      {!rosco.isPaused && currentQuestion && (
        <AnimatePresence mode="wait">
          <motion.div
            key={rosco.currentLetter}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mt-6 space-y-5"
          >
            {/* Question card */}
            <div className="glass rounded-xl p-4 md:p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-3">
                <span className="w-8 h-8 rounded-full bg-blue-600 text-white font-cinzel font-bold flex items-center justify-center text-sm">
                  {rosco.currentLetter}
                </span>
                <span className="text-gray-400 text-xs uppercase tracking-wider">
                  {rosco.currentLetter === 'Ñ' ? 'Contiene la Ñ' : `Empieza por ${rosco.currentLetter}`}
                </span>
              </div>
              <p className="text-gray-200 text-sm md:text-base leading-relaxed">
                {currentQuestion.hint}
              </p>
            </div>

            {/* Answer input */}
            <div className="py-2">
              <AnswerInput
                answer={currentQuestion.answer}
                userInput={currentInput}
                revealedIndices={revealedIndices}
                onCharChange={(idx, ch) => setCharAt(rosco.currentLetter, idx, ch)}
              />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={() => submitAnswer(rosco.currentLetter)}
                className="px-5 py-2.5 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-500 transition-all text-sm flex items-center gap-2"
              >
                ✓ Responder
              </button>
              <button
                onClick={() => skipLetter(rosco.currentLetter)}
                className="px-5 py-2.5 bg-amber-700/50 text-amber-300 font-semibold rounded-xl border border-amber-600/30 hover:bg-amber-700/70 transition-all text-sm flex items-center gap-2"
              >
                ⏭ Pasapalabra
              </button>
              <button
                onClick={requestHint}
                disabled={hintsRemaining <= 0}
                className="px-5 py-2.5 bg-blue-800/50 text-blue-300 font-semibold rounded-xl border border-blue-600/30 hover:bg-blue-800/70 transition-all text-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                title={`${hintsRemaining} pistas restantes`}
              >
                💡 Pista ({hintsRemaining})
              </button>
              <button
                onClick={togglePause}
                className="px-5 py-2.5 bg-gray-700/50 text-gray-300 font-semibold rounded-xl border border-gray-600/30 hover:bg-gray-700/70 transition-all text-sm flex items-center gap-2"
              >
                ⏸ Pausar
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
}

function StatBadge({ color, label, value }: { color: string; label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className={`w-3 h-3 rounded-full ${color}`} />
      <span className="text-gray-400">
        {label}: <strong className="text-gray-200">{value}</strong>
      </span>
    </div>
  );
}

function RoscoResults({ stats }: { stats: { correct: number; wrong: number; skipped: number; total: number } }) {
  const percentage = Math.round((stats.correct / stats.total) * 100);
  const message =
    percentage === 100
      ? '¡Perfecto! Eres un verdadero mago 🧙‍♂️'
      : percentage >= 70
      ? '¡Muy bien! Severus estaría orgulloso 🐍'
      : percentage >= 50
      ? 'No está mal, pero necesitas más práctica ⚡'
      : 'Toca beber bastante... 🍺';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center py-8"
    >
      <div className="text-5xl mb-4">
        {percentage === 100 ? '🏆' : percentage >= 70 ? '🎉' : percentage >= 50 ? '🤔' : '🍻'}
      </div>
      <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gold mb-2">
        ¡Rosco completado!
      </h2>
      <p className="text-gray-400 mb-6">{message}</p>

      <div className="grid grid-cols-3 gap-4 max-w-xs mx-auto mb-8">
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-emerald-400">{stats.correct}</div>
          <div className="text-xs text-gray-500">Correctas</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-red-400">{stats.wrong}</div>
          <div className="text-xs text-gray-500">Fallos</div>
        </div>
        <div className="glass rounded-xl p-4">
          <div className="text-2xl font-bold text-amber-400">{stats.skipped}</div>
          <div className="text-xs text-gray-500">Sin responder</div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 max-w-xs mx-auto">
        <div className="text-4xl font-bold text-gold font-cinzel">{percentage}%</div>
        <div className="text-xs text-gray-500 mt-1">Puntuación final</div>
      </div>
    </motion.div>
  );
}
