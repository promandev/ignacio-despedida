import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';

interface Props {
  onClose: () => void;
}

export default function LoginModal({ onClose }: Props) {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(user, pass)) {
      onClose();
      navigate('/admin');
    } else {
      setError('Credenciales incorrectas');
      setPass('');
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-surface border border-primary/20 rounded-2xl p-6 w-full max-w-sm shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🔐</div>
            <h2 className="text-xl font-bold text-on-background">Admin Login</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Usuario</label>
              <input
                type="text"
                value={user}
                onChange={(e) => { setUser(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 rounded-lg border border-primary/30 bg-background text-on-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Usuario"
                autoComplete="username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-on-surface mb-1">Contraseña</label>
              <input
                type="password"
                value={pass}
                onChange={(e) => { setPass(e.target.value); setError(''); }}
                className="w-full px-4 py-2.5 rounded-lg border border-primary/30 bg-background text-on-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                placeholder="Contraseña"
                autoComplete="current-password"
              />
            </div>

            {error && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 text-sm text-center"
              >
                {error}
              </motion.p>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-lg border border-primary/30 text-on-surface hover:bg-primary/10 transition-all font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 rounded-lg bg-primary text-on-primary hover:brightness-110 transition-all font-medium"
              >
                Entrar
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
