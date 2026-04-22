import { useEffect, useState, useCallback } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { GameStateProvider, useGameState } from './context/GameStateContext';
import Header from './components/layout/Header';
import TransitionModal from './components/layout/TransitionModal';
import ThemeTransition from './components/layout/ThemeTransition';
import CarmenaTheme from './components/carmena/CarmenaTheme';
import SlytherinTheme from './components/slytherin/SlytherinTheme';
import AdminPanel from './components/admin/AdminPanel';

function MainPage() {
  const { state, setTheme, resetTransitionTriggered } = useGameState();
  const [isTransitioning, setIsTransitioning] = useState(false);
  // If a transition was already triggered (e.g. from admin panel), start at 'carmena'
  // so the animation can play from carmena → slytherin
  const [displayTheme, setDisplayTheme] = useState(
    state.transitionTriggered ? 'carmena' : state.currentTheme
  );

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

  // Listen for transition trigger: when state changes to slytherin and we were on carmena
  useEffect(() => {
    if (state.transitionTriggered && state.currentTheme === 'slytherin' && displayTheme === 'carmena') {
      setIsTransitioning(true);
    } else if (state.currentTheme !== displayTheme && !isTransitioning) {
      // Direct theme change (e.g., from admin) without animation
      setDisplayTheme(state.currentTheme);
    }
  }, [state.currentTheme, state.transitionTriggered, displayTheme, isTransitioning]);

  const handleTransitionComplete = useCallback(() => {
    setDisplayTheme('slytherin');
    setIsTransitioning(false);
    resetTransitionTriggered();
  }, [resetTransitionTriggered]);

  return (
    <>
      <Header />
      <TransitionModal />
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
