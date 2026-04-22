import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { useGameState, INITIAL_STATE } from '../../context/GameStateContext';
import { horcruxes } from '../../data/horcruxes';
import { roscoQuestions, ROSCO_LETTERS } from '../../data/roscoQuestions';
import type { GameState } from '../../types';
import { useEffect, useState } from 'react';

export default function AdminPanel() {
  const { isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const {
    state,
    batchUpdate,
    isFirebase,
  } = useGameState();

  // All changes are staged locally; applied when clicking "Volver a web"
  const [localState, setLocalState] = useState<GameState>(() => state);

  const patchLocal = (patch: Partial<GameState>) =>
    setLocalState((prev) => ({ ...prev, ...patch }));

  const handleBack = () => {
    // Determine if a transition animation should play
    const shouldTransition =
      localState.currentTheme === 'slytherin' && state.currentTheme === 'carmena';
    batchUpdate({
      ...localState,
      transitionTriggered: shouldTransition || localState.transitionTriggered,
    });
    navigate('/');
  };

  const hasChanges = JSON.stringify(localState) !== JSON.stringify(state);

  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const completedHorcruxes = Object.values(localState.horcruxes).filter(Boolean).length;
  const roscoStats = {
    correct: Object.values(localState.rosco.statuses).filter((v) => v === 'correct').length,
    wrong: Object.values(localState.rosco.statuses).filter((v) => v === 'wrong').length,
    pending: Object.values(localState.rosco.statuses).filter((v) => v === 'pending').length,
    skipped: Object.values(localState.rosco.statuses).filter((v) => v === 'skipped').length,
  };

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              ⚙️ Panel de Administración
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {isFirebase ? '🟢 Firebase conectado' : '🟡 Modo local (localStorage)'}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleBack}
              className={`px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 ${
                hasChanges
                  ? 'bg-emerald-700 hover:bg-emerald-600 text-white'
                  : 'bg-gray-800 hover:bg-gray-700 text-gray-200'
              }`}
            >
              {hasChanges && <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />}
              ← Volver a web{hasChanges ? ' (guardar)' : ''}
            </button>
            <button
              onClick={() => { logout(); navigate('/'); }}
              className="px-4 py-2 text-sm bg-red-900/50 text-red-300 rounded-lg hover:bg-red-900/70 transition-colors"
            >
              Cerrar sesión
            </button>
          </div>
        </div>

        {/* Theme control */}
        <Section title="🎨 Control de Temática" subtitle="Cambia entre las dos temáticas de la web">
          <div className="flex flex-wrap gap-3">
            <ThemeButton
              active={localState.currentTheme === 'carmena'}
              onClick={() => patchLocal({ currentTheme: 'carmena', transitionTriggered: false })}
              icon="🏛️"
              label="Manuela Carmena"
            />
            <ThemeButton
              active={localState.currentTheme === 'slytherin'}
              onClick={() => patchLocal({ currentTheme: 'slytherin' })}
              icon="🐍"
              label="Slytherin"
            />
          </div>
          {localState.currentTheme === 'carmena' && !localState.transitionTriggered && (
            <button
              onClick={() => patchLocal({ transitionTriggered: true, currentTheme: 'slytherin' })}
              className="mt-4 px-4 py-2 text-sm bg-purple-900/50 text-purple-300 rounded-lg border border-purple-700/30 hover:bg-purple-900/70 transition-all"
            >
              ⚡ Forzar transición animada
            </button>
          )}
          {/* Transition modal toggle */}
          <div className="mt-4 flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
            <button
              onClick={() => patchLocal({ showTransitionModal: !localState.showTransitionModal })}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                localState.showTransitionModal ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                  localState.showTransitionModal ? 'translate-x-6' : ''
                }`}
              />
            </button>
            <div>
              <p className="text-sm text-gray-300">Modal de transición</p>
              <p className="text-xs text-gray-500">
                {localState.showTransitionModal
                  ? 'Se mostrará el modal al cambiar a Slytherin'
                  : 'Cambio directo sin modal de transición'}
              </p>
            </div>
          </div>
        </Section>

        {/* Counter management */}
        <Section title="📊 Contadores (Ignaciómetro)" subtitle="Modifica los contadores de la sección Carmena">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {([
              { key: 'copas' as const, icon: '🍷', label: 'Copas bebidas' },
              { key: 'aguasConGas' as const, icon: '💧', label: 'Aguas con gas' },
              { key: 'discursosMadridCentral' as const, icon: '🚗', label: 'Discursos Madrid Central' },
              { key: 'frotaManos' as const, icon: '🤲', label: 'Veces frotando manos' },
            ]).map((c) => (
              <div key={c.key} className="flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
                <span className="text-xl">{c.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{c.label}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => patchLocal({ counters: { ...localState.counters, [c.key]: Math.max(0, localState.counters[c.key] - 1) } })}
                    className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={localState.counters[c.key]}
                    onChange={(e) => patchLocal({ counters: { ...localState.counters, [c.key]: parseInt(e.target.value) || 0 } })}
                    className="w-14 text-center bg-gray-900 text-white rounded px-2 py-1 text-sm border border-gray-700"
                  />
                  <button
                    onClick={() => patchLocal({ counters: { ...localState.counters, [c.key]: localState.counters[c.key] + 1 } })}
                    className="w-7 h-7 rounded bg-emerald-800 hover:bg-emerald-700 text-emerald-300 flex items-center justify-center text-sm"
                  >
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* Horcrux management */}
        <Section
          title="🔮 Horrocruxes"
          subtitle={`${completedHorcruxes}/7 completados`}
        >
          <div className="space-y-2">
            {horcruxes.map((h) => {
              const completed = localState.horcruxes[h.id];
              return (
                <div
                  key={h.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    completed ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-gray-800/50'
                  }`}
                >
                  <button
                    onClick={() => patchLocal({ horcruxes: { ...localState.horcruxes, [h.id]: !completed } })}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                      completed
                        ? 'bg-emerald-600 border-emerald-500 text-white'
                        : 'border-gray-600 hover:border-emerald-500'
                    }`}
                  >
                    {completed && (
                      <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                  <span className="text-lg">{h.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${completed ? 'text-emerald-400' : 'text-gray-300'}`}>
                      {h.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{h.challenge.substring(0, 60)}...</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded ${
                    completed ? 'bg-emerald-800/50 text-emerald-400' : 'bg-gray-700 text-gray-400'
                  }`}>
                    {completed ? '✅' : 'Pendiente'}
                  </span>
                </div>
              );
            })}
          </div>
        </Section>

        {/* Rosco management */}
        <Section
          title="🍩 Rosco de Harry Potter"
          subtitle={`Correctas: ${roscoStats.correct} | Fallos: ${roscoStats.wrong} | Pendientes: ${roscoStats.pending + roscoStats.skipped}`}
        >
          {/* Rosco controls */}
          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={() => patchLocal({ rosco: { ...localState.rosco, bonusHints: localState.rosco.bonusHints + 1 } })}
              className="px-4 py-2 text-sm bg-blue-900/50 text-blue-300 rounded-lg border border-blue-700/30 hover:bg-blue-900/70 transition-all"
            >
              💡 +1 Pista extra ({localState.rosco.maxHints + localState.rosco.bonusHints - localState.rosco.hintsUsed} disponibles)
            </button>
            <button
              onClick={() => patchLocal({ rosco: INITIAL_STATE.rosco })}
              className="px-4 py-2 text-sm bg-red-900/50 text-red-300 rounded-lg border border-red-700/30 hover:bg-red-900/70 transition-all"
            >
              🔄 Resetear rosco
            </button>
          </div>

          {/* Letter grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {ROSCO_LETTERS.map((letter) => {
              const status = localState.rosco.statuses[letter];
              const question = roscoQuestions.find((q) => q.letter === letter);
              const statusColors = {
                pending: 'bg-gray-800 border-gray-700',
                correct: 'bg-emerald-900/30 border-emerald-700/50',
                wrong: 'bg-red-900/30 border-red-700/50',
                skipped: 'bg-amber-900/30 border-amber-700/50',
              };
              const statusIcons = {
                pending: '⬜',
                correct: '✅',
                wrong: '❌',
                skipped: '⏭️',
              };

              return (
                <div
                  key={letter}
                  className={`p-2 rounded-lg border text-center ${statusColors[status]}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-cinzel font-bold text-sm text-gray-300">{letter}</span>
                    <span className="text-xs">{statusIcons[status]}</span>
                  </div>
                  <p className="text-[10px] text-gray-500 truncate" title={question?.answer}>
                    {question?.answer}
                  </p>
                  {(status === 'wrong' || status === 'skipped') && (
                    <button
                      onClick={() => patchLocal({
                        rosco: {
                          ...localState.rosco,
                          statuses: { ...localState.rosco.statuses, [letter]: 'pending' },
                          revealedHints: { ...localState.rosco.revealedHints, [letter]: [] },
                        },
                      })}
                      className="mt-1 text-[10px] text-blue-400 hover:text-blue-300"
                    >
                      Resetear
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 bg-gray-900 rounded-2xl p-5 md:p-6 border border-gray-800"
    >
      <h2 className="text-lg font-bold text-white mb-1">{title}</h2>
      {subtitle && <p className="text-sm text-gray-500 mb-4">{subtitle}</p>}
      {children}
    </motion.section>
  );
}

function ThemeButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-5 py-3 rounded-xl font-medium text-sm transition-all flex items-center gap-2
        ${active
          ? 'bg-emerald-600 text-white shadow-lg ring-2 ring-emerald-400'
          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}
      `}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      {active && <span className="ml-1 text-xs opacity-70">● Activo</span>}
    </button>
  );
}
