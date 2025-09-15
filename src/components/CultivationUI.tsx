/* eslint-disable no-restricted-imports -- imports core systems intentionally */
import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/useGameStore';
import { BreakthroughSystem, MinorStage } from '../systems/BreakthroughSystem';
import { CULTIVATION_REALMS, REALM_ORDER } from '../data/cultivationRealms';
import { getRealmKeyFromPlayer } from '../utils/realmHelpers';

interface CultivationUIProps {
  onClose: () => void;
}

export const CultivationUI: React.FC<CultivationUIProps> = ({ onClose }) => {
  const { player, updatePlayerState, addEventLog } = useGameStore();
  const [breakthroughSystem] = useState(() => new BreakthroughSystem());

  const [minorStageInfo, setMinorStageInfo] = useState<MinorStage | null>(null);

  // Simplified cultivation state (not used yet)

  const realmKey = getRealmKeyFromPlayer(player as any);
  const currentRealm = realmKey ? CULTIVATION_REALMS[realmKey] : null;
  const nextRealm = currentRealm?.nextRealm ? CULTIVATION_REALMS[currentRealm.nextRealm] : null;

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
      // Major realm breakthrough - always succeeds if at max stage
      const nextRealm = currentRealm?.nextRealm;
      if (nextRealm) {
        updatePlayerState({
          realm: nextRealm,
          realmId: REALM_ORDER.indexOf(nextRealm) + 1,
          minorStage: 1,
          currentQi: 0
        });
        addEventLog(`Successfully broke through to ${CULTIVATION_REALMS[nextRealm]?.name || nextRealm}!`);
      } else {
        addEventLog('Already at the highest realm!');
      }
    }
  };

  const handleCultivation = () => {
    if (!realmKey || !minorStageInfo) return;

    // Simple cultivation - gain Qi over time
    const baseQiGain = 10;
    const skillBonus = Math.floor((player.skills.cultivation?.level || 0) * 2);
    const totalGain = baseQiGain + skillBonus;

    updatePlayerState({ 
      currentQi: Math.min(player.qiRequired || 999999, player.currentQi + totalGain) 
    });
    
    addEventLog(`Cultivated and gained ${totalGain} Qi`);
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
      zIndex: 1000
    }}>
      <div style={{ 
        background: 'var(--dark)', 
        border: '2px solid var(--primary)', 
        borderRadius: '12px', 
        padding: '24px', 
        maxWidth: '700px', 
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

        {/* Current Realm Info */}
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }}>
          <h3 style={{ color: 'var(--primary)', marginTop: 0 }}>
            {currentRealm?.name || 'Unknown Realm'}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
            <div>
              <strong>Stage:</strong> {player.minorStage || 1} / {minorStageInfo?.maxStage || 1}
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

        {/* Simple Cultivation */}
        <div style={{ marginBottom: '20px', padding: '12px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px' }}>
          <h4 style={{ color: 'var(--primary)', marginTop: 0 }}>🧘 Cultivation</h4>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Cultivate to gain Qi. Higher cultivation skill increases Qi gain.
          </div>
          <button
            onClick={handleCultivation}
            style={{
              padding: '12px 20px',
              background: 'var(--primary)',
              color: 'var(--dark)',
              border: 'none',
              borderRadius: 6,
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cultivate (+{10 + Math.floor((player.skills.cultivation?.level || 0) * 2)} Qi)
          </button>
        </div>

        {/* Breakthrough Options */}
        <div style={{ marginBottom: '20px' }}>
          <button
            onClick={handleBreakthrough}
            disabled={!minorStageInfo || (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage)}
            style={{
              width: '100%',
              padding: '12px',
              background: (player.minorStage || 1) >= (minorStageInfo?.maxStage || 1) ? 'var(--accent)' : 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              opacity: (!minorStageInfo || (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage)) ? 0.5 : 1,
              fontWeight: 'bold'
            }}
          >
            {(player.minorStage || 1) >= (minorStageInfo?.maxStage || 1) 
              ? `Breakthrough to ${nextRealm?.name || 'Next Realm'}` 
              : `Advance to Stage ${(player.minorStage || 1) + 1}`}
          </button>
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
            <li>Cultivate regularly to gain Qi for breakthroughs</li>
            <li>Higher cultivation skill increases Qi gain per session</li>
            <li>Complete all minor stages before attempting realm breakthrough</li>
            <li>Each realm unlocks new abilities and increases your power</li>
          </ul>
        </div>
      </div>
    </div>
  );
};