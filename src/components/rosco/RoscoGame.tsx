import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRosco } from '../../hooks/useRosco';
import { useGameState } from '../../context/GameStateContext';
import RoscoWheel from './RoscoWheel';
import AnswerInput from './AnswerInput';

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

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
    timeRemaining,
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

  const timerColor =
    timeRemaining <= 10
      ? 'text-red-400'
      : timeRemaining <= 20
      ? 'text-amber-400'
      : 'text-emerald-400';

  const hasStarted = stats.correct + stats.wrong + stats.skipped > 0 || !rosco.isPaused;

  if (rosco.isComplete) {
    return <RoscoResults stats={stats} timeRemaining={timeRemaining} />;
  }

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gold mb-2">
          🍩 Rosco de Harry Potter
        </h2>
        <p className="text-gray-400 text-sm">
          Ronda final de preguntas · Cada fallo implica beber
        </p>
      </div>

      <div className="flex justify-center gap-4 mb-4 text-xs">
        <StatBadge color="bg-emerald-600" label="Correctas" value={stats.correct} />
        <StatBadge color="bg-red-600" label="Fallos" value={stats.wrong} />
        <StatBadge color="bg-amber-600" label="Saltadas" value={stats.skipped} />
        <StatBadge color="bg-gray-600" label="Pendientes" value={stats.pending} />
      </div>

      {hasStarted && (
        <div className="flex justify-center mb-4">
          <motion.div
            className={`glass rounded-xl px-6 py-2 flex items-center gap-2 font-mono font-bold text-2xl ${timerColor}`}
            animate={timeRemaining <= 10 && !rosco.isPaused ? { scale: [1, 1.08, 1] } : {}}
            transition={{ duration: 0.5, repeat: Infinity }}
          >
            ⏱ {formatTime(timeRemaining)}
          </motion.div>
        </div>
      )}

      {rosco.isPaused && (
        <div className="text-center mb-6">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={togglePause}
            className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30 hover:bg-emerald-500 transition-all"
          >
            ▶️ {hasStarted ? 'Continuar' : 'Comenzar'} Rosco
          </motion.button>
        </div>
      )}

      <RoscoWheel
        statuses={rosco.statuses}
        currentLetter={rosco.currentLetter}
      />

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

            <div className="py-2">
              <AnswerInput
                answer={currentQuestion.answer}
                userInput={currentInput}
                revealedIndices={revealedIndices}
                onCharChange={(idx, ch) => setCharAt(rosco.currentLetter, idx, ch)}
              />
            </div>

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

const CONFETTI_COLORS = ['#FFD700', '#7CFC00', '#00BFFF', '#FF69B4', '#FF6347', '#9370DB'];

function ConfettiPiece({ delay, x, color }: { delay: number; x: number; color: string }) {
  return (
    <motion.div
      className="absolute w-3 h-3 rounded-sm"
      style={{ left: `${x}%`, top: '-10%', backgroundColor: color }}
      initial={{ y: 0, opacity: 1, rotate: 0 }}
      animate={{ y: '110vh', opacity: [1, 1, 0], rotate: 720 }}
      transition={{ duration: 2.5 + Math.random(), delay, ease: 'easeIn' }}
    />
  );
}

function RoscoResults({
  stats,
  timeRemaining,
}: {
  stats: { correct: number; wrong: number; skipped: number; total: number };
  timeRemaining: number;
}) {
  const percentage = Math.round((stats.correct / stats.total) * 100);
  const perfect = percentage === 100;
  const timedOut = timeRemaining === 0;

  const message = perfect
    ? '¡Lo has conseguido! Eres un verdadero mago 🧙‍♂️'
    : timedOut
    ? '¡Se acabó el tiempo! Pero lo intentaste con todo...'
    : percentage >= 70
    ? '¡Muy bien! Severus estaría orgulloso 🐍'
    : percentage >= 50
    ? 'No está mal, pero necesitas más práctica ⚡'
    : 'Toca beber bastante... 🍺';

  const confettiPieces = useMemo(
    () =>
      perfect
        ? Array.from({ length: 60 }, (_, i) => ({
            id: i,
            delay: Math.random() * 1.5,
            x: Math.random() * 100,
            color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          }))
        : [],
    [perfect]
  );

  return (
    <div className="relative overflow-hidden">
      {perfect && (
        <div className="pointer-events-none absolute inset-0 z-10">
          {confettiPieces.map((p) => (
            <ConfettiPiece key={p.id} delay={p.delay} x={p.x} color={p.color} />
          ))}
        </div>
      )}

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8 relative z-0"
      >
        <motion.div
          className="text-5xl mb-4 inline-block"
          animate={
            perfect ? { scale: [1, 1.3, 1], rotate: [0, -10, 10, -10, 0] } : {}
          }
          transition={perfect ? { duration: 1, repeat: 2, delay: 0.3 } : {}}
        >
          {perfect ? '🏆' : timedOut ? '⌛' : percentage >= 70 ? '🎉' : percentage >= 50 ? '🤔' : '🍻'}
        </motion.div>

        {perfect && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-xs font-bold tracking-widest text-gold uppercase mb-1"
          >
            ✨ ¡Rosco Perfecto! ✨
          </motion.div>
        )}

        <h2 className="font-cinzel text-2xl md:text-3xl font-bold text-gold mb-2">
          {timedOut && !perfect ? '¡Tiempo agotado!' : '¡Rosco completado!'}
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
    </div>
  );
}
