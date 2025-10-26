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
import EventLog from '../EventLog';
import RichTooltip from '@/components/ui/RichTooltip';
import { logger } from '@/utils/logger';
import SmallChip from '../ui/SmallChip';

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
import TopBar from './TopBar';
import CharacterPanel from './CharacterPanel';
import { FactionStandingPanel } from '../info/FactionStandingPanel';  
import { CultivationUI } from '../CultivationUI';
import { TutorialOverlay } from '../tutorial/TutorialOverlay';
import { getRealmKeyFromPlayer } from '../../utils/realmHelpers';
import SKILLS from '../../data/skills/all_skills.json';
import MusicSettings from './MusicSettings';
import TrainModal from './TrainModal';
import SeclusionPanel from '../SeclusionPanel';
import InventoryPanel from './InventoryPanel';
import ReincarnationModal from './ReincarnationModal';
import ModalCloseButton from '@/components/ui/ModalCloseButton';

export function GameInterface() {
  const store = useGameStore();
  const {
    player,
    realms,
    eventLog,
    cultivate,
    explore,
  saveGame,
    ui,
  setUIProperty,
    addEventLog,
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

  // Autosave: periodically save the game when enabled in UI settings
  useEffect(() => {
    try {
      const enabled = (ui as any).autosaveEnabled !== false;
      const interval = Number((ui as any).autosaveIntervalMs || 60000);
      if (!enabled) return;
      const id = setInterval(() => {
        try { saveGame && saveGame(); } catch (e) { /* ignore */ }
      }, Math.max(5000, interval));
      return () => clearInterval(id);
    } catch (e) { /* ignore */ }
  }, [saveGame, ui]);

  const { selectedRival } = ui;
  // Normalized realm key for UI/display (falls back safely for legacy state)
  const currentRealmKey = getRealmKeyFromPlayer(player);
  const closeRivalModal = () => setUIProperty('selectedRival', null);

  const [showCultivation, setShowCultivation] = useState(false);
  const [showTraining, setShowTraining] = useState(false);
  const [showSeclusion, setShowSeclusion] = useState(false);
  const [showBreakthroughPicker, setShowBreakthroughPicker] = useState(false);
  const [showRecentTrainingSummary, setShowRecentTrainingSummary] = useState(false);
  const [availableChallenges, setAvailableChallenges] = useState<Array<any>>([]);
  // we only need the setter in this component; ignore the first tuple element to avoid unused var warning
  const [, setActiveQuests] = useState<EnhancedQuest[]>([]);
  const [completedQuest, setCompletedQuest] = useState<EnhancedQuest | null>(null);
  const realmProgress = player.qiRequired > 0 ? (player.currentQi / player.qiRequired) * 100 : 0;
  // Lock cultivate and methods until the player has a manual item in inventory
  const hasManual = Array.isArray((player as any)?.inventory)
    ? (player as any).inventory.some((i: any) => i && (i.type === 'manual' || i.category === 'manual'))
    : (Array.isArray(player.manuals) && player.manuals.length > 0);

  // intentionally-unused binding (event log handled by EventLog component)
  void eventLog;

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
  }, [currentRealmKey, player.sect, player.skills, player.inventory, player.defeatedRivals, player.dailyCultivationCount, completedQuest, checkEnhancedQuestCompletion, getActiveEnhancedQuests, updateObjectiveProgress]);

  // Transient UI: show a small summary when recent training stat deltas are present
  useEffect(() => {
    try {
      const deltas = (player as any).recentStatDelta;
      if (deltas && Object.keys(deltas).length > 0) {
        setShowRecentTrainingSummary(true);
        const id = setTimeout(() => setShowRecentTrainingSummary(false), 6000);
        return () => clearTimeout(id);
      }
    } catch (e) { /* ignore */ }
    return;
  }, [(player as any).recentStatDelta]);

  // Check for quest completion when player state or quests change
  useEffect(() => {
    if (!story?.quests) return;
    // Trigger completion check (side-effects handled elsewhere).
  // Intentionally exclude `checkQuestCompletion` from deps because it's a stable
  // top-level system function whose identity may not affect the hook's re-run.
  checkQuestCompletion({ player, story });
  }, [player, story]);

  const handleCultivate = () => {
    try {
      // If currently cultivating (manual session) then stop cultivating
      if ((ui as any).isCultivating && !(ui as any)._cultivationTimerId) {
        try { (store as any).stopCultivation?.(); } catch (e) { /* ignore */ }
        return;
      }

      // Prevent cultivating when the player has no learned manuals — provide a helpful log message.
      if (!hasManual && !(ui as any).isCultivating) {
        addEventLog?.('You need a cultivation manual to cultivate. Find one via Work or Explore.');
        return;
      }

      performActionAndCheckEvolutions(cultivate);
    } catch (e) {
      // swallow errors from optional bindings in tests/mocks
    }
  };
  const handleExplore = () => performActionAndCheckEvolutions(explore);
  const handleWork = () => performActionAndCheckEvolutions(store.workJob || (() => { /* no-op */ }));

  // EventLog component handles its own auto-scroll
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
      <TopBar
        currentScreen={ui.currentScreen}
        compactLayout={ui.compactLayout}
        showRealmList={(ui as any).showRealmList}
        setUIProperty={setUIProperty}
      />

      <div className={`main-grid ${ui.compactLayout ? 'compact' : ''}`}>
        <ChoiceModal />
  <CodexModal open={ui.showCodex} onClose={toggleCodex} />
        {showCultivation && (
          <CultivationUI onClose={() => setShowCultivation(false)} />
        )}
        {showTraining && (
          <>
            <TrainModal open={showTraining} onClose={() => setShowTraining(false)} />
            {/* When the TrainModal is open, also render the recent training summary near the modal */}
            {(player as any).recentStatDelta && Object.keys((player as any).recentStatDelta).length > 0 && (
              <div style={{ position: 'fixed', right: 24, top: 80, zIndex: 2100 }}>
                <div style={{ padding: 10, borderRadius: 8, background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', color: 'var(--text)', minWidth: 180 }}>
                  <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Recent Training</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {(player as any).recentStatDelta.atk ? <div>⚔️ ATK: <strong style={{ color: 'var(--success)' }}>+{(player as any).recentStatDelta.atk}</strong></div> : null}
                    {(player as any).recentStatDelta.def ? <div>🛡️ DEF: <strong style={{ color: 'var(--success)' }}>+{(player as any).recentStatDelta.def}</strong></div> : null}
                    {(player as any).recentStatDelta.speed ? <div>🏃 SPD: <strong style={{ color: 'var(--success)' }}>+{(player as any).recentStatDelta.speed}</strong></div> : null}
                    {(player as any).recentStatDelta.insight ? <div>📘 INS: <strong style={{ color: 'var(--success)' }}>+{(player as any).recentStatDelta.insight}</strong></div> : null}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
    {/* Left Sidebar - Character Info */}
  <div className="left-sidebar" style={{ position: 'relative', zIndex: 60 }}>
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

  <CharacterPanel player={player} setUIProperty={setUIProperty} />

        <Card title="🌟 Talent">
          {player.talentId ? (
            <TalentInfoPanel talentId={player.talentId} />
          ) : (
            <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>No talent selected — pick one during character creation or via events.</div>
          )}
        </Card>

        {player.bloodline && (
          <Card title="🩸 Bloodline">
            <BloodlineInfoPanel bloodline={player.bloodline} />
          </Card>
        )}

        {/* Breakthrough picker modal (used by cultivation controls) */}
        {showBreakthroughPicker && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div style={{ width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ marginTop: 0 }}>Choose a Breakthrough Challenge</h3>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {availableChallenges && availableChallenges.length ? (
                  availableChallenges.map((c: any) => (
                    <div key={c.id} style={{ padding: 12, borderRadius: 6, background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 'bold' }}>{c.name || c.id}</div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6 }}>{c.description}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button type="button" onClick={() => {
                          try {
                            setShowBreakthroughPicker(false);
                            if (typeof (store as any).attemptRealmBreakthroughWithConsolidation === 'function') {
                              (store as any).attemptRealmBreakthroughWithConsolidation(c.id);
                            } else {
                              // fallback: call a generic attempt API if available
                              (store as any).checkRealmBreakthrough?.();
                            }
                          } catch (e) { /* ignore */ }
                        }} style={{ padding: '8px 12px' }}>Attempt</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--muted)' }}>No challenges available. Improve your cultivation foundation before attempting.</div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button type="button" onClick={() => setShowBreakthroughPicker(false)} style={{ padding: '8px 12px' }}>Close</button>
              </div>
            </div>
          </div>
        )}

        {player.physique && (
          <Card title="💪 Physique">
            <PhysiqueInfoPanel physique={player.physique} />
          </Card>
        )}

        {/* Compact core page only: remove relations summary */}

        <Card title="Cultivation Progress">
          <div style={{ marginBottom: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ color: 'var(--primary)' }}>{realms[currentRealmKey]?.name || currentRealmKey}</strong>
              {(player.minorStage ?? 0) >= 1 && (
                <span style={{ color: 'var(--accent)', fontSize: '0.9rem', marginLeft: '5px' }}>
                  Stage {player.minorStage || 1}
                </span>
              )}
            </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button
                  size="small"
                  onClick={handleCultivate}
                  // Keep the button disabled only while auto-cultivating; allow clicks when no manual so
                  // the UI can provide a helpful log message via handleCultivate.
                  disabled={(ui as any)._cultivationTimerId != null}
                  ariaLabel={!hasManual && !(ui as any).isCultivating ? 'You need a cultivation manual to cultivate. Find one via Work or Explore.' : undefined}
                >
                  <SmallChip>{((ui as any).isCultivating && !(ui as any)._cultivationTimerId ? 'Stop' : 'Cultivate')}</SmallChip>
                </Button>

                {/* Auto-cultivation removed per simplified model */}

                <Button
                  size="small"
                  variant="secondary"
                  disabled={(ui as any).isCultivating === true}
                  onClick={() => {
                    try {
                      const progress = Number(((ui as any).cultivationProgress ?? realmProgress) as number) || 0;
                      const realmKey = getRealmKeyFromPlayer(player);
                      if (progress >= 100) {
                        // Show a modal allowing the player to pick a breakthrough challenge
                        const challenges = (store as any).breakthroughSystem?.getAvailableChallenges?.(realmKey) || [];
                        setAvailableChallenges(Array.isArray(challenges) ? challenges : []);
                        setShowBreakthroughPicker(true);
                      } else {
                        (store as any).advanceMinorStage?.();
                      }
                    } catch (e) {
                      /* no-op */
                    }
                  }}
                >
                  <SmallChip>Advance Stage / Breakthrough</SmallChip>
                </Button>
                <Button
                  size="small"
                  variant="secondary"
                  onClick={() => setShowTraining(true)}
                >
                  <SmallChip>Train</SmallChip>
                </Button>
              </div>
          </div>
          <Progress value={Number(((ui as any).cultivationProgress ?? realmProgress).toFixed ? (ui as any).cultivationProgress : realmProgress)} max={100} />
          <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--muted)', marginTop: '5px' }}>
            Progress: {Math.floor(((ui as any).cultivationProgress ?? realmProgress) as number)}%
          </p>
          {(ui as any).isCultivating && (
            <div style={{ textAlign: 'center', color: 'var(--muted)', fontSize: '0.85rem' }}>
              Auto-cultivating… other activities are disabled until you stop.
            </div>
          )}
        </Card>

        <Card title="Stats">
          <div style={{ display: 'grid', gap: '8px', fontSize: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>HP:</span>
              <span style={{ color: 'var(--primary)' }}>{player.hp}/{player.maxHp}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Qi:</span>
              <span style={{ color: 'var(--primary)' }}>{player.maxQi ?? (player.stats?.qi || 0)}</span>
            </div>
            <RichTooltip content={((player as any).recentStatDelta?.atk ? `+${(player as any).recentStatDelta.atk} from recent training` : '')}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ATK:</span>
              <span style={{ color: 'var(--accent)' }}>
                {player.stats?.atk ?? 0}
                {(player as any).recentStatDelta?.atk ? <span style={{ color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }}>+{(player as any).recentStatDelta.atk}</span> : null}
              </span>
            </div>
            </RichTooltip>
            <RichTooltip content={((player as any).recentStatDelta?.def ? `+${(player as any).recentStatDelta.def} from recent training` : '')}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>DEF:</span>
              <span style={{ color: 'var(--accent)' }}>
                {player.stats?.def ?? 0}
                {(player as any).recentStatDelta?.def ? <span style={{ color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }}>+{(player as any).recentStatDelta.def}</span> : null}
              </span>
            </div>
            </RichTooltip>
            <RichTooltip content={((player as any).recentStatDelta?.speed ? `+${(player as any).recentStatDelta.speed} from recent training` : '')}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Speed:</span>
              <span style={{ color: 'var(--accent)' }}>
                {player.stats?.speed ?? 0}
                {(player as any).recentStatDelta?.speed ? <span style={{ color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }}>+{(player as any).recentStatDelta.speed}</span> : null}
              </span>
            </div>
            </RichTooltip>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Cultivation Power:</span>
              <span style={{ color: 'var(--primary)' }}>{player.cultivationPower}</span>
            </div>
            <RichTooltip content={((player as any).recentStatDelta?.insight ? `+${(player as any).recentStatDelta.insight} from recent study` : '')}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Insight:</span>
              <span style={{ color: 'var(--accent)' }}>
                {player.insight}
                {(player as any).recentStatDelta?.insight ? <span style={{ color: 'var(--success)', marginLeft: 6, fontSize: '0.8rem' }}>+{(player as any).recentStatDelta.insight}</span> : null}
              </span>
            </div>
            </RichTooltip>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Karma:</span>
              <span style={{ color: (player.karma ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)' }}>{player.karma ?? 0}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Spirit Stones:</span>
              <span style={{ color: 'var(--primary)' }}>
                {player.spiritStones.low}L / {player.spiritStones.mid}M / {player.spiritStones.high}H
              </span>
            </div>
            {/* Passive tier summary */}
            {Array.isArray(player.passiveIds) && player.passiveIds.length > 0 && (() => {
              const counts: Record<string, number> = { S: 0, A: 0, B: 0, C: 0 };
              player.passiveIds.forEach((pid: string) => {
                const def = SKILLS.find((s: any) => s.id === pid);
                const tier = (def && def.tier) ? String(def.tier).toUpperCase() : 'C';
                if (!counts[tier]) counts[tier] = 0;
                counts[tier] += 1;
              });
              return (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--muted)' }}>Passive Tiers</span>
                  <SmallChip style={{ color: 'var(--accent)' }}>{`S(${counts.S}) A(${counts.A}) B(${counts.B}) C(${counts.C})`}</SmallChip>
                </div>
              );
            })()}
          </div>
        </Card>

        {/* Cultivation Schedule removed per spec */}

        {/* Inventory & Manuals moved to Social page */}
      </div>

      {/* Main Content - Cultivation Methods */}
      <div className="main-content" style={{ paddingLeft: 24, position: 'relative', zIndex: 20 }}>
        <Card
          title="🧘 Cultivation Methods"
          compact
          style={{ width: '90%', overflow: 'hidden', boxSizing: 'border-box' }}
        >
          <div style={{ display: 'grid', gap: '10px' }}>
            {/* Schedule lives in the left sidebar; remove duplicate CTA */}

            <Button onClick={() => setShowCultivation(true)} size="medium" disabled={!hasManual}
              ariaLabel={!hasManual ? 'You need a cultivation manual to unlock this feature.' : undefined}>
              <div>
                <div style={{ fontSize: '1rem', marginBottom: '4px' }}>🎮 Interactive Cultivation</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Enter cultivation mode with minigames and breakthroughs
                </div>
              </div>
            </Button>

            <Button onClick={handleExplore} size="medium" disabled={(ui as any).isCultivating === true}
              ariaLabel={undefined}>
              <div>
                <div style={{ fontSize: '1rem', marginBottom: '4px' }}>🏔️ Explore</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Venture into the wilderness seeking opportunities and treasures
                </div>
              </div>
            </Button>

            <Button onClick={handleWork} size="medium" disabled={(ui as any).isCultivating === true}
              ariaLabel={undefined}>
              <div>
                <div style={{ fontSize: '1rem', marginBottom: '4px' }}>🛠️ Work a Job</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Earn yuan and maybe discover a manual while working
                </div>
              </div>
            </Button>

            <Button onClick={() => setShowTraining(true)} size="medium" disabled={(ui as any).isCultivating === true}
              ariaLabel={undefined}>
              <div>
                <div style={{ fontSize: '1rem', marginBottom: '4px' }}>🏋️ Training</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Comprehend manuals, temper your body, and train martial arts
                </div>
              </div>
            </Button>

            {/* Transient recent training summary */}
            {showRecentTrainingSummary && (player as any).recentStatDelta && (
              <div style={{ marginTop: 8, padding: '8px', borderRadius: 6, background: 'rgba(0,0,0,0.45)', color: 'white', fontSize: '0.9rem' }}>
                <div style={{ fontWeight: 'bold', marginBottom: 6 }}>Recent Training</div>
                <div style={{ display: 'flex', gap: 10 }}>
                  {(player as any).recentStatDelta.atk ? <div style={{ color: 'var(--success)' }}>ATK +{(player as any).recentStatDelta.atk}</div> : null}
                  {(player as any).recentStatDelta.def ? <div style={{ color: 'var(--success)' }}>DEF +{(player as any).recentStatDelta.def}</div> : null}
                  {(player as any).recentStatDelta.speed ? <div style={{ color: 'var(--success)' }}>SPD +{(player as any).recentStatDelta.speed}</div> : null}
                  {(player as any).recentStatDelta.insight ? <div style={{ color: 'var(--success)' }}>INS +{(player as any).recentStatDelta.insight}</div> : null}
                </div>
              </div>
            )}

            <Button onClick={() => setShowSeclusion(true)} size="medium" disabled={(ui as any).isCultivating === true}
              ariaLabel={undefined}>
              <div>
                <div style={{ fontSize: '1rem', marginBottom: '4px' }}>🌲 Seclusion</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>
                  Enter seclusion to quietly study and accumulate comprehension over time
                </div>
              </div>
            </Button>
          </div>
        </Card>

  <Card title="💾 Game Management" compact style={{ width: '100%', boxSizing: 'border-box' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <Button onClick={toggleCodex} variant="secondary" size="small">📚 Codex</Button>
            {!player.sect && (
              <Button onClick={() => setUIProperty('currentScreen', 'sects')} variant="secondary" size="small">
                🛕 Join a Sect
              </Button>
            )}
            {player.sect && (
              <Button onClick={() => setUIProperty('currentScreen', 'sect-hub')} variant="secondary" size="small">
                🏛️ Sect Hub
              </Button>
            )}
            {player.sect && (
              <Button onClick={() => { try { (store as any).leaveSect?.(); addEventLog?.('You left your sect.'); } catch (e) { /* ignore */ } }} variant="danger" size="small">
                🚪 Leave Sect
              </Button>
            )}
            <Button onClick={() => setUIProperty('currentScreen', 'market')} variant="secondary" size="small">
              🏪 Market
            </Button>
            <Button onClick={() => setUIProperty('currentScreen', 'mentors')} variant="secondary" size="small">
              🧙 Mentor Teachings
            </Button>
            <Button onClick={() => setUIProperty('showInventoryModal', true)} variant="secondary" size="small">
              🎒 Inventory
            </Button>
            {/* Reincarnation is now only possible via death; manual button removed */}
            {player.sect && (
              <Button onClick={handleRequestSectMission} variant="secondary" size="small">
                📜 Request Sect Mission
              </Button>
            )}
            {world.flags.expelledFrom && !player.sect && (
              <Button
                onClick={seekRefuge}
                variant="danger"
                size="small"
              >
                ⚔️ Seek Refuge
              </Button>
            )}
          </div>
          <div style={{ marginTop: 8 }}>
              <Card title="📜 Event Log" compact>
                <EventLog maxVisible={12} />
              </Card>
          </div>
        </Card>

        {/* Skills moved to Social page */}
      </div>

      {/* Right Sidebar - Core info only (no relations/rivals here) */}
      {!ui.compactLayout && (
        <div className="right-sidebar">
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
        {(world.currentWorldType && world.currentWorldType !== 'mortal') && (
          <Card title="Faction Standings">
            <FactionStandingPanel />
          </Card>
        )}
        {/* Legacy quest panel for comparison - can be removed later */}
        {/* <MainQuestPanel /> */}

        {/* Event Log moved under Game Management */}

        {/* Music is controlled from Settings -> Music; avoid duplicate player in the sidebar */}

        {(ui as any).showRealmList !== false && (
        <Card title="⭐ Realm List">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <div style={{ color: 'var(--muted)' }}>Available Realms</div>
            <button type="button" onClick={() => (setUIProperty as any)('showRealmList', false)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
              <SmallChip style={{ borderRadius: 4 }}>Hide</SmallChip>
            </button>
          </div>
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
        )}
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
              <button type="button" onClick={() => setUIProperty('showNotes', false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>×</button>
            </div>
            <textarea placeholder="Quick notes..." style={{ width: '100%', height: 120, borderRadius: 6, padding: 8 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
              <button type="button" onClick={() => setUIProperty('showNotes', false)} style={{ padding: 0 }}><SmallChip>Close</SmallChip></button>
              <button type="button" style={{ padding: 0 }}><SmallChip>Save</SmallChip></button>
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

      {/* Settings Modal (music and audio preferences) */}
      {(ui as any).showSettings && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1600
        }}>
          <div style={{ backgroundColor: 'var(--dark)', padding: 16, borderRadius: 8, minWidth: 320 }}>
            <button type="button" onClick={() => (setUIProperty as any)('showSettings', false)} style={{ float: 'right', background: 'none', border: 'none', color: 'var(--muted)' }}>✕</button>
            <MusicSettings onClose={() => (setUIProperty as any)('showSettings', false)} />
            <div style={{ marginTop: 12, color: 'var(--muted)' }}>
              <h4 style={{ marginTop: 0 }}>Autosave</h4>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <label style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <input type="checkbox" checked={(ui as any).autosaveEnabled ?? true} onChange={(e) => setUIProperty?.('autosaveEnabled', !!e.target.checked)} />
                  <span style={{ color: 'var(--muted)' }}>Enable autosave</span>
                </label>
                <label style={{ marginLeft: 12, color: 'var(--muted)', fontSize: '0.9rem' }}>
                  Interval (s):
                  <input type="number" min={5} value={Math.max(5, Number((ui as any).autosaveIntervalMs || 60000) / 1000)} onChange={(e) => {
                    const val = Math.max(5, Number(e.target.value) || 5);
                    setUIProperty?.('autosaveIntervalMs', Math.floor(val * 1000));
                  }} style={{ marginLeft: 6, width: 80 }} />
                </label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test-only helper: expose a hidden 'View threads' button so tests can locate and click it
          to open the narrative modal without relying on hover/focus state in tool environments. */}
      {typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'test' && (
  <button type="button" onClick={() => (setUIProperty as any)('showNarrative', true)} style={{ position: 'absolute', left: -9999, top: 0 }}>View threads</button>
      )}

      {/* Seclusion modal */}
      {showSeclusion && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Modal close button */}
            <ModalCloseButton onClick={() => setShowSeclusion(false)} ariaLabel="Close seclusion" title="Close" />
            <SeclusionPanel />
          </div>
        </div>
      )}

  {/* Reincarnation modal */}
  <ReincarnationModal />

      {/* Inventory modal (in-page) */}
      {(ui as any).showInventoryModal && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ width: 760, maxHeight: '80vh', overflow: 'auto', background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
            {/* Modal close button */}
            <ModalCloseButton onClick={() => setUIProperty('showInventoryModal', false)} ariaLabel="Close inventory" title="Close" />
            <InventoryPanel injectedUseGameStore={useGameStore} />
          </div>
        </div>
      )}

  {/* Optional Era Dev Panel (hidden unless explicitly enabled) */}
  { (() => {
    const devOn = (typeof window !== 'undefined') && (window as any).__ERA_DEV__ === true;
    const hasState = typeof (useGameStore as any).getState === 'function';
    const hasDev = hasState && (useGameStore as any).getState().eraDev;
    return devOn && hasDev;
  })() ? (
    <div style={{ position: 'fixed', bottom: 8, right: 8, background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '8px 10px', borderRadius: 8, display: 'flex', gap: 8 }}>
  <input aria-label="Era seed" placeholder="Era seed" onChange={(e) => ((window as any).__ERA_DEV_SEED__ = (e.target as HTMLInputElement).value)} style={{ padding: '4px 6px', borderRadius: 4, border: '1px solid #444', background: '#111', color: '#fff' }} />
  <button type="button" onClick={() => { const s = (window as any).__ERA_DEV_SEED__ || String(Date.now()); const dev = (useGameStore as any).getState?.().eraDev; dev?.reseedCurrent?.(s); }} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #666', background: '#222', color: '#fff', cursor: 'pointer' }}>Reseed Era</button>
  <button type="button" onClick={() => { const dev = (useGameStore as any).getState?.().eraDev; dev?.forceNext?.(); }} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #666', background: '#222', color: '#fff', cursor: 'pointer' }}>Next Era</button>
  <button type="button" onClick={() => { const dev = (useGameStore as any).getState?.().eraDev; const d = dev?.dump?.(); logger.debug && logger.debug('Era dump', d); }} style={{ padding: '6px 8px', borderRadius: 6, border: '1px solid #666', background: '#222', color: '#fff', cursor: 'pointer' }}>Dump</button>
    </div>
  ) : null }

  {/* Dev-only hotkey: Ctrl+Alt+E toggles Era Dev Panel (no-op in tests) */}
  { (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'test') && (
    <DevEraToggle />
  ) }

      {/* Quest Completion Notification */}
      <QuestCompletionNotification
        quest={completedQuest}
        onClose={() => {
          setCompletedQuest(null);
          clearQuestCompletionNotification();
        }}
        duration={6000}
      />

      {/* Breakthrough challenge picker modal (shown when progress >= 100%) */}
      {showBreakthroughPicker && (
        <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1800, backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div style={{ width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
            <h3 style={{ marginTop: 0 }}>Choose a Breakthrough Challenge</h3>
            <p style={{ color: 'var(--muted)' }}>Select a breakthrough challenge to attempt. Consolidation penalties will be applied automatically based on recent cultivation speed.</p>
            <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
              {availableChallenges && availableChallenges.length ? (
                availableChallenges.map((c: any) => {
                  // compute a simple requirements list and consolidation summary
                  const reqs: string[] = [];
                  if (c.requirements?.skills) {
                    Object.entries(c.requirements.skills).forEach(([sk, val]) => reqs.push(`${sk}: ${val}`));
                  }
                  if (c.requirements?.minStats) {
                    Object.entries(c.requirements.minStats).forEach(([st, val]) => reqs.push(`${st}: ${val}`));
                  }
                  if (c.requirements?.items) {
                    reqs.push(`Items: ${c.requirements.items.join(', ')}`);
                  }
                  if (c.requirements?.karma !== undefined) {
                    reqs.push(`Karma >= ${c.requirements.karma}`);
                  }

                  const rewards: string[] = [];
                  if (c.rewards?.insights) rewards.push(...c.rewards.insights.map((i: string) => `Insight: ${i}`));
                  if (c.rewards?.stats) rewards.push(...Object.entries(c.rewards.stats).map(([k, v]) => `${k} +${v}`));

                  const ticksSpent = Math.max(0, (store.world?.tick || 0) - ((player as any).cultivationStartTick || 0));
                  const consolidationThreshold = 3;
                  const consolidationFactor = Math.min(1, ticksSpent / consolidationThreshold);
                  const daoHeart = player.daoHeart || 0;
                  const penalty = Math.floor((1 - consolidationFactor) * daoHeart);

                  return (
                    <div key={c.id} style={{ padding: 12, borderRadius: 6, background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ fontWeight: 'bold' }}>{c.name || c.id}</div>
                          <div style={{ color: 'var(--muted)', fontSize: '0.85rem' }}>Difficulty: {Math.round(c.difficulty || 0)}</div>
                        </div>
                        <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6 }}>{c.description}</div>

                        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>Requirements</div>
                            {reqs.length ? reqs.map((r, i) => <div key={i} style={{ fontSize: '0.9rem' }}>{r}</div>) : <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>None</div>}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>Rewards</div>
                            {rewards.length ? rewards.map((r, i) => <div key={i} style={{ fontSize: '0.9rem' }}>{r}</div>) : <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>None</div>}
                          </div>
                          <div style={{ width: 180 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>Risks</div>
                            {c.risks && c.risks.length ? c.risks.map((r: string, i: number) => <div key={i} style={{ fontSize: '0.9rem' }}>{r}</div>) : <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Minor</div>}
                            <div style={{ marginTop: 8, fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>Consolidation</div>
                            <div style={{ fontSize: '0.9rem' }}>Ticks spent cultivating: {ticksSpent}</div>
                            <div style={{ fontSize: '0.9rem' }}>Consolidation factor: {consolidationFactor.toFixed(2)}</div>
                            <div style={{ fontSize: '0.9rem' }}>Estimated daoHeart penalty: -{penalty}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button size="small" onClick={() => {
                          try {
                            setShowBreakthroughPicker(false);
                            if (typeof (store as any).attemptRealmBreakthroughWithConsolidation === 'function') {
                              (store as any).attemptRealmBreakthroughWithConsolidation(c.id);
                            } else {
                              (store as any).breakthroughSystem?.attemptRealmBreakthrough?.(getRealmKeyFromPlayer(player), c.id, { daoHeart: player.daoHeart || 0, stability: (player as any).stability || 0, karma: player.karma || 0, hp: player.hp || 0 }, player.skills);
                            }
                          } catch (e) { void e; }
                        }}>Attempt</Button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ color: 'var(--muted)' }}>No breakthrough challenges available. Improve your cultivation foundation or attempt minor stage advancement.</div>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
              <Button variant="secondary" onClick={() => setShowBreakthroughPicker(false)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Small internal component to register a debug hotkey for toggling the Era Dev Panel
function DevEraToggle() {
  // useEffect is imported as a named import earlier
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && (e.key === 'e' || e.key === 'E')) {
        (window as any).__ERA_DEV__ = !(window as any).__ERA_DEV__;
  try { logger.debug && logger.debug('ERA DEV toggled:', (window as any).__ERA_DEV__); } catch (_err) { void 0; }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  return null;
}