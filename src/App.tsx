import { useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import type { ThemeName } from './types';
import { useAuth, useAdminPreviewTheme } from './hooks/useAuth';
import { setUserPresence, clearUserPresence, subscribeToPresence } from './firebase/config';
import Header from './components/layout/Header';
import TransitionModal from './components/layout/TransitionModal';
import ThemeTransition from './components/layout/ThemeTransition';
import MarineroTransitionModal from './components/layout/MarineroTransitionModal';
import MarineroThemeTransition from './components/layout/MarineroThemeTransition';
import CarmenaTheme from './components/carmena/CarmenaTheme';
import DosConsole from './components/carmena/DosConsole';
import SlytherinTheme from './components/slytherin/SlytherinTheme';
import MarineroTheme from './components/marinero/MarineroTheme';
import AdminPanel from './components/admin/AdminPanel';

// April 25, 2026, 9:00 AM Madrid time (CEST = UTC+2) => 7:00 UTC
const TARGET_UTC = new Date('2026-04-25T07:00:00Z').getTime();
// April 26, 2026, 10:00 AM Madrid time (CEST = UTC+2) => 8:00 UTC
const MARINERO_UTC = new Date('2026-04-26T08:00:00Z').getTime();

function MainPage() {
  const { state, resetTransitionTriggered } = useGameState();
  const { isAdmin } = useAuth();
  const { previewTheme: adminPreviewTheme } = useAdminPreviewTheme();
  const [dosSessionIsAdmin, setDosSessionIsAdmin] = useState(false);
  const [showPresenceToast, setShowPresenceToast] = useState(false);
  const prevOnlineRef = useRef<boolean | null>(null);

  // Non-admin: register presence on mount, clear on unmount
  useEffect(() => {
    if (isAdmin) return;
    setUserPresence();
    const onUnload = () => clearUserPresence();
    window.addEventListener('beforeunload', onUnload);
    return () => {
      window.removeEventListener('beforeunload', onUnload);
      clearUserPresence();
    };
  }, [isAdmin]);

  // Admin: subscribe to presence and show toast when Ignacio connects
  useEffect(() => {
    if (!isAdmin) return;
    const unsub = subscribeToPresence((presence) => {
      const isOnline = presence?.online === true;
      if (isOnline && prevOnlineRef.current === false) {
        setShowPresenceToast(true);
      }
      prevOnlineRef.current = isOnline;
    });
    return unsub;
  }, [isAdmin]);

  useEffect(() => {
    if (!showPresenceToast) return;
    const timer = setTimeout(() => setShowPresenceToast(false), 5000);
    return () => clearTimeout(timer);
  }, [showPresenceToast]);

  // Non-admin with forcedUserTheme set: skip all transition logic
  const isForcedTheme = !isAdmin && state.forcedUserTheme != null;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [awaitingModal, setAwaitingModal] = useState(false);
  const [isMarineroTransitioning, setIsMarineroTransitioning] = useState(false);
  const [awaitingMarineroModal, setAwaitingMarineroModal] = useState(false);

  const [displayTheme, setDisplayTheme] = useState<ThemeName>(() => {
    // Admin: use local preview theme (sessionStorage)
    if (isAdmin) {
      if (adminPreviewTheme === 'slytherin' && state.showTransitionModal) {
        return 'carmena';
      }
      if (adminPreviewTheme === 'marinero' && state.showMarineroModal) {
        return 'slytherin';
      }
      return adminPreviewTheme;
    }
    // Non-admin with forced theme: use it directly
    if (state.forcedUserTheme) return state.forcedUserTheme;
    // Non-admin, auto mode: purely time-based
    if (Date.now() >= MARINERO_UTC) return 'marinero';
    if (Date.now() >= TARGET_UTC) return 'slytherin';
    return 'carmena';
  });

  // Set data-theme on document for CSS variable theming
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', displayTheme);
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute(
        'content',
        displayTheme === 'slytherin' ? '#0a0f0a' : displayTheme === 'marinero' ? '#0a3d62' : '#00A959'
      );
    }
  }, [displayTheme]);

  // Admin: sync displayTheme with local preview theme
  useEffect(() => {
    if (!isAdmin) return;
    const isSlytherinPreview = adminPreviewTheme === 'slytherin' && state.showTransitionModal && displayTheme === 'carmena';
    const isMarineroPreview = adminPreviewTheme === 'marinero' && state.showMarineroModal && displayTheme === 'slytherin';
    if (!isSlytherinPreview && !isMarineroPreview) {
      setDisplayTheme(adminPreviewTheme);
    }
  }, [isAdmin, adminPreviewTheme, state.showTransitionModal, state.showMarineroModal, displayTheme]);

  // Non-admin with forced theme: sync displayTheme when forcedUserTheme changes
  useEffect(() => {
    if (!isAdmin && state.forcedUserTheme != null) {
      setDisplayTheme(state.forcedUserTheme);
    }
  }, [isAdmin, state.forcedUserTheme]);

  // Non-admin cleared force: revert to time-based
  useEffect(() => {
    if (!isAdmin && state.forcedUserTheme == null) {
      if (Date.now() >= MARINERO_UTC) {
        setDisplayTheme('marinero');
      } else if (Date.now() >= TARGET_UTC) {
        setDisplayTheme('slytherin');
      } else {
        setDisplayTheme('carmena');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, state.forcedUserTheme]);

  // Admin preview transition (Carmena → Slytherin)
  useEffect(() => {
    if (!isAdmin) return;
    if (adminPreviewTheme === 'slytherin' && state.showTransitionModal && displayTheme === 'carmena' && !isTransitioning && !awaitingModal) {
      setAwaitingModal(true);
    }
  }, [isAdmin, adminPreviewTheme, state.showTransitionModal, displayTheme, isTransitioning, awaitingModal]);

  // Admin preview transition (Slytherin → Marinero)
  useEffect(() => {
    if (!isAdmin) return;
    if (adminPreviewTheme === 'marinero' && state.showMarineroModal && displayTheme === 'slytherin' && !isMarineroTransitioning && !awaitingMarineroModal) {
      setAwaitingMarineroModal(true);
    }
  }, [isAdmin, adminPreviewTheme, state.showMarineroModal, displayTheme, isMarineroTransitioning, awaitingMarineroModal]);

  // Non-admin time-based transition trigger (only when no forced theme)
  useEffect(() => {
    if (isAdmin || isForcedTheme) return;
    if (state.transitionTriggered && state.currentTheme === 'slytherin' && displayTheme === 'carmena' && !isTransitioning && !awaitingModal) {
      if (state.showTransitionModal) {
        setAwaitingModal(true);
      } else {
        setIsTransitioning(true);
      }
    }
  }, [state.transitionTriggered, state.currentTheme, state.showTransitionModal, displayTheme, isTransitioning, awaitingModal, isAdmin, isForcedTheme]);

  // Non-admin marinero trigger: with modal/animation support
  useEffect(() => {
    if (isAdmin || isForcedTheme) return;
    if (state.transitionTriggered && state.currentTheme === 'marinero' && displayTheme === 'slytherin' && !isMarineroTransitioning && !awaitingMarineroModal) {
      if (state.showMarineroModal) {
        setAwaitingMarineroModal(true);
      } else {
        setIsMarineroTransitioning(true);
      }
    }
  }, [state.transitionTriggered, state.currentTheme, state.showMarineroModal, displayTheme, isMarineroTransitioning, awaitingMarineroModal, isAdmin, isForcedTheme]);

  const startTransition = useCallback(() => {
    setAwaitingModal(false);
    setIsTransitioning(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setDisplayTheme('slytherin');
    setIsTransitioning(false);
    resetTransitionTriggered();
  }, [resetTransitionTriggered]);

  const startMarineroTransition = useCallback(() => {
    setAwaitingMarineroModal(false);
    setIsMarineroTransitioning(true);
  }, []);

  const handleMarineroTransitionComplete = useCallback(() => {
    setDisplayTheme('marinero');
    setIsMarineroTransitioning(false);
    resetTransitionTriggered();
  }, [resetTransitionTriggered]);

  useEffect(() => {
    if (!state.showDosChat) {
      setDosSessionIsAdmin(false);
    }
  }, [state.showDosChat]);

  return (
    <>
      {/* Admin presence toast */}
      <AnimatePresence>
        {showPresenceToast && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 bg-gray-900 border border-emerald-600/50 text-emerald-300 text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl"
          >
            <span className="text-lg">🟢</span>
            <span>Ignacio se ha conectado en la sala</span>
            <button
              onClick={() => setShowPresenceToast(false)}
              className="ml-2 text-emerald-500 hover:text-emerald-300 transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header: always visible for admin, hidden when DOS chat active for non-admin */}
      {(!state.showDosChat || dosSessionIsAdmin) && <Header />}

      {/* DOS Console overlay */}
      {state.showDosChat && (
        <div className={dosSessionIsAdmin ? 'dos-console-with-header' : ''}>
          <DosConsole onSessionRoleChange={setDosSessionIsAdmin} />
        </div>
      )}

      {/* Normal theme content (hidden when DOS console active) */}
      {!state.showDosChat && (
        <>
          {!isForcedTheme && (
            <>
              <TransitionModal forceShow={awaitingModal} onConfirm={startTransition} />
              <MarineroTransitionModal forceShow={awaitingMarineroModal} onConfirm={startMarineroTransition} />
            </>
          )}
          <ThemeTransition
            isTransforming={isTransitioning}
            onComplete={handleTransitionComplete}
          />
          <MarineroThemeTransition
            isTransforming={isMarineroTransitioning}
            onComplete={handleMarineroTransitionComplete}
          />
          <main className="pt-0">
            <AnimatePresence mode="wait">
              {displayTheme === 'carmena' ? (
                <CarmenaTheme key="carmena" />
              ) : displayTheme === 'marinero' ? (
                <MarineroTheme key="marinero" />
              ) : (
                <SlytherinTheme key="slytherin" />
              )}
            </AnimatePresence>
          </main>
        </>
      )}
    </>
  );
}

function AdminRoute() {
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'slytherin');
  }, []);
  return <AdminPanel />;
}

export default function App() {
  return (
    <BrowserRouter>
      <GameStateProvider>
        <Routes>
          <Route path="/" element={<MainPage />} />
          <Route path="/admin" element={<AdminRoute />} />
        </Routes>
      </GameStateProvider>
    </BrowserRouter>
  );
}
