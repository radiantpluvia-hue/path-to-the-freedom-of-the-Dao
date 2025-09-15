/* eslint-disable no-restricted-imports -- imports core systems intentionally for integration UI */
import { useGameStore } from '../../store/useGameStore';
import { Button } from '../core/Button';
import { Card } from '../core/Card';
import { Progress } from '../core/Progress';
import { PhysiqueInfoPanel } from '../info/PhysiqueInfoPanel';
import { BloodlineInfoPanel } from '../info/BloodlineInfoPanel';
import { TalentInfoPanel } from '../info/TalentInfoPanel';
import type { EnhancedQuest } from '../../systems/EnhancedQuestSystem';
import { useEffect, useState } from 'react';
import { MAJOR_SECTS } from '../../systems/SectSystem';

// These imports seem to have incorrect paths and are not used.
// import { MainQuestPanel, SectQuestsPanel, BetrayalMissionsPanel, RandomMissionsPanel } from '../../../QuestPanels';
import CombatUI from '../CombatUI';
import { StoryEventPanel } from '../StoryEventPanel';
import { checkQuestCompletion } from '../../systems/QuestSystem';
import { EnhancedQuestPanel } from '../quest/EnhancedQuestPanel';
import { QuestCompletionNotification } from '../quest/QuestCompletionNotification';
// import { RivalsPanel } from '../../../RivalsPanel'; // Not used
import { ChoiceModal } from '../../../ChoiceModal';
import { CodexModal } from '../Codex';
import { RivalInfoPanel } from '../info/RivalInfoPanel';
import { FactionStandingPanel } from '../info/FactionStandingPanel';  
import { CultivationUI } from '../CultivationUI';
import { TutorialOverlay } from '../tutorial/TutorialOverlay';
import { getRealmKeyFromPlayer } from '../../utils/realmHelpers';

export function GameInterface() {
  const store = useGameStore();
  const {
    player,
    realms,
    eventLog,
    cultivate,
    explore,
    saveGame,
    loadGame,
    ui,
    setUIProperty,
    world,
    story,
    getQuestsByType,
    clearQuestCompletionNotification,
    requestSectMission,
    seekRefuge,
    startRivalEncounter,
    startCombatWithRival,
    updateObjectiveProgress,
    checkEnhancedQuestCompletion,
    getActiveEnhancedQuests,
    checkDailyReset,
  } = store;

  const { selectedRival } = ui;
  // Normalized realm key for UI/display (falls back safely for legacy state)
  const currentRealmKey = getRealmKeyFromPlayer(player);
  const closeRivalModal = () => setUIProperty('selectedRival', null);

  const [showCultivation, setShowCultivation] = useState(false);
  // we only need the setter in this component; ignore the first tuple element to avoid unused var warning
  const [, setActiveQuests] = useState<EnhancedQuest[]>([]);
  const [completedQuest, setCompletedQuest] = useState<EnhancedQuest | null>(null);
  const realmProgress = player.qiRequired > 0 ? (player.currentQi / player.qiRequired) * 100 : 0;

  const performActionAndCheckEvolutions = (action: () => void) => {
    action();

    // Check quest completion after any action
    const result = checkEnhancedQuestCompletion();
    if (result.completed.length > 0) {
      setCompletedQuest(result.completed[0]); // Show first completed quest
    }

    // Update active quests
    setActiveQuests(getActiveEnhancedQuests());
  };

  // Initialize and update quests on mount
  useEffect(() => {
    // Check for daily reset first
    checkDailyReset();

    setActiveQuests(getActiveEnhancedQuests());

    // Check for quest completion on component mount
    const result = checkEnhancedQuestCompletion();
    if (result.completed.length > 0) {
      setCompletedQuest(result.completed[0]);
    }
  }, [checkDailyReset, getActiveEnhancedQuests, checkEnhancedQuestCompletion]); // Run once on mount

  // Update quest progress when player state changes
  useEffect(() => {
    // Update cultivation progress for daily quests
    if (player.dailyCultivationCount !== undefined) {
      updateObjectiveProgress('daily_cultivation', 'cultivate_three_times', player.dailyCultivationCount);
    }
    
    // Check for quest completion
    const result = checkEnhancedQuestCompletion();
    if (result.completed.length > 0 && !completedQuest) {
      setCompletedQuest(result.completed[0]);
    }
    
    // Update active quests list
    setActiveQuests(getActiveEnhancedQuests());
  }, [player.realmId, player.sect, player.skills, player.inventory, player.defeatedRivals, player.dailyCultivationCount, completedQuest, checkEnhancedQuestCompletion, getActiveEnhancedQuests, updateObjectiveProgress]);

  // Check for quest completion when player state or quests change
  useEffect(() => {
    if (!story?.quests) return;
    // Trigger completion check (side-effects handled elsewhere).
  // Intentionally exclude `checkQuestCompletion` from deps because it's a stable
  // top-level system function whose identity may not affect the hook's re-run.
  checkQuestCompletion({ player, story });
  }, [player, story]);

  const handleCultivate = () => performActionAndCheckEvolutions(cultivate);
  const handleExplore = () => performActionAndCheckEvolutions(explore);
  const handleRequestSectMission = () => requestSectMission();

  const toggleCodex = () => {
    setUIProperty('showCodex', !ui.showCodex);
  };

  // If combat is active, render combat UI full-screen
  if (ui.currentScreen === 'combat') {
    return <CombatUI />;
  }



  return (
    <div style={{ minHeight: '100vh' }}>
      <TutorialOverlay />
      {/* Top Tabs for Core | Social */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          padding: '10px 20px',
          position: 'sticky',
          top: 0,
          background: 'linear-gradient(135deg, var(--dark), var(--darker))',
          zIndex: 5,
          borderBottom: '1px solid rgba(212, 175, 55, 0.2)'
        }}
      >
        <button
          onClick={() => setUIProperty('currentScreen', 'game')}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: ui.currentScreen === 'game' ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Core
        </button>
        <button
          onClick={() => setUIProperty('currentScreen', 'social')}
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: (ui.currentScreen as string) === 'social' ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Social
        </button>
        <button
          onClick={() => setUIProperty('currentScreen', 'tutorial')}
          style={{
            marginLeft: 'auto',
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer'
          }}
        >
          Tutorial
        </button>
        <button
          onClick={() => setUIProperty('compactLayout', !ui.compactLayout)}
          title="Toggle minimal UI"
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: ui.compactLayout ? 'rgba(212,175,55,0.15)' : 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer',
            marginLeft: 8
          }}
        >
          Minimal UI
        </button>
        <button
          onClick={() => {
            try { localStorage.removeItem('xg_tutorial_seen'); } catch (e) { /* ignore storage errors */ console.debug('GameInterface: localStorage removeItem failed', e); }
            setUIProperty('currentScreen', 'tutorial');
          }}
          title="Show tutorial overlay"
          style={{
            padding: '8px 12px',
            borderRadius: 6,
            border: '1px solid rgba(212,175,55,0.25)',
            background: 'transparent',
            color: 'var(--primary)',
            cursor: 'pointer',
            marginLeft: 8
          }}
        >
          Show Tutorial
        </button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: ui.compactLayout ? '200px 1fr' : '300px 1fr 300px',
          gap: '20px',
          padding: '20px'
        }}
      >
        <ChoiceModal />
  <CodexModal open={ui.showCodex} onClose={toggleCodex} />
        {showCultivation && (
          <CultivationUI onClose={() => setShowCultivation(false)} />
        )}
        {/* Left Sidebar - Character Info */}
      <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
        {/* Global Rival Info Modal */}
        {ui.selectedRival && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1500
          }}>
            <div style={{ backgroundColor: 'var(--dark)', padding: 20, borderRadius: 8, maxWidth: 800, width: '90%', maxHeight: '80vh', overflow: 'auto' }}>
              <RivalInfoPanel
                rivalId={ui.selectedRival}
                onClose={() => setUIProperty('selectedRival', null)}
                onChallenge={(rid) => {
                  startRivalEncounter(rid);
                  setUIProperty('selectedRival', null);
                }}
              />
            </div>
          </div>
        )}

        <Card title="Character">
          <div style={{ textAlign: 'center', marginBottom: '15px' }}>
            <div style={{ fontSize: '2rem', marginBottom: '5px' }}>👤</div>
            <h3 style={{ color: 'var(--primary)', marginBottom: '5px' }}>{player.name || 'Cultivator'}</h3>
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
              {player.race} {player.gender} • Age {player.age}
            </div>
            {player.sect && (
              <div style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '5px', fontWeight: 'bold' }}>
                {MAJOR_SECTS.find(s => s.id === player.sect)?.name || 'Unknown Sect'}
              </div>
            )}
          </div>
        </Card>

        {player.talentId && (
          <Card title="🌟 Talent">
            <TalentInfoPanel talentId={player.talentId} />
          </Card>
        )}

        {player.bloodline && (
          <Card title="🩸 Bloodline">
            <BloodlineInfoPanel bloodline={player.bloodline} />
          </Card>
        )}

        {player.physique && (
          <Card title="💪 Physique">
            <PhysiqueInfoPanel physique={player.physique} />
          </Card>
        )}

        {/* Compact core page only: remove relations summary */}

        <Card title="Cultivation Progress">
          <div style={{ marginBottom: '10px' }}>
            <strong style={{ color: 'var(--primary)' }}>{realms[currentRealmKey]?.name || currentRealmKey}</strong>
            {player.minorStage > 1 && (
              <span style={{ color: 'var(--accent)', fontSize: '0.9rem', marginLeft: '5px' }}>
                Stage {player.minorStage}
              </span>
            )}
          </div>
          <Progress value={realmProgress} max={100} />
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)', marginTop: '5px' }}>
            Progress: {Math.floor(realmProgress)}%
          </p>
        </Card>

        <Card title="Stats">
          <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cultivation Power:</span>
              <span style={{ color: 'var(--primary)' }}>{player.cultivationPower}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Insight:</span>
              <span style={{ color: 'var(--accent)' }}>{player.insight}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Karma:</span>
              <span style={{ color: player.karma >= 0 ? 'var(--success)' : 'var(--danger)' }}>{player.karma}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Spirit Stones:</span>
              <span style={{ color: 'var(--primary)' }}>
                {player.spiritStones.low}L / {player.spiritStones.mid}M / {player.spiritStones.high}H
              </span>
            </div>
          </div>
        </Card>

        {/* Inventory & Manuals moved to Social page */}
      </div>

      {/* Main Content - Cultivation Methods */}
      <div
        style={{
          display: 'grid',
          gap: '20px',
          alignContent: 'start'
        }}
      >
        <Card title="🧘 Cultivation Methods">
          <div style={{ display: 'grid', gap: '15px' }}>
            <Button onClick={handleCultivate} size="large">
              <div>
                <div style={{ fontSize: '1.1rem', marginBottom: '5px' }}>🧘 Quick Cultivate</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Rapid cultivation session with automatic breakthroughs
                </div>
              </div>
            </Button>

            <Button onClick={() => setShowCultivation(true)} size="large">
              <div>
                <div style={{ fontSize: '1.1rem', marginBottom: '5px' }}>🎮 Interactive Cultivation</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Enter cultivation mode with minigames and breakthroughs
                </div>
              </div>
            </Button>

            <Button onClick={handleExplore} size="large">
              <div>
                <div style={{ fontSize: '1.1rem', marginBottom: '5px' }}>🏔️ Explore</div>
                <div style={{ fontSize: '0.9rem', color: 'var(--muted)' }}>
                  Venture into the wilderness seeking opportunities and treasures
                </div>
              </div>
            </Button>
          </div>
        </Card>

        <Card title="💾 Game Management">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <Button onClick={saveGame}>💾 Save Game</Button>
            <Button onClick={loadGame}>📁 Load Game</Button>
            <Button onClick={toggleCodex} variant="secondary">📚 Codex</Button>
            <Button onClick={() => setUIProperty('currentScreen', 'rebellion')} variant="secondary">
              ⚔️ Rebellion Mastery
            </Button>
            <Button onClick={() => setUIProperty('currentScreen', 'sects')} variant="secondary">
              🛕 Join a Sect
            </Button>
            <Button onClick={() => setUIProperty('currentScreen', 'market')} variant="secondary">
              🏪 Market
            </Button>
            <Button onClick={() => setUIProperty('currentScreen', 'mentors')} variant="secondary">
              🧙 Mentor Teachings
            </Button>
            {player.sect && (
              <Button onClick={handleRequestSectMission} variant="secondary">
                📜 Request Sect Mission
              </Button>
            )}
            {world.flags.expelledFrom && !player.sect && (
              <Button
                onClick={seekRefuge}
                variant="danger"
              >
                ⚔️ Seek Refuge
              </Button>
            )}
          </div>
        </Card>

        {/* Skills moved to Social page */}
      </div>

      {/* Right Sidebar - Core info only (no relations/rivals here) */}
      {!ui.compactLayout && (
        <div style={{ display: 'grid', gap: '20px', alignContent: 'start' }}>
        {/* Enhanced Quest Panels */}
        <EnhancedQuestPanel 
          quests={getQuestsByType('main')} 
          showType="main"
          maxQuests={3}
        />
        <EnhancedQuestPanel 
          quests={getQuestsByType('daily')} 
          showType="daily"
          maxQuests={2}
        />
        <StoryEventPanel />
        <Card title="Faction Standings">
          <FactionStandingPanel />
        </Card>
        {/* Legacy quest panel for comparison - can be removed later */}
        {/* <MainQuestPanel /> */}

        <Card title="📜 Event Log">
          <div style={{ maxHeight: '300px', overflowY: 'auto', fontSize: '0.9rem' }}>
            {eventLog.slice(-10).map((event, index) => (
              <div key={index} style={{ padding: '5px 0', borderBottom: '1px solid rgba(212, 175, 55, 0.1)' }}>
                {event}
              </div>
            ))}
          </div>
        </Card>

        <Card title="⭐ Realm List">
          <div style={{ fontSize: '0.9rem' }}>
            {Object.entries(realms).map(([realmKey, realmData], index) => (
              <div 
                key={realmKey}
                style={{ 
                  padding: '5px',
                  color: realmKey === currentRealmKey ? 'var(--primary)' : 'var(--muted)',
                  fontWeight: realmKey === currentRealmKey ? 'bold' : 'normal'
                }}
              >
                {index + 1}. {realmData.name || realmKey}
              </div>
            ))}
          </div>
        </Card>
      </div>
      )}
      {/* Close grid container */}
      </div>

      {/* Quick Notes floating window */}
      {ui.showNotes && (
        <div style={{ position: 'fixed', right: 12, bottom: 12, width: 300, zIndex: 1200 }}>
          <div style={{ background: 'var(--card-bg)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 8, padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <strong style={{ color: 'var(--primary)' }}>Notes</strong>
              <button onClick={() => setUIProperty('showNotes', false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            <textarea placeholder="Quick notes..." style={{ width: '100%', height: 120, borderRadius: 6, padding: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button onClick={() => setUIProperty('showNotes', false)} style={{ padding: '6px 8px' }}>Close</button>
              <button style={{ padding: '6px 8px' }}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Rival Info Modal */}
      {selectedRival && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <RivalInfoPanel
            rivalId={selectedRival}
            onClose={closeRivalModal}
            onChallenge={(rivalId) => {
              closeRivalModal();
              startCombatWithRival(rivalId);
            }}
          />
        </div>
      )}

      {/* Quest Completion Notification */}
      <QuestCompletionNotification
        quest={completedQuest}
        onClose={() => {
          setCompletedQuest(null);
          clearQuestCompletionNotification();
        }}
        duration={6000}
      />
    </div>
  );
}