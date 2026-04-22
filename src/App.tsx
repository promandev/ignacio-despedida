import { useEffect, useState, useCallback, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import type { ThemeName } from './types';
import Header from './components/layout/Header';
import TransitionModal from './components/layout/TransitionModal';
import ThemeTransition from './components/layout/ThemeTransition';
import CarmenaTheme from './components/carmena/CarmenaTheme';
import SlytherinTheme from './components/slytherin/SlytherinTheme';
import AdminPanel from './components/admin/AdminPanel';

function MainPage() {
  const { state, resetTransitionTriggered } = useGameState();
  const location = useLocation();
  const navigate = useNavigate();

  // Navigation state set by AdminPanel when returning from admin preview
  type AdminNav = { adminPreviewTheme?: ThemeName; adminPlayTransition?: boolean };
  const adminNav = (location.state as AdminNav) ?? {};
  const hasAdminPreview = !!adminNav.adminPreviewTheme;

  const [isTransitioning, setIsTransitioning] = useState(false);
  const [awaitingModal, setAwaitingModal] = useState(false);
  // isAdminPreview: prevents shared-state sync from overriding admin preview display
  const [isAdminPreview, setIsAdminPreview] = useState(hasAdminPreview);

  const [displayTheme, setDisplayTheme] = useState<ThemeName>(() => {
    if (hasAdminPreview) {
      // If transition will play, start at carmena so the morph makes sense
      if (adminNav.adminPlayTransition && state.showTransitionModal) return 'carmena';
      return adminNav.adminPreviewTheme!;
    }
    return state.transitionTriggered ? 'carmena' : state.currentTheme;
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

  // On mount: trigger admin preview transition (runs once)
  const mountDone = useRef(false);
  useEffect(() => {
    if (mountDone.current) return;
    mountDone.current = true;

    if (hasAdminPreview && adminNav.adminPlayTransition) {
      if (state.showTransitionModal) {
        // Modal ON: show modal first, animation starts on OK
        setAwaitingModal(true);
      }
      // Modal OFF: no modal, no transition — displayTheme already set to slytherin in useState
    }
    // Clear navigation state so back/forward doesn’t re-trigger
    if (hasAdminPreview) {
      navigate('/', { replace: true, state: null });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for real (time-based) transition trigger — only when NOT in admin preview mode
  useEffect(() => {
    if (isAdminPreview) return;
    if (state.transitionTriggered && state.currentTheme === 'slytherin' && displayTheme === 'carmena' && !isTransitioning && !awaitingModal) {
      if (state.showTransitionModal) {
        setAwaitingModal(true);
      } else {
        setIsTransitioning(true);
      }
    } else if (state.currentTheme !== displayTheme && !isTransitioning && !awaitingModal) {
      setDisplayTheme(state.currentTheme);
    }
  }, [state.currentTheme, state.transitionTriggered, state.showTransitionModal, displayTheme, isTransitioning, awaitingModal, isAdminPreview]);

  const startTransition = useCallback(() => {
    setAwaitingModal(false);
    setIsTransitioning(true);
  }, []);

  const handleTransitionComplete = useCallback(() => {
    setDisplayTheme('slytherin');
    setIsTransitioning(false);
    setIsAdminPreview(false);
    resetTransitionTriggered();
  }, [resetTransitionTriggered]);

  return (
    <>
      <Header />
      <TransitionModal forceShow={awaitingModal} onConfirm={startTransition} />
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
