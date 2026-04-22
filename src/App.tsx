import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import type { ThemeName } from './types';
import { useAuth } from './hooks/useAuth';
import Header from './components/layout/Header';
import TransitionModal from './components/layout/TransitionModal';
import ThemeTransition from './components/layout/ThemeTransition';
import CarmenaTheme from './components/carmena/CarmenaTheme';
import SlytherinTheme from './components/slytherin/SlytherinTheme';
import AdminPanel from './components/admin/AdminPanel';

// April 25, 2026, 9:00 AM Madrid time (CEST = UTC+2) => 7:00 UTC
const TARGET_UTC = new Date('2026-04-25T07:00:00Z').getTime();

function MainPage() {
  const { state, resetTransitionTriggered } = useGameState();
  const { isAdmin } = useAuth();

  // Non-admin with forcedUserTheme set: skip all transition logic
  const isForcedTheme = !isAdmin && state.forcedUserTheme != null;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [awaitingModal, setAwaitingModal] = useState(false);

  const [displayTheme, setDisplayTheme] = useState<ThemeName>(() => {
    // Admin previewing transition: start at carmena if wanting to see the full transition
    if (isAdmin && state.currentTheme === 'slytherin' && state.showTransitionModal) {
      return 'carmena';
    }
    // Admin normal: use current theme
    if (isAdmin) return state.currentTheme;
    // Non-admin with forced theme: use it directly
    if (state.forcedUserTheme) return state.forcedUserTheme;
    // Non-admin, auto mode: time-based
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
        displayTheme === 'slytherin' ? '#0a0f0a' : '#00A959'
      );
    }
  }, [displayTheme]);

  // Admin: sync displayTheme with currentTheme from shared state
  // NOTE: Don't sync during transition preview (when showTransitionModal is true)
  useEffect(() => {
    if (isAdmin && !(state.currentTheme === 'slytherin' && state.showTransitionModal && displayTheme === 'carmena')) {
      setDisplayTheme(state.currentTheme);
    }
  }, [isAdmin, state.currentTheme, state.showTransitionModal, displayTheme]);

  // Non-admin with forced theme: sync displayTheme when forcedUserTheme changes
  useEffect(() => {
    if (!isAdmin && state.forcedUserTheme != null) {
      setDisplayTheme(state.forcedUserTheme);
    }
  }, [isAdmin, state.forcedUserTheme]);

  // Non-admin cleared force: revert to time-based
  useEffect(() => {
    if (!isAdmin && state.forcedUserTheme == null) {
      if (Date.now() >= TARGET_UTC) {
        setDisplayTheme(state.currentTheme === 'slytherin' ? 'slytherin' : 'carmena');
      } else {
        setDisplayTheme('carmena');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, state.forcedUserTheme]);

  // Admin preview transition
  useEffect(() => {
    if (!isAdmin) return;
    if (state.currentTheme === 'slytherin' && state.showTransitionModal && displayTheme === 'carmena' && !isTransitioning && !awaitingModal) {
      setAwaitingModal(true);
    }
  }, [isAdmin, state.currentTheme, state.showTransitionModal, displayTheme, isTransitioning, awaitingModal]);

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

  const startTransition = useCallback(() => {
    setAwaitingModal(false);
    setIsTransitioning(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setDisplayTheme('slytherin');
    setIsTransitioning(false);
    resetTransitionTriggered();
  }, [resetTransitionTriggered]);

  return (
    <>
      <Header />
      {/* TransitionModal: for admin preview OR non-admin time-based trigger */}
      {!isForcedTheme && (
        <TransitionModal forceShow={awaitingModal} onConfirm={startTransition} />
      )}
      <ThemeTransition
        isTransforming={isTransitioning}
        onComplete={handleTransitionComplete}
      />
      <main className="pt-0">
        <AnimatePresence mode="wait">
          {displayTheme === 'carmena' ? (
            <CarmenaTheme key="carmena" />
          ) : (
            <SlytherinTheme key="slytherin" />
          )}
        </AnimatePresence>
      </main>
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
