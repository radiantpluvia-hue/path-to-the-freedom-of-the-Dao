import { useEffect, lazy, Suspense } from 'react';
import { useGameStore } from './store/useGameStore';
import { TaiYungLore } from './components/game/TaiYungLore';
import { CharacterCreation } from './components/game/CharacterCreation';
import { GameInterface } from './components/game/GameInterface';
import { SocialInterface } from './components/game/SocialInterface';
import SkillEvolutionTest from './components/test/SkillEvolutionTest';
import { RebellionMastery } from './components/minigames/RebellionMastery';
import { TutorialPage } from './components/tutorial/TutorialPage';
import './styles/globals.css';
import './styles/theme.css';
import BuffPanel from './components/BuffPanel';

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
  }, [assignRandomBloodline, assignRandomPhysique]);

  const renderScreen = () => {
    switch (ui.currentScreen as string) {
      case 'lore':
        return <TaiYungLore />;
      case 'creation':
        return <CharacterCreation />;
      case 'game':
        return <GameInterface />;
      case 'social':
        return <SocialInterface />;
      case 'sects':
        return (
          <Suspense fallback={<div style={{ padding: 20 }}>Loading sects…</div>}>
            <SectJoiningPanel />
          </Suspense>
        );
      case 'combat':
        return <GameInterface />; // CombatUI is rendered inside GameInterface when active
      case 'rebellion':
        return <RebellionMastery 
          difficulty="medium"
          successThreshold={500}
          onComplete={(result) => {
            console.log('Rebellion challenge completed:', result);
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
      {/* The SkillEvolutionTest component should only be rendered in a development environment */}
      {process.env.NODE_ENV === 'development' && <SkillEvolutionTest />}
    </div>
  );
}
