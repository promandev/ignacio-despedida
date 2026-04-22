import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import type { ThemeName } from './types';
import { useAuth } from './hooks/useAuth';
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
  const [dosSessionIsAdmin, setDosSessionIsAdmin] = useState(false);

  // Non-admin with forcedUserTheme set: skip all transition logic
  const isForcedTheme = !isAdmin && state.forcedUserTheme != null;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [awaitingModal, setAwaitingModal] = useState(false);
  const [isMarineroTransitioning, setIsMarineroTransitioning] = useState(false);
  const [awaitingMarineroModal, setAwaitingMarineroModal] = useState(false);

  const [displayTheme, setDisplayTheme] = useState<ThemeName>(() => {
    // Admin previewing transition: start at previous theme if wanting to see the full transition
    if (isAdmin && state.currentTheme === 'slytherin' && state.showTransitionModal) {
      return 'carmena';
    }
    if (isAdmin && state.currentTheme === 'marinero' && state.showMarineroModal) {
      return 'slytherin';
    }
    // Admin normal: use current theme
    if (isAdmin) return state.currentTheme;
    // Non-admin with forced theme: use it directly
    if (state.forcedUserTheme) return state.forcedUserTheme;
    // Non-admin, auto mode: time-based (marinero > slytherin > carmena)
    if (Date.now() >= MARINERO_UTC && state.currentTheme === 'marinero') return 'marinero';
    if (Date.now() >= TARGET_UTC && state.currentTheme === 'slytherin') return 'slytherin';
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

  // Admin: sync displayTheme with currentTheme from shared state
  // NOTE: Don't sync during transition preview
  useEffect(() => {
    if (!isAdmin) return;
    const isSlytherinPreview = state.currentTheme === 'slytherin' && state.showTransitionModal && displayTheme === 'carmena';
    const isMarineroPreview = state.currentTheme === 'marinero' && state.showMarineroModal && displayTheme === 'slytherin';
    if (!isSlytherinPreview && !isMarineroPreview) {
      setDisplayTheme(state.currentTheme);
    }
  }, [isAdmin, state.currentTheme, state.showTransitionModal, state.showMarineroModal, displayTheme]);

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
        setDisplayTheme(state.currentTheme === 'marinero' ? 'marinero' : state.currentTheme === 'slytherin' ? 'slytherin' : 'carmena');
      } else if (Date.now() >= TARGET_UTC) {
        setDisplayTheme(state.currentTheme === 'slytherin' ? 'slytherin' : 'carmena');
      } else {
        setDisplayTheme('carmena');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, state.forcedUserTheme]);

  // Admin preview transition (Carmena → Slytherin)
  useEffect(() => {
    if (!isAdmin) return;
    if (state.currentTheme === 'slytherin' && state.showTransitionModal && displayTheme === 'carmena' && !isTransitioning && !awaitingModal) {
      setAwaitingModal(true);
    }
  }, [isAdmin, state.currentTheme, state.showTransitionModal, displayTheme, isTransitioning, awaitingModal]);

  // Admin preview transition (Slytherin → Marinero)
  useEffect(() => {
    if (!isAdmin) return;
    if (state.currentTheme === 'marinero' && state.showMarineroModal && displayTheme === 'slytherin' && !isMarineroTransitioning && !awaitingMarineroModal) {
      setAwaitingMarineroModal(true);
    }
  }, [isAdmin, state.currentTheme, state.showMarineroModal, displayTheme, isMarineroTransitioning, awaitingMarineroModal]);

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
