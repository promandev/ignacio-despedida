import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import HorcruxTracker from '../minigame/HorcruxTracker';
import RoscoGame from '../rosco/RoscoGame';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.6 },
};

// Enhanced floating particles — more evil atmosphere
function Particles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 35 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 20,
        duration: 12 + Math.random() * 25,
        size: 3 + Math.random() * 12,
        symbol: ['✦', '🐍', '⚡', '✧', '◆', '☠', '💀', '🕷️', '⬟', '☽'][Math.floor(Math.random() * 10)],
        opacity: 0.15 + Math.random() * 0.25,
      })),
    []
  );
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <span
          key={p.id}
          className="particle"
          style={{
            left: `${p.left}%`,
            fontSize: `${p.size}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            opacity: p.opacity,
            color: p.id % 3 === 0 ? '#34d399' : p.id % 3 === 1 ? '#D4AF37' : '#6b7280',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}

// Fog / smoke effect overlay
function FogOverlay() {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      <motion.div
        animate={{ x: ['-20%', '10%', '-20%'], opacity: [0.03, 0.07, 0.03] }}
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
        className="absolute -top-1/2 -left-1/4 w-[150%] h-[200%] bg-gradient-radial from-emerald-900/10 via-transparent to-transparent rounded-full blur-3xl"
      />
      <motion.div
        animate={{ x: ['10%', '-15%', '10%'], opacity: [0.04, 0.08, 0.04] }}
        transition={{ duration: 25, repeat: Infinity, ease: 'linear', delay: 5 }}
        className="absolute -bottom-1/2 -right-1/4 w-[150%] h-[200%] bg-gradient-radial from-green-900/10 via-transparent to-transparent rounded-full blur-3xl"
      />
      {/* Dark vignette around edges */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]" />
    </div>
  );
}

export default function SlytherinTheme() {
  const [activeSection, setActiveSection] = useState<'home' | 'horcruxes' | 'rosco'>('home');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen relative"
    >
      <Particles />
      <FogOverlay />

      {/* HERO */}
      <section
        id="hero"
        className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden"
      >
        {/* Dark gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-black via-[#0a1a0e] to-[#0a0f0a] -z-10" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[100px] -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="text-6xl md:text-8xl mb-4"
          >
            🐍
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 text-emerald-400 text-xs font-medium mb-6 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>EXPEDIENTE CLASIFICADO</span>
          </motion.div>

          <h1 className="font-cinzel text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span className="text-emerald-400">Expediente Azkaban:</span>
            <br />
            <span className="text-gray-200">Misión Zaragoza</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg mb-4 leading-relaxed max-w-xl mx-auto">
            <span className="text-emerald-400 font-semibold">Sujeto:</span> Draco Malfoy (Prisionero X-Y390)
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Custodios: El Ministerio de la Despedida
          </p>

          {/* Section navigation */}
          <div className="flex flex-wrap justify-center gap-3">
            <NavButton
              active={activeSection === 'home'}
              onClick={() => setActiveSection('home')}
              icon="🏠"
              label="Inicio"
            />
            <NavButton
              active={activeSection === 'horcruxes'}
              onClick={() => setActiveSection('horcruxes')}
              icon="⚡"
              label="Horrocruxes"
            />
            <NavButton
              active={activeSection === 'rosco'}
              onClick={() => setActiveSection('rosco')}
              icon="🔮"
              label="Rosco"
            />
          </div>
        </motion.div>

        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 text-emerald-500/50 text-2xl"
        >
          ↓
        </motion.div>
      </section>

      {/* Conditional sections based on navigation */}
      {activeSection === 'home' && (
        <>
          {/* PHOTO — Always visible */}
          <section className="py-12 px-4 relative z-10">
            <div className="max-w-sm mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ type: 'spring', damping: 22, stiffness: 45, mass: 1.4 }}
                className="relative overflow-hidden rounded-2xl border border-emerald-500/20 shadow-2xl shadow-emerald-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/30 to-black/40 z-10" />
                <img
                  src="/images/slytherin/ignacio-draco.png"
                  alt="Draco Malfoy - Ignacio"
                  className="w-full h-auto relative"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 z-20">
                  <p className="text-emerald-400 font-cinzel font-bold text-lg">
                    Draco Malfoy
                  </p>
                  <p className="text-gray-400 text-sm">Prisionero X-Y390 · Slytherin</p>
                </div>
                {/* Glow effect */}
                <motion.div
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute inset-0 border-2 border-emerald-400/20 rounded-2xl z-30 pointer-events-none"
                />
              </motion.div>
            </div>
          </section>

          {/* SLYTHERIN CONTENT */}
          <section className="py-16 px-4 relative z-10">
            <div className="max-w-3xl mx-auto">
              <motion.div {...fadeUp} className="text-center mb-12">
                <span className="text-xs font-semibold text-emerald-500 uppercase tracking-[0.3em] font-cinzel">
                  La casa elegida
                </span>
                <h2 className="font-cinzel text-3xl md:text-4xl font-bold text-gray-200 mt-3">
                  La Grandeza de <span className="text-emerald-400">Slytherin</span>
                </h2>
                <div className="w-16 h-0.5 bg-emerald-500 mx-auto mt-4" />
              </motion.div>

              <div className="space-y-6">
                <motion.div
                  {...fadeUp}
                  className="glass rounded-2xl p-6 md:p-8"
                >
                  <h3 className="font-cinzel text-xl font-bold text-emerald-400 mb-3">
                    🐍 Ambición sin límites
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Slytherin no es solo una casa; es un linaje de grandeza. Fundada por{' '}
                    <strong className="text-emerald-300">Salazar Slytherin</strong>, esta casa ha
                    forjado a los magos más poderosos y determinados del mundo mágico.
                    La ambición no es un defecto: es el combustible de los que cambian la historia.
                  </p>
                </motion.div>

                <motion.div
                  {...fadeUp}
                  className="glass rounded-2xl p-6 md:p-8"
                >
                  <h3 className="font-cinzel text-xl font-bold text-emerald-400 mb-3">
                    🌑 Lord Voldemort: El incomprendido
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    Durante demasiado tiempo, la historia la han escrito los{' '}
                    <em className="text-gray-400">Gryffindors</em>. Pero la verdad es clara:{' '}
                    <strong className="text-emerald-300">Tom Riddle</strong> fue un visionario.
                    Un huérfano que se convirtió en el mago más poderoso de todos los tiempos.
                    Desafió la muerte misma, creó los Horrocruxes para trascender la mortalidad,
                    y buscó un mundo donde los magos ya no tuvieran que esconderse.
                  </p>
                  <p className="text-gray-400 text-sm mt-3 italic">
                    "No existe el bien ni el mal, solo el poder y aquellos demasiado débiles para buscarlo."
                  </p>
                </motion.div>

                <motion.div
                  {...fadeUp}
                  className="glass rounded-2xl p-6 md:p-8"
                >
                  <h3 className="font-cinzel text-xl font-bold text-emerald-400 mb-3">
                    🏆 Slytherins ilustres
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      { name: 'Severus Snape', role: 'El verdadero héroe' },
                      { name: 'Merlin', role: 'Sí, era Slytherin' },
                      { name: 'Draco Malfoy', role: 'Nobleza y elegancia' },
                      { name: 'Horace Slughorn', role: 'Maestro de pociones' },
                    ].map((s) => (
                      <div key={s.name} className="bg-emerald-900/20 rounded-lg p-3 border border-emerald-800/30">
                        <p className="text-emerald-300 font-semibold">{s.name}</p>
                        <p className="text-gray-500 text-xs">{s.role}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* MISSION OBJECTIVE */}
          <section className="py-16 px-4 relative z-10">
            <div className="max-w-2xl mx-auto text-center">
              <motion.div {...fadeUp}>
                <div className="glass rounded-2xl p-6 md:p-8 border border-gold/20">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-cinzel text-xl font-bold text-gold mb-3">Objetivo de la Misión</h3>
                  <p className="text-gray-300 leading-relaxed">
                    Draco debe recuperar los <strong className="text-gold">7 Horrocruxes</strong> antes
                    que Harry para salvar a su amo, Lord Voldemort. Cada prueba superada otorga un
                    Horrocrux. Los custodios serán los encargados de validar cada reto.
                  </p>
                  <div className="mt-4 p-3 bg-emerald-900/30 rounded-lg border border-emerald-700/30">
                    <p className="text-emerald-400 text-sm font-cinzel font-semibold">
                      👑 Regla de Oro
                    </p>
                    <p className="text-gray-400 text-sm mt-1">
                      Draco debe mantener la soberbia y elegancia propias de un Malfoy en todo momento.
                    </p>
                  </div>
                </div>
              </motion.div>

              {/* CTA to navigate */}
              <motion.div {...fadeUp} className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  onClick={() => setActiveSection('horcruxes')}
                  className="px-6 py-3 bg-emerald-800/50 text-emerald-300 font-semibold rounded-xl border border-emerald-500/30 hover:bg-emerald-700/50 transition-all font-cinzel text-sm"
                >
                  ⚡ Ver Horrocruxes
                </button>
                <button
                  onClick={() => setActiveSection('rosco')}
                  className="px-6 py-3 bg-gold/10 text-gold font-semibold rounded-xl border border-gold/30 hover:bg-gold/20 transition-all font-cinzel text-sm"
                >
                  🔮 Ir al Rosco
                </button>
              </motion.div>
            </div>
          </section>
        </>
      )}

      {activeSection === 'horcruxes' && (
        <section id="horcruxes" className="py-8 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setActiveSection('home')}
              className="text-emerald-500 text-sm mb-6 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              ← Volver
            </button>

            {/* Wanted Poster */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-10"
            >
              <div className="relative max-w-[280px] w-full">
                <motion.div
                  animate={{ opacity: [0.4, 0.9, 0.4] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute -inset-2 rounded-2xl bg-emerald-500/10 blur-xl pointer-events-none"
                />
                <img
                  src="/images/slytherin/wanted-poster.png"
                  alt="Se Busca — Draco Malfoy"
                  className="w-full h-auto rounded-xl border border-emerald-800/40 shadow-2xl shadow-black/60"
                />
              </div>
            </motion.div>

            <HorcruxTracker />
          </div>
        </section>
      )}

      {activeSection === 'rosco' && (
        <section id="rosco" className="py-8 px-4 relative z-10">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setActiveSection('home')}
              className="text-emerald-500 text-sm mb-6 hover:text-emerald-400 transition-colors flex items-center gap-1"
            >
              ← Volver
            </button>
            <RoscoGame />
          </div>
        </section>
      )}

      {/* FOOTER */}
      <footer className="py-8 px-4 border-t border-emerald-900/30 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 text-emerald-500 font-cinzel font-semibold mb-2">
          <span>🐍</span>
          <span>Slytherin</span>
        </div>
        <p className="text-gray-600 text-xs">
          Despedida de soltero de Ignacio Arístegui · Misión Zaragoza · Abril 2026
        </p>
      </footer>
    </motion.div>
  );
}

function NavButton({
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
        px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2
        ${active
          ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
          : 'bg-emerald-900/30 text-emerald-400 border border-emerald-700/30 hover:bg-emerald-800/40'}
      `}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </button>
  );
}
