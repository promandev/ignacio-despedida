import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGameState } from '../../context/GameStateContext';
import { useAuth, useAdminPreviewTheme } from '../../hooks/useAuth';
import type { ThemeName } from '../../types';
import LoginModal from './LoginModal';
import ColaboradoresModal from './ColaboradoresModal';

export default function Header({
  activeTheme,
  showThemeSelector = false,
  onSelectTheme,
}: {
  activeTheme?: ThemeName;
  showThemeSelector?: boolean;
  onSelectTheme?: (theme: ThemeName) => void;
}) {
  const { state } = useGameState();
  const { isAdmin, logout } = useAuth();
  const { previewTheme } = useAdminPreviewTheme();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showColabs, setShowColabs] = useState(false);

  // Non-admin: use forcedUserTheme if set, otherwise time-based
  const TARGET_UTC = new Date('2026-04-25T07:00:00Z').getTime();
  const MARINERO_UTC = new Date('2026-04-26T08:00:00Z').getTime();
  const effectiveTheme: ThemeName = activeTheme ?? (isAdmin
    ? previewTheme
    : (
        state.forcedUserTheme ??
        (Date.now() >= MARINERO_UTC ? 'marinero' : Date.now() >= TARGET_UTC ? 'slytherin' : 'carmena')
      ));
  const isSlytherin = effectiveTheme === 'slytherin';
  const isMarinero = effectiveTheme === 'marinero';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-1000">
        <div
          className={`
            ${isSlytherin || isMarinero ? 'bg-black/80 border-b border-sky-900/50' : 'bg-white/80 border-b border-emerald-200'}
            backdrop-blur-lg
          `}
        >
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            {/* Logo / Title */}
            <div className="flex items-center gap-2">
              {isMarinero ? (
                <>
                  <span className="text-xl">⚓</span>
                  <h1 className="font-bold text-sm md:text-base text-sky-400">
                    Operación Marinero
                  </h1>
                </>
              ) : isSlytherin ? (
                <>
                  <span className="text-xl">🐍</span>
                  <h1 className="font-cinzel font-bold text-sm md:text-base text-emerald-400">
                    Expediente Azkaban
                  </h1>
                </>
              ) : (
                <>
                  <span className="text-xl">🏛️</span>
                  <h1 className="font-body font-bold text-sm md:text-base text-emerald-700">
                    Despedida de Ignacio
                  </h1>
                </>
              )}
            </div>

            {/* Navigation — always visible */}
            <nav className="hidden md:flex items-center gap-5">
              {/* Slytherin-specific nav */}
              {isSlytherin && (
                <>
                  <a href="#hero" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Inicio
                  </a>
                  <a href="#horcruxes" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Horrocruxes
                  </a>
                  <a href="#rosco" className="text-sm text-gray-400 hover:text-emerald-400 transition-colors">
                    Rosco
                  </a>
                </>
              )}

              <button
                onClick={() => setShowColabs(true)}
                className={`text-sm transition-colors flex items-center gap-1 ${
                  isSlytherin || isMarinero
                    ? 'text-yellow-400 hover:text-yellow-300'
                    : 'text-amber-600 hover:text-amber-500'
                }`}
              >
                <span>🤝</span>
                <span>Colaboradores</span>
              </button>
            </nav>

            {/* Right side: mobile Colabs icon + admin controls / login */}
            <div className="flex items-center gap-2">
              {/* Mobile: Colabs icon */}
              <div className="flex md:hidden items-center gap-1">
                <button
                  onClick={() => setShowColabs(true)}
                  className={`p-1.5 rounded-lg text-sm transition-all ${
                    isSlytherin || isMarinero
                      ? 'text-yellow-400 hover:bg-yellow-900/20'
                      : 'text-amber-600 hover:bg-amber-50'
                  }`}
                  title="Colaboradores"
                >
                  🤝
                </button>
              </div>

              {/* Admin controls or login */}
              {isAdmin ? (
                <>
                  <button
                    onClick={() => navigate('/admin')}
                    className={`
                      px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5
                      ${isSlytherin || isMarinero
                        ? 'bg-emerald-900/40 text-emerald-400 border border-emerald-700/30 hover:bg-emerald-800/50'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'}
                    `}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    Panel
                  </button>
                  <button
                    onClick={() => { logout(); }}
                    className={`
                      p-1.5 rounded-lg text-xs transition-all
                      ${isSlytherin || isMarinero
                        ? 'text-gray-500 hover:text-red-400 hover:bg-red-900/20'
                        : 'text-gray-400 hover:text-red-500 hover:bg-red-50'}
                    `}
                    title="Cerrar sesión"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowLogin(true)}
                  className={`
                    p-2 rounded-lg text-sm font-medium transition-all
                    ${isSlytherin || isMarinero
                      ? 'text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/30'
                      : 'text-gray-500 hover:text-emerald-700 hover:bg-emerald-50'}
                  `}
                  title="Admin Login"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {showThemeSelector && onSelectTheme && (
            <div className="max-w-6xl mx-auto px-4 pb-3">
              <div className="flex flex-wrap items-center gap-2">
                {([
                  { theme: 'carmena' as const, icon: '🏛️', label: 'Manuela' },
                  { theme: 'slytherin' as const, icon: '🐍', label: 'Slytherin' },
                  { theme: 'marinero' as const, icon: '⚓', label: 'Marinero' },
                ]).map((item) => {
                  const isActive = effectiveTheme === item.theme;
                  return (
                    <button
                      key={item.theme}
                      onClick={() => onSelectTheme(item.theme)}
                      className={`px-3 py-1.5 rounded-lg text-xs md:text-sm font-medium border transition-all flex items-center gap-1.5 ${
                        isActive
                          ? (isSlytherin || isMarinero
                              ? 'bg-emerald-900/40 border-emerald-500/70 text-emerald-300'
                              : 'bg-emerald-100 border-emerald-300 text-emerald-700')
                          : (isSlytherin || isMarinero
                              ? 'bg-black/20 border-gray-700 text-gray-300 hover:border-emerald-600'
                              : 'bg-white/70 border-emerald-200 text-gray-700 hover:border-emerald-400')
                      }`}
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </header>

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
      {showColabs && <ColaboradoresModal onClose={() => setShowColabs(false)} />}
    </>
  );
}
