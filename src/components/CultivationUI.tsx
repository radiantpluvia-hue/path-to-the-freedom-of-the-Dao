/* eslint-disable no-restricted-imports -- imports core systems intentionally */
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { performBreakthroughAttempt } from '../utils/attemptHelpers';
import { BreakthroughSystem, MinorStage } from '../systems/BreakthroughSystem';
import { CULTIVATION_REALMS } from '../data/cultivationRealms';
import { getPlayerRealmId } from '../utils/playerHelpers';
import { getRealmKeyFromPlayerSync, canAdvanceRealm, costForNextRealm } from '../utils/realmHelpersLoader';
import { calculateCultivationSpeed, generateCultivationSession, getApplicableModifiers, generateBreakthroughAttempt } from '../../cultivationMechanics';
import { resolvePatternTribulation, pickPattern, TribulationPattern } from '@/utils/tribulationPatterns';
import RichTooltip from '@/components/ui/RichTooltip';
import SmallChip from '@/components/ui/SmallChip';

interface CultivationUIProps {
  onClose: () => void;
}

export const CultivationUI: React.FC<CultivationUIProps> = ({ onClose }) => {
  const store = useGameStore();
  const { player, updatePlayerState, addEventLog, setUIProperty: _setUIProperty } = store;
  const [breakthroughSystem] = useState(() => new BreakthroughSystem());
    const [showBreakthroughPicker, setShowBreakthroughPicker] = useState(false);
    const [availableChallenges, setAvailableChallenges] = useState<Array<any>>([]);

  const [minorStageInfo, setMinorStageInfo] = useState<MinorStage | null>(null);
  const [showConfirmAttempt, setShowConfirmAttempt] = useState(false);
  const [pendingChallenge, setPendingChallenge] = useState<any | null>(null);

  // Cultivation allocation state
  const [_allocatedDays, _setAllocatedDays] = useState((player as any).cultivationDaysAllocated || 0);

  const realmKey = getRealmKeyFromPlayerSync(player as any);
  const currentRealm = realmKey ? CULTIVATION_REALMS[realmKey] : null;
  const nextRealm = currentRealm?.nextRealm ? CULTIVATION_REALMS[currentRealm.nextRealm] : null;
  const realmDifficulty = currentRealm?.breakthroughDifficulty || 1;
  const patternPreview: TribulationPattern | null = realmKey ? pickPattern(realmDifficulty) : null;

  // Manual gating: require at least one cultivation manual to attempt breakthroughs
  const hasManual = Array.isArray((player as any).manuals) && (player as any).manuals.length > 0;
  const isCultivating = !!((store as any).ui && (store as any).ui.isCultivating);

  // Calculate remaining lifespan in minutes
  const remainingLifespanYears = (player.lifespan || 150) - (player.age || 16);
  const remainingLifespanDays = remainingLifespanYears * 365;
  const remainingLifespanMinutes = remainingLifespanDays * 1440;
  const _maxSessionMinutes = Math.min(525600, remainingLifespanMinutes); // 365 days max
  // Mark some imported helpers and intentionally-unused local bindings in this UI to avoid noisy warnings
  // (they're referenced in other code paths or intended for future features)
  void calculateCultivationSpeed;
  void generateCultivationSession;
  void getApplicableModifiers;
  void resolvePatternTribulation;
  // Referencing these intentionally-unused bindings prevents ESLint from reporting them as unused
  void _setUIProperty;
  void _allocatedDays;
  void _setAllocatedDays;
  void _maxSessionMinutes;

  useEffect(() => {
    const stageInfo = breakthroughSystem.getMinorStageInfo(realmKey, player.minorStage || 1);
    setMinorStageInfo(stageInfo);
  }, [realmKey, player.minorStage, breakthroughSystem]);

  const handleBreakthrough = () => {
    if (!realmKey || !minorStageInfo) return;

    const currentStage = player.minorStage || 1;
    const maxStage = minorStageInfo.maxStage;

    // Check if we can breakthrough to next stage
  if (currentStage < maxStage) {
      // Minor breakthrough - always succeeds if player has enough Qi
        if (player.currentQi >= minorStageInfo.qiRequired) {
        const newStage = currentStage + 1;
        updatePlayerState({
          minorStage: newStage,
          currentQi: Math.max(0, player.currentQi - minorStageInfo.qiRequired)
        });
          addEventLog(`Successfully advanced to ${currentRealm?.name} stage ${newStage}!`);
      } else {
        addEventLog(`Insufficient Qi: ${player.currentQi}/${minorStageInfo.qiRequired}`);
      }
    } else {
      // Major realm breakthrough attempt is handled by store rules (gates on Qi/manuals)
      if (currentRealm?.nextRealm) {
          // Instead of immediately calling the store gate, present a challenge picker so the player can select
          const rk = realmKey;
          const challenges = (store as any).breakthroughSystem?.getAvailableChallenges?.(rk) || breakthroughSystem.getAvailableChallenges(rk) || [];
          setAvailableChallenges(Array.isArray(challenges) ? challenges : []);
          setShowBreakthroughPicker(true);
      } else {
        addEventLog('Already at the highest realm!');
      }
    }
  };




  

  const getStageProgress = () => {
    if (!minorStageInfo) return 0;
    return Math.min(100, (player.currentQi / minorStageInfo.qiRequired) * 100);
  };

  const getStabilityColor = (stability: number) => {
    if (stability >= 80) return '#16a34a';
    if (stability >= 60) return '#ca8a04';
    if (stability >= 40) return '#ea580c';
    return '#dc2626';
  };

  // Consolidation estimate helpers (mirror store logic for display)
  const consolidationThreshold = 3; // ticks
  const getTicksSpent = () => {
    const startTick = (player as any).cultivationStartTick || 0;
    const ticks = Math.max(0, (store.world?.tick || 0) - startTick);
    return ticks;
  };

  const getConsolidationFactor = () => {
    const ticks = getTicksSpent();
    return Math.min(1, ticks / consolidationThreshold);
  };

  const getEstimatedPenalty = () => {
    const factor = getConsolidationFactor();
    const daoHeart = (player as any).daoHeart || 0;
    return Math.floor((1 - factor) * daoHeart);
  };

  const isPenaltyCatastrophic = (penalty: number) => {
    const dao = (player as any).daoHeart || 0;
    // catastrophic if penalty removes >= 50% of daoHeart
    return dao > 0 && penalty >= Math.ceil(dao * 0.5);
  };

  const attemptChallenge = (challengeId: string, force = false) => {
    const penalty = getEstimatedPenalty();
    if (!force && isPenaltyCatastrophic(penalty)) {
      setPendingChallenge(challengeId);
      setShowConfirmAttempt(true);
      return;
    }
    try {
      performBreakthroughAttempt(challengeId);
    } catch (e) { /* no-op */ }
  };



  return (
    <div style={{ 
      position: 'fixed', 
      top: 0, 
      left: 0, 
      right: 0, 
      bottom: 0, 
      background: 'rgba(0,0,0,0.8)', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      zIndex: 9000
    }}>
      <div style={{ 
        background: 'var(--dark)', 
        border: '2px solid var(--primary)', 
        borderRadius: '12px', 
        padding: '20px', 
        maxWidth: '640px', 
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto',
        opacity: 1
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: 'var(--primary)', margin: 0 }}>🧘 Cultivation Progress</h2>
          <button onClick={onClose} style={{ 
            background: 'none', 
            border: 'none', 
            color: 'var(--text)', 
            fontSize: '24px', 
            cursor: 'pointer' 
          }}>×</button>
        </div>
        {/* Breakthrough challenge picker modal (shared with GameInterface) */}
        {showBreakthroughPicker && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8900, backgroundColor: 'rgba(0,0,0,0.6)' }}>
            <div style={{ width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ marginTop: 0 }}>Choose a Breakthrough Challenge</h3>
              <p style={{ color: 'var(--muted)' }}>Select a breakthrough challenge to attempt. Consolidation penalties will be applied automatically based on recent cultivation speed.</p>
              <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                {availableChallenges && availableChallenges.length ? (
                  availableChallenges.map((c: any) => (
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
                            {c.requirements && c.requirements.skills ? Object.entries(c.requirements.skills).map(([sk, val]) => <div key={sk} style={{ fontSize: '0.9rem' }}>{`${sk}: ${val}`}</div>) : <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>None</div>}
                          </div>
                          <div style={{ width: 180 }}>
                            <div style={{ fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }}>Risks</div>
                            {c.risks && c.risks.length ? c.risks.map((r: string, i: number) => <div key={i} style={{ fontSize: '0.9rem' }}>{r}</div>) : <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Minor</div>}
                          </div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <button onClick={() => { setShowBreakthroughPicker(false); attemptChallenge(c.id); }} style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}>
                          <SmallChip>Attempt</SmallChip>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ color: 'var(--muted)' }}>No breakthrough challenges available. Improve your cultivation foundation or attempt minor stage advancement.</div>
                )}
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 12 }}>
                <button onClick={() => setShowBreakthroughPicker(false)} style={{ padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }}><SmallChip>Close</SmallChip></button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation modal for catastrophic consolidation penalties */}
        {showConfirmAttempt && (
          <div style={{ position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8950, backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div style={{ width: 460, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }}>
              <h3 style={{ marginTop: 0 }}>Confirm Risky Attempt</h3>
              <p style={{ color: 'var(--muted)' }}>The consolidation penalty is high. Attempting now will cost <strong>{getEstimatedPenalty()}</strong> Dao Heart. Proceed only if you accept this loss.</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
                <button onClick={() => { setShowConfirmAttempt(false); setPendingChallenge(null); }} style={{ padding: '8px 12px' }}>Cancel</button>
                <button onClick={() => { setShowConfirmAttempt(false); if (pendingChallenge) attemptChallenge(pendingChallenge, true); setPendingChallenge(null); }} style={{ padding: '8px 12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 4 }}>Proceed</button>
              </div>
            </div>
          </div>
        )}

        {/* Current Realm Info */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }}>
          <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>
            {currentRealm?.name || 'Unknown Realm'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <strong>Stage:</strong>{' '}
              <RichTooltip content={`Current stage: ${player.minorStage || 1}\nTotal minor stages in this realm: ${minorStageInfo?.maxStage || 1}\nComplete all minor stages to attempt a realm breakthrough.`}>
                <span style={{ textDecoration: 'underline dotted', cursor: 'help' }}>{player.minorStage || 1} / {minorStageInfo?.maxStage || 1}</span>
              </RichTooltip>
            </div>
            <div>
              <strong>Stability:</strong>
              <span style={{ color: getStabilityColor((player as any).stability || 0), marginLeft: '4px' }}>
                {(player as any).stability || 0}%
              </span>
            </div>
            <div>
              <strong>Qi Progress:</strong> {player.currentQi} / {minorStageInfo?.qiRequired || 0}
            </div>
            <div>
              <strong>Dao Heart:</strong> {player.daoHeart || 0}
            </div>
          </div>

          {/* Progress Bar */}
          <div style={{ marginTop: '12px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '4px',
              height: '8px',
              overflow: 'hidden'
            }}>
              <div style={{
                background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                height: '100%',
                width: `${getStageProgress()}%`,
                transition: 'width 0.3s ease'
              }} />
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              Stage Progress: {getStageProgress().toFixed(1)}%
            </div>
          </div>
        </div>

        {/* Insight Points and Requirements */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(147,51,234,0.1)', borderRadius: '8px' }}>
          <h3 style={{ color: '#a855f7', marginTop: 0 }}>🔮 Cultivation Insights</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <strong>Insight Points:</strong>
              <span style={{ color: '#a855f7', marginLeft: '4px' }}>
                {(player as any).insightPoints || 0}
              </span>
            </div>
            <div>
              <strong>Next Realm Cost:</strong>
              <span style={{ color: canAdvanceRealm(player as any) ? '#10b981' : '#ef4444', marginLeft: '4px' }}>
                {costForNextRealm(getPlayerRealmId(player) || 1)}
              </span>
            </div>
          </div>

          {/* Breakthrough Requirements */}
          {realmKey && minorStageInfo && (
            <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                <strong>Breakthrough Requirements:</strong>
              </div>
              {(() => {
                const attempt = generateBreakthroughAttempt(
                  realmKey,
                  player.minorStage || 1,
                  (player.minorStage || 1) + 1
                );
                return (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    <div>Qi Required: {attempt.qiRequired}</div>
                    <div>Success Chance: {(attempt.successChance * 100).toFixed(1)}%</div>
                  </div>
                );
              })()}
            </div>
          )}

          {!canAdvanceRealm(player as any) && (
            <div style={{ marginTop: '8px', padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', border: '1px solid #ef4444' }}>
              <div style={{ fontSize: '12px', color: '#ef4444' }}>
                ⚠️ Insufficient insight points for realm advancement. Seek mentorship or enlightenment opportunities.
              </div>
            </div>
          )}
        </div>

        {/* Tribulation Pattern Preview */}
        {patternPreview && (
          <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }}>
            <h3 style={{ color: '#ef4444', marginTop: 0 }}>⚡ Upcoming Tribulation</h3>
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }}>
                {patternPreview.name}
              </div>
              <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Pattern ID: {patternPreview.id} | Minimum Realm Difficulty: {patternPreview.realmMinDifficulty}
              </div>
            </div>

            {/* Wave Preview */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>
                Tribulation Waves:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {patternPreview.waves.slice(0, 2).map((wave, index) => (
                  <div key={index} style={{
                    padding: '8px',
                    background: 'rgba(0,0,0,0.2)',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}>
                    <div style={{ fontWeight: 'bold', color: '#ef4444' }}>
                      Wave {index + 1}: {wave.element} (Intensity: {wave.intensity})
                    </div>
                    <div style={{ color: 'var(--text-muted)', marginTop: '2px' }}>
                      {wave.count} strikes
                    </div>
                  </div>
                ))}
                {patternPreview.waves.length > 2 && (
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                    ...and {patternPreview.waves.length - 2} more waves
                  </div>
                )}
              </div>
            </div>

            {/* Curse Preview */}
            {patternPreview.curses && patternPreview.curses.length > 0 && (
              <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }}>
                  Potential Curses:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {patternPreview.curses.slice(0, 3).map((curse, index) => (
                    <SmallChip key={index} style={{ borderRadius: 12, fontSize: '11px', background: 'rgba(239,68,68,0.2)', color: '#ef4444' }}>{curse.name || curse.id}</SmallChip>
                  ))}
                  {patternPreview.curses.length > 3 && (
                    <SmallChip style={{ borderRadius: 12, fontSize: '11px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }}>{`+${patternPreview.curses.length - 3} more`}</SmallChip>
                  )}
                </div>
              </div>
            )}

            {/* Difficulty Warning */}
            <div style={{ padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)' }}>
              <strong>Difficulty:</strong> {realmDifficulty >= 20 ? 'Extreme' : realmDifficulty >= 15 ? 'Very Hard' : realmDifficulty >= 10 ? 'Hard' : 'Moderate'}
              <br />
              <strong>Preparation:</strong> Strengthen your foundation and seek protective treasures before attempting breakthrough.
            </div>
          </div>
        )}

        {/* Cultivation schedule moved to main interface */}

        {/* Breakthrough Options */}
        <div style={{ marginBottom: '20px' }}>
          {/* Consolidation summary: shows how long player has consolidated and estimated penalty when attempting immediately */}
          <div style={{ marginBottom: '12px', padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 700 }}>Consolidation</div>
              <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>Threshold: {consolidationThreshold} ticks</div>
            </div>
            <div style={{ marginTop: 8, fontSize: '0.95rem' }}>
              <div>Ticks spent consolidating: <strong>{getTicksSpent()}</strong></div>
              <div>Consolidation factor: <strong>{(getConsolidationFactor() * 100).toFixed(0)}%</strong></div>
              <div style={{ marginTop: 6, color: getEstimatedPenalty() > 0 ? '#f97316' : '#10b981' }}>
                Estimated Dao Heart penalty if you attempt now: <strong>{getEstimatedPenalty()}</strong>
              </div>
            </div>
            <div style={{ marginTop: 10, fontSize: '0.85rem', color: 'var(--muted)' }}>
              Tip: Waiting increases consolidation and reduces penalties. Seclusion grants extra consolidation time.
            </div>
          </div>
          <RichTooltip content={!hasManual && !isCultivating ? 'You need a cultivation manual to cultivate. Find one via Work or Explore.' : undefined}>
            <button
              onClick={handleBreakthrough}
              disabled={
                !minorStageInfo ||
                (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage) ||
                (!hasManual && !isCultivating)
              }
              
              style={{
                width: '100%',
                padding: '12px',
                background: (player.minorStage || 1) >= (minorStageInfo?.maxStage || 1) ? 'var(--accent)' : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                opacity: (!minorStageInfo || (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage) || (!hasManual && !isCultivating)) ? 0.5 : 1,
                fontWeight: 'bold'
              }}
            >
              {(player.minorStage || 1) >= (minorStageInfo?.maxStage || 1) 
                ? `Breakthrough to ${nextRealm?.name || 'Next Realm'}` 
                : `Advance to Stage ${(player.minorStage || 1) + 1}`}
            </button>
          </RichTooltip>
        </div>

        {/* Next Realm Preview */}
        {nextRealm && (
          <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px' }}>
            <h4 style={{ color: 'var(--accent)', marginTop: 0, marginBottom: '8px' }}>
              Next Realm: {nextRealm.name}
            </h4>
            <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {nextRealm.description}
            </div>
          </div>
        )}



        {/* Cultivation Tips */}
        <div style={{ marginTop: '20px', padding: '12px', background: 'rgba(212,175,55,0.1)', borderRadius: '6px' }}>
          <h4 style={{ color: 'var(--primary)', marginTop: 0 }}>💡 Cultivation Tips</h4>
          <ul style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px' }}>
            <li>Allocate days per year to cultivation using the slider above</li>
            <li>More allocated days = more Qi gain, but fewer days for other activities</li>
            <li>Cultivation happens automatically each day based on your allocation</li>
            <li>Complete all minor stages before attempting realm breakthrough</li>
            <li>Each realm unlocks new abilities and increases your power</li>
            <li>Cannot allocate more days than your remaining lifespan</li>
          </ul>
        </div>
      </div>
    </div>
  );
};