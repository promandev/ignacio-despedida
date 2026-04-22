import { motion, AnimatePresence } from 'framer-motion';

const colaboradores = [
  { file: 'Jefo', name: 'Jefo' },
  { file: 'Mou', name: 'Mou' },
  { file: 'Pablo', name: 'Pablo' },
  { file: 'Robert', name: 'Robert' },
  { file: 'Rou', name: 'Rou' },
  { file: 'Txo', name: 'Txo' },
];

export default function ColaboradoresModal({ onClose }: { onClose: () => void }) {
  return (
    <AnimatePresence>
      <motion.div
        key="colabs-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="fixed inset-0 z-[200] flex items-start justify-center overflow-y-auto"
        style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <motion.div
          key="colabs-panel"
          initial={{ opacity: 0, y: -24, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -16, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
          className="relative w-full max-w-2xl mx-4 my-20 bg-[#0a1628] border border-sky-800/40 rounded-3xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-sky-900/60 text-sky-300 hover:bg-sky-700/60 flex items-center justify-center transition-colors text-lg font-bold"
            aria-label="Cerrar"
          >
            ×
          </button>

          {/* Header */}
          <div className="px-8 pt-8 pb-4 border-b border-sky-800/30">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <span>🤝</span> Colaboradores
            </h2>
            <p className="text-sky-400 text-sm mt-1">
              Las personas que hicieron posible este fin de semana
            </p>
          </div>

          {/* ── COLABORADORES ── */}
          <section className="px-8 py-6">
            <h3 className="text-sky-300 text-xs font-semibold uppercase tracking-widest mb-5">
              Colaboradores
            </h3>
            <div className="flex flex-wrap justify-center gap-6">
              {colaboradores.map((p, i) => (
                <motion.div
                  key={p.file}
                  initial={{ opacity: 0, scale: 0.7 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.05 * i, type: 'spring', stiffness: 130, damping: 14 }}
                  className="flex flex-col items-center gap-2"
                >
                  {/* Circular avatar */}
                  <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-sky-500/50 shadow-lg shadow-sky-900/40 bg-sky-950">
                    <img
                      src={`/images/persons/${p.file}.png`}
                      alt={p.name}
                      className="w-full h-full object-cover object-top"
                    />
                  </div>
                  <span className="text-white text-sm font-medium">{p.name}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Divider */}
          <div className="mx-8 border-t border-sky-800/30" />

          {/* ── PATROCINADORES ── */}
          <section className="px-8 py-6">
            <h3 className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-5">
              Patrocinadores
            </h3>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="flex flex-col items-center gap-3"
            >
              {/* Rectangular sponsor image */}
              <div className="overflow-hidden rounded-xl border border-yellow-500/30 shadow-lg bg-white max-w-xs w-full">
                <img
                  src="/images/melly.png"
                  alt="Mercerías Melly"
                  className="w-full h-auto object-contain"
                />
              </div>
              <div className="text-center">
                <p className="text-white font-bold text-base">Mercerías Melly</p>
                <p className="text-yellow-400 text-sm">Aguilar de Campoo · Palencia</p>
              </div>
            </motion.div>
          </section>

          {/* Footer padding */}
          <div className="h-4" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
