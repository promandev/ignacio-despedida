import { useMemo } from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true } as const,
  transition: { duration: 0.6 },
};

// ──────────────────────────────────────────────
// Floating sea particles
// ──────────────────────────────────────────────
function WaveParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 18,
        duration: 14 + Math.random() * 20,
        size: 4 + Math.random() * 10,
        symbol: ['⚓', '🌊', '⛵', '🐚', '🌀', '💧', '✦', '◆', '☽', '🐬'][
          Math.floor(Math.random() * 10)
        ],
        opacity: 0.12 + Math.random() * 0.22,
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
            color:
              p.id % 3 === 0
                ? '#38bdf8'
                : p.id % 3 === 1
                ? '#f9c74f'
                : '#7dd3fc',
          }}
        >
          {p.symbol}
        </span>
      ))}
    </div>
  );
}

// ──────────────────────────────────────────────
// Animated clin-clines bar chart
// ──────────────────────────────────────────────
const clinClineData = [
  { label: 'Viernes noche', value: 7, color: '#38bdf8' },
  { label: 'Sábado tarde', value: 11, color: '#0ea5e9' },
  { label: 'Sábado noche', value: 23, color: '#0284c7' },
  { label: 'Domingo maña.', value: 3, color: '#7dd3fc' },
];

const maxClinCline = Math.max(...clinClineData.map((d) => d.value));

function ClinClinesChart() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <div ref={ref} className="w-full">
      <div className="flex items-end justify-around gap-2 sm:gap-3 h-44 sm:h-52 mb-4">
        {clinClineData.map((d, i) => (
          <div key={d.label} className="flex flex-col items-center flex-1 h-full justify-end gap-1 sm:gap-2 min-w-0">
            <motion.span
              initial={{ opacity: 0 }}
              animate={inView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 + i * 0.15 }}
              className="text-white font-bold text-sm sm:text-lg"
            >
              {inView ? d.value : ''}
            </motion.span>
            <div className="w-full flex items-end justify-center flex-1">
              <motion.div
                initial={{ height: 0 }}
                animate={inView ? { height: `${(d.value / maxClinCline) * 100}%` } : {}}
                transition={{
                  duration: 0.9,
                  delay: 0.2 + i * 0.15,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
                style={{ backgroundColor: d.color, borderRadius: '8px 8px 0 0', width: '100%' }}
              />
            </div>
            <span className="text-sky-200 text-[10px] sm:text-xs text-center leading-tight mt-1">{d.label}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-sky-600/40 pt-3 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.0 }}
          className="text-sky-100 text-sm font-semibold"
        >
          Total: <span className="text-yellow-300 text-xl font-bold">44</span> clin-clines 🥂
        </motion.p>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────
// Stat card for bachelor party data
// ──────────────────────────────────────────────
const bachelorStats = [
  { icon: '📸', label: 'Fotos tomadas', value: '347', unit: '' },
  { icon: '🚶', label: 'Km recorridos', value: '14.2', unit: 'km' },
  { icon: '🍺', label: 'Paradas en bares', value: '8', unit: '' },
  { icon: '😴', label: 'Horas de sueño', value: '9', unit: 'h (total)' },
  { icon: '🎶', label: 'Canciones cantadas', value: '31', unit: '' },
  { icon: '🤌', label: 'Brindis oficiales', value: '12', unit: '' },
];

function StatCard({ icon, label, value, unit, delay }: typeof bachelorStats[0] & { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      transition={{ delay, type: 'spring', stiffness: 90, damping: 14 }}
      className="bg-sky-900/40 border border-sky-600/30 rounded-2xl p-4 flex flex-col items-center gap-1 backdrop-blur-sm"
    >
      <span className="text-3xl">{icon}</span>
      <span className="text-white font-bold text-2xl">
        {value}
        <span className="text-sky-300 text-sm ml-1">{unit}</span>
      </span>
      <span className="text-sky-300 text-xs text-center">{label}</span>
    </motion.div>
  );
}

// ──────────────────────────────────────────────
// Main component
// ──────────────────────────────────────────────
export default function MarineroTheme() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen relative"
      style={{ background: 'linear-gradient(160deg, #0c1a2e 0%, #0a3d62 40%, #0c2461 100%)' }}
    >
      <WaveParticles />

      {/* ── HERO ── */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-sky-800/20 rounded-full blur-[100px] -z-10 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-400/5 rounded-full blur-[80px] -z-10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto relative z-10"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.3 }}
            className="text-6xl md:text-8xl mb-4"
          >
            ⚓
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-sky-400/40 text-sky-300 text-xs font-medium mb-6 backdrop-blur-sm"
          >
            <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
            <span>DESPACHO DE ADUANAS AZKABAN · EXPEDIENTE MARÍTIMO</span>
          </motion.div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 leading-tight text-white">
            <span className="text-sky-400">Operación Marinero:</span>
            <br />
            <span className="text-gray-200">Ignacio al Timón</span>
          </h1>

          <p className="text-gray-400 text-base md:text-lg mb-4 leading-relaxed max-w-xl mx-auto">
            <span className="text-sky-400 font-semibold">Sujeto:</span> Draco Malfoy (Prisionero X-Y390) ·{' '}
            <span className="text-yellow-300 font-semibold">Estado: Evadido en alta mar</span>
          </p>
          <p className="text-gray-500 text-sm mb-10">
            Ministerio de la Despedida · Flota Especial
          </p>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-[-30px] left-1/2 -translate-x-1/2 text-sky-500/50 text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* ── WANTED POSTER / TRANSFORMATION ── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-[0.3em]">
              La transformación
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              De <span className="text-emerald-400">Draco Malfoy</span> a{' '}
              <span className="text-sky-400">Marinero de Altura</span>
            </h2>
            <div className="w-16 h-0.5 bg-sky-500 mx-auto mt-4" />
          </motion.div>

          <div className="flex flex-col md:flex-row gap-8 items-center">
            {/* Wanted poster */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative max-w-[260px] w-full mx-auto md:mx-0 flex-shrink-0"
            >
              <motion.div
                animate={{ opacity: [0.3, 0.7, 0.3] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -inset-2 rounded-2xl bg-sky-500/15 blur-xl pointer-events-none"
              />
              <img
                src="/images/marinero/ignacio.png"
                alt="Ignacio el marinero"
                className="w-full h-auto rounded-xl border border-sky-700/40 shadow-2xl shadow-sky-900/60"
              />
            </motion.div>

            {/* Narrative */}
            <div className="flex-1 space-y-4">
              <motion.div
                {...fadeUp}
                className="bg-sky-900/40 border border-sky-700/30 rounded-2xl p-6 backdrop-blur-sm"
              >
                <h3 className="text-sky-300 font-bold text-lg mb-2">⚓ El Giro Inesperado</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Nadie lo vio venir. Draco Malfoy, el mago más elegante de Slytherin,
                  cambió su varita por un sextante y su capa por un impermeable amarillo.
                  Las aguas del Atlántico lo llamaron y él no pudo resistirse.
                  <em className="text-sky-300"> "El poder no está en los hechizos... está en las mareas."</em>
                </p>
              </motion.div>

              <motion.div
                {...fadeUp}
                className="bg-sky-900/40 border border-sky-700/30 rounded-2xl p-6 backdrop-blur-sm"
              >
                <h3 className="text-sky-300 font-bold text-lg mb-2">🌿 Verde en Alta Mar</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Los mares son el próximo frente de la transición energética. Ignacio lo sabe
                  mejor que nadie: desde cubierta ha visto cómo las plataformas offshore comienzan
                  a convertirse en gigantes del viento y el hidrógeno verde. Mientras los demás
                  miraban hacia tierra, él ya llevaba años mirando al horizonte.
                  <em className="text-sky-300"> "El petróleo que mueve el mundo de hoy no puede ser el del mañana."</em>
                </p>
              </motion.div>

              <motion.div
                {...fadeUp}
                className="bg-sky-900/40 border border-sky-700/30 rounded-2xl p-6 backdrop-blur-sm"
              >
                <h3 className="text-sky-300 font-bold text-lg mb-2">🌊 Cepsa · Moeve · Futuro</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Bajo el nuevo nombre <strong className="text-yellow-300">Moeve</strong>, la compañía
                  navega hacia un horizonte de energías limpias: combustibles marinos sostenibles,
                  biocombustibles y energía renovable offshore. E Ignacio, fiel a su estilo,
                  está ahí para asegurarse de que cada contrato lleve la firma correcta y que
                  los mares queden un poco más limpios que como los encontró.
                </p>
              </motion.div>

              <motion.div
                {...fadeUp}
                className="bg-sky-900/40 border border-sky-700/30 rounded-2xl p-6 backdrop-blur-sm"
              >
                <h3 className="text-sky-300 font-bold text-lg mb-2">🎵 El Himno en Alta Mar</h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Dicen que cuando navegaba, había veces que se ponía a cantar el himno del
                  <strong className="text-red-400"> Athletic Club de Bilbao</strong> a pleno pulmón,
                  con las olas como público y las gaviotas como coro. La tripulación
                  aprendió rápido a reconocer las primeras notas:
                </p>
                <blockquote className="mt-3 border-l-2 border-red-500/60 pl-4 py-2 bg-red-950/20 rounded-r-lg">
                  <p className="text-red-300 italic text-sm leading-relaxed font-medium">
                    «Athletic, Athletic eup!<br />
                    Zuri-gorri, zuri-gorri eup!<br />
                    Aupa mutillak, eutsi gogor,<br />
                    ekin gogotsu danok batera!»
                  </p>
                </blockquote>
                <p className="text-gray-400 text-xs mt-2">
                  Y así, entre proa y popa, el himno rojiblanco retumbaba mar adentro.
                </p>
              </motion.div>

              <motion.div
                {...fadeUp}
                className="bg-sky-900/40 border border-sky-700/30 rounded-2xl p-6 backdrop-blur-sm"
              >
                <h3 className="text-sky-300 font-bold text-lg mb-2">🚢 El <em className="text-yellow-300">Bilbao</em></h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  De tanto cantar el himno y suspirar mirando al norte, Ignacio acabó
                  enamorándose de la ciudad. Tanto le gustó Bilbao que hizo lo que cualquier
                  marinero de ley haría: nombrar a un barco en su honor, como tenía que ser, a lo grande.
                  Desde entonces, el <strong className="text-yellow-300">«Bilbao»</strong> surca
                  las aguas llevando el nombre de la villa que conquistó el corazón de este
                  marinero reconvertido. Y no era un barquito: era un carguero.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAREWELL / THANKS ── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-[0.3em]">
              Fin de viaje
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              Un fin de semana <span className="text-yellow-300">inolvidable</span>
            </h2>
            <div className="w-16 h-0.5 bg-yellow-400 mx-auto mt-4" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div
              {...fadeUp}
              className="bg-gradient-to-br from-sky-900/60 to-sky-800/40 border border-sky-600/30 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="text-3xl mb-3">🙏</div>
              <h3 className="text-white font-bold text-lg mb-3">Gracias, capitán</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Gracias, Ignacio, por dejarte llevar por la corriente de este fin de semana.
                Por los brindis, las risas, los kilómetros recorridos y por demostrar una vez más
                que, pase lo que pase, el timón siempre está en buenas manos cuando tú estás a bordo.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="bg-gradient-to-br from-yellow-900/40 to-yellow-800/20 border border-yellow-500/20 rounded-2xl p-6 backdrop-blur-sm"
            >
              <div className="text-3xl mb-3">🥂</div>
              <h3 className="text-white font-bold text-lg mb-3">Despedida con honor</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                A todos los que formamos parte de esta tripulación: ha sido un placer navegar
                juntos. Quedan los recuerdos, las fotos borrosas de las 4 de la mañana
                y la certeza de que lo que pasa en la despedida... se cuenta en la boda.
              </p>
            </motion.div>

            <motion.div
              {...fadeUp}
              className="bg-gradient-to-br from-sky-900/60 to-sky-800/40 border border-sky-600/30 rounded-2xl p-6 backdrop-blur-sm md:col-span-2"
            >
              <div className="text-3xl mb-3">⛵</div>
              <h3 className="text-white font-bold text-lg mb-3">Bon voyage, futuro marido</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Este fin de semana ha sido la última travesía como soltero. A partir de ahora,
                zarpas con copiloto y con rumbo fijo. Que el viento os sea siempre favorable,
                que los mares estén en calma y que cada horizonte que veáis juntos sea más
                bonito que el anterior.{' '}
                <strong className="text-sky-300">¡Felices aguas, Ignacio!</strong>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── CLIN-CLINES CHART ── */}
      <section className="py-16 px-4 relative z-10">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="text-xs font-semibold text-sky-400 uppercase tracking-[0.3em]">
              Estadísticas oficiales
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-white mt-3">
              🥂 El Clin-Clinómetro
            </h2>
            <p className="text-sky-300 text-sm mt-2">
              Registro oficial de clin-clines por tramo horario
            </p>
            <div className="w-16 h-0.5 bg-sky-500 mx-auto mt-4" />
          </motion.div>

          {/* Bar chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="bg-sky-950/70 border border-sky-700/30 rounded-2xl p-4 sm:p-6 backdrop-blur-sm mb-10 overflow-hidden"
          >
            <ClinClinesChart />
          </motion.div>

          {/* Other bachelor party stats */}
          <motion.div {...fadeUp} className="text-center mb-6">
            <span className="text-xs font-semibold text-yellow-400 uppercase tracking-widest">
              Más datos del expediente
            </span>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {bachelorStats.map((s, i) => (
              <StatCard key={s.label} {...s} delay={i * 0.1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-4 border-t border-sky-900/40 text-center relative z-10">
        <div className="flex items-center justify-center gap-2 text-sky-400 font-semibold mb-2">
          <span>⚓</span>
          <span>Flota Especial · Ministerio de la Despedida</span>
        </div>
        <p className="text-gray-600 text-xs">
          Despedida de soltero de Ignacio Arístegui · Misión Zaragoza · Abril 2026
        </p>
      </footer>
    </motion.div>
  );
}
