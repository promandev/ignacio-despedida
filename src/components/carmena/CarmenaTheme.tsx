import { motion } from 'framer-motion';
import { useGameState } from '../../context/GameStateContext';

const fadeUp = {
  initial: { opacity: 0, y: 30 } as const,
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true } as const,
  transition: { duration: 0.6 },
};

const hitos = [
  {
    icon: '🚗',
    title: 'Madrid Central',
    desc: 'Creó la mayor zona de bajas emisiones de España, restringiendo el tráfico en el centro de Madrid para mejorar la calidad del aire.',
  },
  {
    icon: '🚶',
    title: 'Gran Vía peatonal',
    desc: 'Impulsó la peatonalización parcial de la icónica Gran Vía, devolviendo el espacio a los ciudadanos.',
  },
  {
    icon: '🏛️',
    title: 'Plaza de España',
    desc: 'Remodelación integral de la Plaza de España, creando uno de los espacios verdes más grandes del centro de Madrid.',
  },
  {
    icon: '🗳️',
    title: 'Presupuestos participativos',
    desc: 'Los madrileños pudieron decidir en qué se invertían 100 millones de euros del presupuesto municipal.',
  },
];

const counterConfig = [
  { key: 'copas' as const, icon: '🍷', label: 'Copas bebidas', color: 'bg-red-500' },
  { key: 'aguasConGas' as const, icon: '💧', label: 'Aguas con gas', color: 'bg-blue-500' },
  { key: 'discursosMadridCentral' as const, icon: '🚗', label: 'Discursos sobre Madrid Central', color: 'bg-emerald-500' },
  { key: 'frotaManos' as const, icon: '🤲', label: 'Veces frotándose las manos', color: 'bg-amber-500' },
];

export default function CarmenaTheme() {
  const { state, incrementCounter, decrementCounter } = useGameState();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen"
    >
      {/* HERO */}
      <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-4 pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-white to-emerald-50 -z-10" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-200/30 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl -z-10" />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-6"
          >
            <span>🎉</span>
            <span>Despedida de Soltero</span>
          </motion.div>

          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 leading-tight">
            ¡Ignacio <span className="text-emerald-600">se casa!</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-600 mb-8 leading-relaxed">
            Antes de dar el gran paso, hay una historia que contar...
            una historia de <strong className="text-emerald-600">transformación</strong>,{' '}
            <strong className="text-emerald-600">ambición</strong> y{' '}
            <strong className="text-emerald-600">cambio</strong>.
          </p>

          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-emerald-500 text-2xl"
          >
            ↓
          </motion.div>
        </motion.div>
      </section>

      {/* PHOTO — Always visible */}
      <section className="py-12 px-4" id="carmena-photo">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ type: 'spring', damping: 22, stiffness: 45, mass: 1.4 }}
            className="relative overflow-hidden rounded-2xl shadow-2xl bg-gradient-to-b from-emerald-100 to-emerald-50"
          >
            <img
              src="/images/carmena/ignacio.png"
              alt="Ignacio disfrazado de Manuela Carmena"
              className="w-full h-auto"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
              <p className="text-white font-bold text-lg">
                Exma. "Manuela Carmena"
              </p>
              <p className="text-emerald-300 text-sm">
                Más Madrid · Alcaldesa por un día
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* IGNACIO PARODY */}
      <section className="py-16 px-4 bg-emerald-50/60">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
              El candidato
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Ignacio Aristegui
            </h2>
            <p className="text-gray-500 mt-2 text-sm">La persona detrás de la alcaldesa</p>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            <motion.div {...fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <div className="text-3xl mb-3">⚖️</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Abogado de profesión</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Como buen discípulo de Carmena, Ignacio siguió sus pasos en el mundo del derecho.
                Dicen que en su despacho tiene una foto firmada de Manuela más grande que la de su futura mujer.
                <em className="text-emerald-600"> "Objección, su señoría... a que la boda no sea en Madrid Central."</em>
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
              <div className="text-3xl mb-3">⛵</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Pasión por los barcos</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Si no está redactando un recurso o hablando de Madrid Central, está mirando barcos.
                Su sueño: un velero donde pueda navegar y, al mismo tiempo, explicar por qué
                los barcos también deberían ser de bajas emisiones.
                <em className="text-emerald-600"> Capitán Ignacio: "¡Todos a bordo del Madrid Central marítimo!"</em>
              </p>
            </motion.div>

            <motion.div {...fadeUp} className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 md:col-span-2">
              <div className="text-3xl mb-3">💚</div>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Devoto de Manuela Carmena</h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Para Ignacio, Manuela Carmena no es solo una política: es un estilo de vida. Puede recitar de
                memoria el discurso de investidura de 2015. Su playlist de Spotify tiene un podcast titulado
                <em> "Madrid Central: 10 horas de sonidos ambientales sin coches"</em>.
                Le han pillado más de una vez frotándose las manos mientras explica los beneficios de las
                zonas de bajas emisiones. Cuando se le pregunta por la boda, responde:{' '}
                <strong className="text-emerald-600">"Será bonita, pero no tanto como el día que se inauguró Madrid Central."</strong>
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* COUNTER MINI-GAME */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-2xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-10">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
              Marcador oficial
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              🏆 El Ignaciómetro
            </h2>
            <p className="text-gray-500 mt-2 text-sm">
              Lleva la cuenta de los momentos estelares del candidato
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {counterConfig.map((c, i) => (
              <motion.div
                key={c.key}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-5 border border-gray-200 hover:border-emerald-300 transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{c.icon}</span>
                  <span className="text-sm font-medium text-gray-700 leading-tight">{c.label}</span>
                </div>

                {/* Counter value */}
                <div className="flex items-center justify-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => decrementCounter(c.key)}
                    className="w-10 h-10 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold text-lg flex items-center justify-center transition-colors"
                    disabled={state.counters[c.key] === 0}
                  >
                    −
                  </motion.button>

                  <motion.span
                    key={state.counters[c.key]}
                    initial={{ scale: 1.4, color: '#059669' }}
                    animate={{ scale: 1, color: '#1f2937' }}
                    className="text-3xl font-bold tabular-nums min-w-[3ch] text-center"
                  >
                    {state.counters[c.key]}
                  </motion.span>

                  <motion.button
                    whileTap={{ scale: 0.85 }}
                    onClick={() => incrementCounter(c.key)}
                    className={`w-10 h-10 rounded-full ${c.color} hover:brightness-110 text-white font-bold text-lg flex items-center justify-center transition-all shadow-md`}
                  >
                    +
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Fun totals */}
          {(state.counters.copas > 0 || state.counters.discursosMadridCentral > 0) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-6 p-4 bg-emerald-50 rounded-xl text-center"
            >
              <p className="text-sm text-gray-600">
                {state.counters.copas > 5 && '🍷 ¡Va lanzado! '}
                {state.counters.discursosMadridCentral > 3 && '🚗 ¡Otro discurso sobre Madrid Central! '}
                {state.counters.frotaManos > 5 && '🤲 ¡Se va a desgastar las manos! '}
                {state.counters.aguasConGas > 3 && '💧 Hidratación nivel experto. '}
                {state.counters.copas + state.counters.aguasConGas + state.counters.discursosMadridCentral + state.counters.frotaManos === 0 && 'Aún no hay datos...'}
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* BIO CARMENA */}
      <section className="py-16 px-4 bg-emerald-50/30">
        <div className="max-w-3xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
              Biografía
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Manuela Carmena
            </h2>
            <div className="w-16 h-1 bg-emerald-500 mx-auto mt-4 rounded-full" />
          </motion.div>

          <motion.div
            {...fadeUp}
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-4"
          >
            <p>
              <strong>Manuela Carmena Castrillo</strong> (Madrid, 1944) es una jurista, jueza y política española.
              Fue <strong>alcaldesa de Madrid entre 2015 y 2019</strong>, convirtiéndose en la primera mujer en
              ocupar el cargo en la historia de la ciudad.
            </p>
            <p>
              Antes de su carrera política, Carmena fue jueza durante más de 30 años. Fue
              pionera en la defensa de los derechos laborales y mediación, y cofundadora del
              despacho de abogados laboralistas de Atocha, donde ocurrió la tristemente célebre{' '}
              <em>Matanza de Atocha</em> en 1977.
            </p>
            <p>
              Llegó a la alcaldía con la plataforma <strong>Ahora Madrid</strong> y posteriormente
              se presentó bajo la marca <strong className="text-emerald-600">Más Madrid</strong>,
              dejando un legado de transformación urbanística sin precedentes.
            </p>
          </motion.div>

          <motion.blockquote
            {...fadeUp}
            className="mt-10 border-l-4 border-emerald-500 pl-6 py-4 bg-emerald-50 rounded-r-xl"
          >
            <p className="text-lg italic text-gray-700">
              "La ciudad es de todos. Solo cuando los ciudadanos se sienten dueños de su ciudad,
              pueden cuidarla y mejorarla."
            </p>
            <footer className="text-sm text-emerald-700 font-semibold mt-2">
              — Manuela Carmena
            </footer>
          </motion.blockquote>
        </div>
      </section>

      {/* HITOS */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div {...fadeUp} className="text-center mb-12">
            <span className="text-sm font-semibold text-emerald-600 uppercase tracking-widest">
              Legado
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2">
              Hitos principales
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {hitos.map((hito, i) => (
              <motion.div
                key={hito.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-gray-50 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow border border-emerald-100"
              >
                <div className="text-3xl mb-3">{hito.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{hito.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{hito.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-8 px-4 bg-emerald-50/30 border-t border-emerald-100 text-center">
        <div className="flex items-center justify-center gap-2 text-emerald-600 font-semibold mb-2">
          <span className="text-xl">💚</span>
          <span>Más Madrid</span>
        </div>
        <p className="text-gray-400 text-xs">
          Web creada para la despedida de soltero de Ignacio Aristegui · Abril 2026
        </p>
      </footer>
    </motion.div>
  );
}
