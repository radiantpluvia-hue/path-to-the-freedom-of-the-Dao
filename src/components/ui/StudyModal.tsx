import React from 'react';
import { useGameStore } from '../../store/useGameStore';
import TierBadge from './TierBadge';

interface Props {
  open: boolean;
  sutra: any | null;
  onClose: () => void;
}

export default function StudyModal({ open, sutra, onClose }: Props) {
  const store = useGameStore.getState();
  const getPlayer = () => store.player;

  if (!open || !sutra) return null;

  const player = getPlayer();
  // Simple cost mapping: require yuan or spiritStones.low depending on tier
  const costYuan = Math.max(0, Math.floor((sutra.tier || 1) / 2));
  const costQi = (sutra.cost?.qi) || 0;

  const canAfford = (player.yuan || 0) >= costYuan && (player.currentQi || 0) >= costQi;

  function confirmStudy() {
    if (!canAfford) return;
    const s = useGameStore.getState();
    if (typeof s.attemptStudy === 'function') {
      const ok = s.attemptStudy(sutra.id);
      if (ok) {
        onClose();
      }
    }
  }

  return (
    <div className="modal-backdrop" data-testid="study-modal">
      <div className="modal">
        <h3 className="xui-title">Study: {sutra.name}</h3>
        <div className="xui-muted">{sutra.description}</div>
        <div className="modal-body">
          <div className="xui-muted">Tier: <TierBadge tier={sutra.tier} small={true} /> &nbsp; • &nbsp; AP: {sutra.cost?.ap || 0} • QI: {sutra.cost?.qi || 0}</div>
          <div className="xui-note">Study Cost: <strong>{costYuan}</strong> yuan and <strong>{costQi}</strong> QI</div>
        </div>
        <div className="modal-actions">
          <button type="button" className="xbtn" onClick={onClose}>Cancel</button>
          <button type="button" className="xbtn" onClick={confirmStudy} disabled={!canAfford} data-testid="confirm-study">{canAfford ? 'Confirm Study' : 'Insufficient Resources'}</button>
        </div>
      </div>
    </div>
  );
}
