import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useAuth, useAdminPreviewTheme } from '../../hooks/useAuth';
import { useGameState } from '../../context/GameStateContext';
import { horcruxes } from '../../data/horcruxes';
import { roscoQuestions, ROSCO_LETTERS } from '../../data/roscoQuestions';
import { deleteChatMessages } from '../../firebase/config';
import type { ThemeName, HorcruxId } from '../../types';
import { useEffect } from 'react';

export default function AdminPanel() {
  const { isAdmin, logout } = useAuth();
  const { previewTheme, setThemePreview } = useAdminPreviewTheme();
  const navigate = useNavigate();
  const [deleteConfirm, setDeleteConfirm] = useState(false);
  const {
    state,
    setHorcrux,
    resetRoscoLetter,
    addBonusHint,
    removeBonusHint,
    resetRosco,
    setCounter,
    updateRoscoStatus,
    setShowTransitionModal,
    setShowMarineroModal,
    setForcedUserTheme,
    setShowDosChat,
    isFirebase,
  } = useGameState();

  // Compute the resolved theme that non-admin users currently see
  const TARGET_UTC = new Date('2026-04-25T07:00:00Z').getTime();
  const MARINERO_UTC = new Date('2026-04-26T08:00:00Z').getTime();
  const resolvedUserTheme: ThemeName = state.forcedUserTheme
    ?? (Date.now() >= MARINERO_UTC ? 'marinero' : Date.now() >= TARGET_UTC ? 'slytherin' : 'carmena');
  const userThemeLabel = resolvedUserTheme === 'carmena' ? 'Carmena' : resolvedUserTheme === 'slytherin' ? 'Slytherin' : 'Marinero';

  const handleBack = () => {
    navigate('/');
  };

  useEffect(() => {
    if (!isAdmin) navigate('/');
  }, [isAdmin, navigate]);

  if (!isAdmin) return null;

  const completedHorcruxes = Object.values(state.horcruxes).filter(Boolean).length;
  const roscoStats = {
    correct: Object.values(state.rosco.statuses).filter((v) => v === 'correct').length,
    wrong: Object.values(state.rosco.statuses).filter((v) => v === 'wrong').length,
    pending: Object.values(state.rosco.statuses).filter((v) => v === 'pending').length,
    skipped: Object.values(state.rosco.statuses).filter((v) => v === 'skipped').length,
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
              className="px-4 py-2 text-sm rounded-lg transition-colors flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200"
            >
              ← Volver a web
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
        <Section title="🎨 Control de Temática (vista admin)" subtitle="Cambia la temática que ves tú como admin al volver a la web. No afecta a los usuarios.">
          <div className="flex flex-wrap gap-3">
            <ThemeButton
              active={previewTheme === 'carmena'}
              onClick={() => setThemePreview('carmena')}
              icon="🏛️"
              label="Manuela Carmena"
            />
            <ThemeButton
              active={previewTheme === 'slytherin'}
              onClick={() => setThemePreview('slytherin')}
              icon="🐍"
              label="Slytherin"
            />
            <ThemeButton
              active={previewTheme === 'marinero'}
              onClick={() => setThemePreview('marinero')}
              icon="⚓"
              label="Marinero"
            />
            <ThemeButton
              active={previewTheme === resolvedUserTheme}
              onClick={() => setThemePreview(resolvedUserTheme)}
              icon="👁️"
              label={`Vista usuario (${userThemeLabel})`}
            />
          </div>          {/* Modal toggle — only relevant when previewing Slytherin */}
          {previewTheme === 'slytherin' && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <button
                onClick={() => setShowTransitionModal(!state.showTransitionModal)}
                className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${
                  state.showTransitionModal ? 'bg-emerald-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    state.showTransitionModal ? 'translate-x-6' : ''
                  }`}
                />
              </button>
              <div>
                <p className="text-sm text-gray-300">Modal + transición animada</p>
                <p className="text-xs text-gray-500">
                  {state.showTransitionModal
                    ? 'Al volver: verás el modal épico y la transición'
                    : 'Al volver: cambio directo de temática sin animación'}
                </p>
              </div>
            </div>
          )}
          {/* Marinero modal toggle — only relevant when previewing Marinero */}
          {previewTheme === 'marinero' && (
            <div className="mt-4 flex items-center gap-3 p-3 bg-gray-800/50 rounded-lg">
              <button
                onClick={() => setShowMarineroModal(!state.showMarineroModal)}
                className={`relative w-12 h-6 rounded-full overflow-hidden transition-colors ${
                  state.showMarineroModal ? 'bg-sky-600' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${
                    state.showMarineroModal ? 'translate-x-6' : ''
                  }`}
                />
              </button>
              <div>
                <p className="text-sm text-gray-300">Modal + transición marina</p>
                <p className="text-xs text-gray-500">
                  {state.showMarineroModal
                    ? 'Al volver: verás el modal marino y la transición'
                    : 'Al volver: cambio directo de temática sin animación'}
                </p>
              </div>
            </div>
          )}
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
                    onClick={() => setCounter(c.key, state.counters[c.key] - 1)}
                    className="w-7 h-7 rounded bg-gray-700 hover:bg-gray-600 text-gray-300 flex items-center justify-center text-sm"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={state.counters[c.key]}
                    onChange={(e) => setCounter(c.key, parseInt(e.target.value) || 0)}
                    className="w-14 text-center bg-gray-900 text-white rounded px-2 py-1 text-sm border border-gray-700"
                  />
                  <button
                    onClick={() => setCounter(c.key, state.counters[c.key] + 1)}
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
              const completed = state.horcruxes[h.id];
              return (
                <div
                  key={h.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                    completed ? 'bg-emerald-900/20 border border-emerald-800/30' : 'bg-gray-800/50'
                  }`}
                >
                  <button
                    onClick={() => setHorcrux(h.id as HorcruxId, !completed)}
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
              onClick={addBonusHint}
              className="px-4 py-2 text-sm bg-blue-900/50 text-blue-300 rounded-lg border border-blue-700/30 hover:bg-blue-900/70 transition-all"
            >
              💡 +1 Pista extra ({state.rosco.maxHints + state.rosco.bonusHints - state.rosco.hintsUsed} disponibles)
            </button>
            <button
              onClick={removeBonusHint}
              disabled={state.rosco.bonusHints === 0}
              className="px-4 py-2 text-sm bg-amber-900/50 text-amber-300 rounded-lg border border-amber-700/30 hover:bg-amber-900/70 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              💡 −1 Pista extra
            </button>
            <button
              onClick={resetRosco}
              className="px-4 py-2 text-sm bg-red-900/50 text-red-300 rounded-lg border border-red-700/30 hover:bg-red-900/70 transition-all"
            >
              🔄 Resetear rosco
            </button>
          </div>

          {/* Letter grid */}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {ROSCO_LETTERS.map((letter) => {
              const status = state.rosco.statuses[letter];
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
                      onClick={() => resetRoscoLetter(letter)}
                      className="mt-1 text-[10px] text-blue-400 hover:text-blue-300"
                    >
                      Resetear
                    </button>
                  )}
                  {status !== 'correct' ? (
                    <button
                      onClick={() => updateRoscoStatus(letter, 'correct')}
                      className="mt-1 text-[10px] text-emerald-400 hover:text-emerald-300 block w-full"
                    >
                      ✓ Marcar válida
                    </button>
                  ) : (
                    <button
                      onClick={() => updateRoscoStatus(letter, 'pending')}
                      className="mt-1 text-[10px] text-amber-400 hover:text-amber-300 block w-full"
                    >
                      ✕ Desmarcar
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Forced user theme control */}
        <Section
          title="🎯 Temática del Usuario (no-admin)"
          subtitle="Fuerza la temática que ven los usuarios normales. Por defecto, se usa la lógica de tiempo (Carmena → Slytherin el sábado a las 9AM)"
        >
          <div className="flex flex-wrap gap-3">
            <ThemeButton
              active={state.forcedUserTheme == null}
              onClick={() => setForcedUserTheme(null)}
              icon="⏱️"
              label="Automático (por tiempo)"
            />
            <ThemeButton
              active={state.forcedUserTheme === 'carmena'}
              onClick={() => setForcedUserTheme('carmena')}
              icon="🏛️"
              label="Forzar Carmena"
            />
            <ThemeButton
              active={state.forcedUserTheme === 'slytherin'}
              onClick={() => setForcedUserTheme('slytherin')}
              icon="🐍"
              label="Forzar Slytherin"
            />
            <ThemeButton
              active={state.forcedUserTheme === 'marinero'}
              onClick={() => setForcedUserTheme('marinero')}
              icon="⚓"
              label="Forzar Marinero"
            />
          </div>
          {state.forcedUserTheme != null && (
            <p className="mt-3 text-xs text-amber-400/80 bg-amber-900/20 rounded-lg p-2">
              ⚠️ Temática forzada a <strong>{state.forcedUserTheme === 'carmena' ? 'Manuela Carmena' : state.forcedUserTheme === 'slytherin' ? 'Slytherin' : 'Marinero'}</strong>. Los usuarios no-admin verán esta temática independientemente de la hora.
            </p>
          )}
        </Section>

        {/* DOS Console Chat control */}
        <Section
          title="💻 Consola DOS (Chat previo a Carmena)"
          subtitle="Activa o desactiva la vista de consola MS-DOS con chat. Cubre toda la pantalla para el usuario no-admin"
        >
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowDosChat(!state.showDosChat)}
              className={`relative w-14 h-7 shrink-0 rounded-full overflow-hidden transition-colors ${
                state.showDosChat ? 'bg-emerald-600' : 'bg-gray-600'
              }`}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white transition-transform ${
                  state.showDosChat ? 'translate-x-7' : ''
                }`}
              />
            </button>
            <div>
              <p className="text-sm text-gray-300">
                {state.showDosChat ? '🟢 Consola DOS activa' : '⚪ Consola DOS desactivada'}
              </p>
              <p className="text-xs text-gray-500">
                {state.showDosChat
                  ? 'Admin: consola con header. Usuarios: pantalla completa.'
                  : 'Los usuarios ven la web normal'}
              </p>
            </div>
          </div>
        </Section>

        {/* Chat message history management */}
        <Section
          title="🗑️ Historial del Chat"
          subtitle="Borra todos los mensajes del chat de la consola DOS"
        >
          {deleteConfirm ? (
            <div className="flex items-center gap-3 p-3 bg-red-900/20 rounded-lg border border-red-700/30">
              <p className="text-sm text-red-300 flex-1">¿Seguro que quieres borrar todos los mensajes? Esta acción no se puede deshacer.</p>
              <button
                onClick={() => {
                  deleteChatMessages();
                  setDeleteConfirm(false);
                }}
                className="px-4 py-2 text-sm bg-red-700 text-white rounded-lg hover:bg-red-600 transition-colors whitespace-nowrap"
              >
                Sí, borrar todo
              </button>
              <button
                onClick={() => setDeleteConfirm(false)}
                className="px-4 py-2 text-sm bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
            </div>
          ) : (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="px-4 py-2 text-sm bg-red-900/50 text-red-300 rounded-lg border border-red-700/30 hover:bg-red-900/70 transition-all flex items-center gap-2"
            >
              🗑️ Borrar historial del chat
            </button>
          )}
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
