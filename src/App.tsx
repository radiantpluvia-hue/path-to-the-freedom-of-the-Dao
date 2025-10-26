import { useEffect, lazy, Suspense } from 'react';
import { useGameStore } from './store/useGameStore';
import { TaiYungLore } from './components/game/TaiYungLore';
import SectPanel from './components/game/SectPanel';
import { CharacterCreation } from './components/game/CharacterCreation';
import { GameInterface } from './components/game/GameInterface';
import ErrorBoundary from './components/ErrorBoundary';
import { SocialInterface } from './components/game/SocialInterface';
import { DeathScreen } from './components/game/DeathScreen';
import DomainPanel from './components/DomainPanel';
import MusicPlayer from './components/game/MusicPlayer';
// Test component import removed from global render (kept in codebase for local testing)
import { RebellionMastery } from './components/minigames/RebellionMastery';
import { TutorialPage } from './components/tutorial/TutorialPage';
import './styles/globals.css';
import './styles/theme.css';
import BuffPanel from './components/BuffPanel';
import InterpersonalPage from './pages/InterpersonalPage';
import { logger } from './utils/logger';
import ToastContainer from './components/ToastContainer';

// Dynamic imports for heavy panels
const SectJoiningPanel = lazy(() => import('./components/game/SectJoiningPanel'));
const MarketPanel = lazy(() => import('./components/game/MarketPanel'));
const MentorTeachingPanel = lazy(() => import('./components/MentorTeachingPanel'));

export default function App() {
  const { ui, assignRandomBloodline, assignRandomPhysique } = useGameStore();

  useEffect(() => {
    // Assign random bloodline and physique on first load
    assignRandomBloodline();
    assignRandomPhysique();
    // Load any persisted UI prefs (dialogue settings, realm list visibility)
    try { (useGameStore.getState() as any)._loadUIPrefsOnce?.(); } catch { /* ignore */ }
  }, [assignRandomBloodline, assignRandomPhysique]);

  // Global audio bootstrap: load prefs, attempt autoplay once, and add a one-shot
  // user gesture fallback to enable audio per browser policies.
  useEffect(() => {
    try {
      // Load persisted audio preferences if available
      (useGameStore.getState() as any)._loadAudioPrefsOnce?.();
    } catch { /* ignore */ }

    try {
      const s = useGameStore.getState() as any;
      if (!s.musicPlaying && !s.musicMuted) {
        // Attempt to start default ambient track on load
        s.playMusic?.('china-chinese-asian-music-346568.mp3');
      }
    } catch { /* ignore */ }

    const onUserGesture = () => {
      try {
        const st = useGameStore.getState() as any;
        if (st.autoplayBlocked) {
          // Retry playing current or default track and clear the blocked flag
          st.playMusic?.(st.currentMusicTrack || 'china-chinese-asian-music-346568.mp3');
          st.setAutoplayBlocked?.(false);
        }
      } catch { /* ignore */ }
      window.removeEventListener('pointerdown', onUserGesture);
      document.removeEventListener('keydown', onUserGesture);
    };

    // Attach once; they self-clean after first invocation
    window.addEventListener('pointerdown', onUserGesture, { once: true } as any);
    document.addEventListener('keydown', onUserGesture, { once: true } as any);

    return () => {
      window.removeEventListener('pointerdown', onUserGesture);
      document.removeEventListener('keydown', onUserGesture);
    };
  }, []);

  const renderScreen = () => {
    switch (ui.currentScreen as string) {
      case 'lore':
        return <TaiYungLore />;
      case 'creation':
        return <CharacterCreation />;
      case 'game':
        return (
          <ErrorBoundary>
            <GameInterface />
          </ErrorBoundary>
        );
      case 'social':
        return (
          <ErrorBoundary>
            <SocialInterface />
          </ErrorBoundary>
        );
      case 'domain':
        return (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <button
                style={{ padding: '8px 12px' }}
                onClick={() => useGameStore.getState().setUIProperty('currentScreen', 'game')}
              >
                ← Back to Game
              </button>
            </div>
            <DomainPanel />
          </div>
        );
          case 'sects':
            return (
              <div style={{ padding: 20 }}>
                <div style={{ marginBottom: 12 }}>
                  <button
                    style={{ padding: '8px 12px' }}
                    onClick={() => useGameStore.getState().setUIProperty('currentScreen', 'game')}
                  >
                    ← Back to Game
                  </button>
                </div>
                <Suspense fallback={<div style={{ padding: 20 }}>Loading sects…</div>}>
                  <SectJoiningPanel />
                </Suspense>
              </div>
            );
      case 'combat':
        return <GameInterface />; // CombatUI is rendered inside GameInterface when active
      case 'rebellion':
        return <RebellionMastery 
          difficulty="medium"
          successThreshold={500}
            onComplete={(result) => {
              logger.warn('Rebellion challenge completed:', result);
              useGameStore.getState().setUIProperty('currentScreen', 'game');
            }}
          onCancel={() => {
            useGameStore.getState().setUIProperty('currentScreen', 'game');
          }}
        />; // Render the Rebellion Mastery component
      case 'market':
        return (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <button
                style={{ padding: '8px 12px' }}
                onClick={() => useGameStore.getState().setUIProperty('currentScreen', 'game')}
              >
                ← Back to Game
              </button>
            </div>
            <Suspense fallback={<div>Loading market…</div>}>
              <MarketPanel />
            </Suspense>
          </div>
        );
      case 'sect-hub':
        return (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <button
                style={{ padding: '8px 12px' }}
                onClick={() => useGameStore.getState().setUIProperty('currentScreen', 'game')}
              >
                ← Back to Game
              </button>
            </div>
            <SectPanel />
          </div>
        );
      case 'mentors':
        return (
          <div style={{ padding: 20 }}>
            <div style={{ marginBottom: 12 }}>
              <button
                style={{ padding: '8px 12px' }}
                onClick={() => useGameStore.getState().setUIProperty('currentScreen', 'game')}
              >
                ← Back to Game
              </button>
            </div>
            <Suspense fallback={<div>Loading mentor panel…</div>}>
              <MentorTeachingPanel />
            </Suspense>
          </div>
        );
      /* 'inventory' route removed — inventory is accessible via the Social screen */
      case 'relationships':
        return <InterpersonalPage />;
      case 'death':
        return <DeathScreen />;
      case 'tutorial':
        return <TutorialPage />;
      default:
        return <TaiYungLore />;
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, var(--dark), var(--darker))' }}>
      {renderScreen()}
    {/* Global UI overlays */}
    <BuffPanel />
    <ToastContainer />
    {/* Hidden audio element to handle music playback globally */}
    <div style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden>
      <MusicPlayer />
    </div>
    </div>
  );
}
