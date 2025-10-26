import { useState, useEffect } from 'react';
import TierBadge from '@/components/ui/TierBadge';
import { RACE_BACKGROUNDS } from '@/data/raceBackgrounds';
import { useGameStore } from '@/store/useGameStore';
import { Background } from '@/types';
import { runtimeRng } from '@/utils/seededRng';
import Icon from '@/components/ui/Icon';
import SmallChip from '@/components/ui/SmallChip';
import LifeNovelModal from '@/components/ui/LifeNovelModal';
import ConfirmModal from '@/components/ui/ConfirmModal';
import { useState as useLocalState } from 'react';
import { getPassive, ensureGeneratedPassives } from '@/systems/passiveRegistry';
import RichTooltip from '@/components/ui/RichTooltip';

export function CharacterCreation() {
  const { startGame, lifePhaseSystem, systems, saveGame, loadGame } = useGameStore();
  const saveInProgress = useGameStore(s => s.ui?.saveInProgress ?? false);
  const [novelOpen, setNovelOpen] = useLocalState(false);
  const [confirmOpen, setConfirmOpen] = useLocalState(false);
  // Novel preview from LifePhase runtime (if available) or snapshot
  const novelPreview = (() => {
    try {
      if (lifePhaseSystem && typeof lifePhaseSystem.renderNovel === 'function') {
        return (lifePhaseSystem.renderNovel() || '').split('\n').slice(0, 3).join('\n');
      }
  const snap = (systems as any)?.lifePhase;
      if (snap) {
        // Minimal rendering: show currentPhase title + first events lines
        const lines: string[] = [];
        if (snap.currentPhase && snap.currentPhase.title) lines.push(`--- ${snap.currentPhase.title} ---`);
        const evs = (snap.currentPhase && snap.currentPhase.events) || [];
        for (let i = 0; i < Math.min(3, evs.length); i++) {
          const e = evs[i];
          lines.push(`${e.title || e.id}: ${e.description || ''}`);
        }
        return lines.join('\n');
      }
    } catch (e) {
      // ignore
    }
    return '';
  })();
  const [name, setName] = useState('');
  const [selectedGender, setSelectedGender] = useState<'Male' | 'Female'>('Male');

  // Randomly pick a race on mount
  const [race] = useState(() => {
    const races = Object.keys(RACE_BACKGROUNDS);
    return races[Math.floor(runtimeRng() * races.length)];
  });

  const visibleBackgrounds = RACE_BACKGROUNDS[race] || [];

  // Ensure generated passives are registered so getPassive resolves names/descriptions
  useEffect(() => { try { ensureGeneratedPassives(); } catch (e) { /* ignore */ } }, []);

  // Default selected background (random from visible ones)
    const [selectedBackground, _setSelectedBackground] = useState<Background | null>(() => {
    return visibleBackgrounds.length > 0
      ? visibleBackgrounds[Math.floor(runtimeRng() * visibleBackgrounds.length)]
      : null;
  });

    // intentionally unused setter (UI-only preview); reference to silence lint
    void _setSelectedBackground;

  // Dev toggle to reveal raw configured weights
  const [showRawWeights, setShowRawWeights] = useState(false);

  // Very small demo picks for talent/physique/bloodline as before; these are opaque to the UI for now
  const [talent] = useState(() => 'average');
  const [physique] = useState(() => null as any);
  const [bloodline] = useState(() => null as any);

  const handleCreateCharacter = () => {
    startGame({
      name,
      gender: selectedGender,
      talent,
      physique,
      bloodline,
      selectedBackground: selectedBackground ?? undefined,
      race
    } as any);
  };

  const formatStartChance = (b: Background) => {
    const sc = (b as any).startChance;
    if (typeof sc === 'number') return (sc * 100).toFixed(2) + '%';
    return 'default';
  };

  // Compute normalized probabilities for display: if any background has startChance, use those weights;
  // otherwise show uniform probabilities.
  const computedProbabilities = (() => {
    if (!visibleBackgrounds || visibleBackgrounds.length === 0) return {} as Record<string, number>;
    const weights = visibleBackgrounds.map((b) => (typeof (b as any).startChance === 'number' ? (b as any).startChance as number : 0));
    const anyWeights = weights.some((w) => w > 0);
    if (!anyWeights) {
      const uniform = 1 / visibleBackgrounds.length;
      return visibleBackgrounds.reduce((acc, b) => ({ ...acc, [b.id]: uniform }), {} as Record<string, number>);
    }
    const total = weights.reduce((s, w) => s + w, 0);
    return visibleBackgrounds.reduce((acc, b, idx) => ({ ...acc, [b.id]: total > 0 ? weights[idx] / total : 0 }), {} as Record<string, number>);
  })();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, var(--dark), var(--darker))',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px'
    }}>
      <div style={{ width: '720px', maxWidth: '95%', color: 'var(--text-primary)' }}>
        <h2 style={{ marginBottom: '12px' }}>Character Creation</h2>

        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '6px' }}>Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-light)' }}
          />
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Gender:</label>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="button"
              onClick={() => setSelectedGender('Male')}
              style={{
                flex: 1,
                padding: '12px',
                color: '#fff',
                border: selectedGender === 'Male' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                borderRadius: '8px',
                background: selectedGender === 'Male' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.12)',
                cursor: 'pointer'
              }}
            >
              ♂️ Male
            </button>
            <button
              type="button"
              onClick={() => setSelectedGender('Female')}
              style={{
                flex: 1,
                padding: '12px',
                color: '#fff',
                border: selectedGender === 'Female' ? '2px solid var(--primary)' : '1px solid var(--border-light)',
                borderRadius: '8px',
                background: selectedGender === 'Female' ? 'rgba(212, 175, 55, 0.08)' : 'rgba(0, 0, 0, 0.12)',
                cursor: 'pointer'
              }}
            >
              ♀️ Female
            </button>
          </div>
        </div>

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Available Backgrounds ({race}):</label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '6px' }}>
            <input type="checkbox" checked={showRawWeights} onChange={(e) => setShowRawWeights(e.target.checked)} />
            <span style={{ color: 'var(--muted)' }}>Show raw weights</span>
          </label>
          <div style={{ display: 'grid', gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '8px', border: '1px solid var(--border-light)', borderRadius: '6px' }}>
              {visibleBackgrounds.map((b) => (
              <RichTooltip key={b.id} content={(() => {
                try {
                  const passives = ((b as any).effects && (b as any).effects.passives) || {};
                  const ids = Object.keys(passives || {});
                  const baseDesc = String(b.description || '');
                  if (ids.length === 0) return baseDesc;
                  const parts = ids.map((pid) => {
                    try {
                      const def: any = getPassive(pid) || {};
                      const name = def.name || pid;
                      const desc = def.description || '';
                      return `• ${name}: ${desc}`;
                    } catch (e) {
                      return `• ${pid}`;
                    }
                  });
                  return `${baseDesc}\n\nPassives:\n${parts.join('\n')}`;
                } catch (e) { return String(b.description || ''); }
              })()}>
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '10px',
                  background: selectedBackground?.id === b.id ? 'rgba(212,175,55,0.08)' : 'rgba(0,0,0,0.06)',
                  borderRadius: '6px',
                  cursor: 'default',
                  border: selectedBackground?.id === b.id ? '1px solid var(--primary)' : '1px solid transparent'
                }}
              >
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 8, background: 'rgba(255,255,255,0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Icon id={(b as any).previewIcon} size={40} alt={`${b.name} icon`} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{b.name}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>{b.description}</div>
                  </div>
                </div>
                  <div style={{ textAlign: 'right', minWidth: '160px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                  <div style={{ fontWeight: 700 }}><TierBadge tier={b.rarity} small={true} /></div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--muted)' }}>startChance: {formatStartChance(b)}</div>
                  <div style={{ width: '140px', height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }} data-testid={`prob-bar-shell-${b.id}`}>
                    <div data-testid={`prob-bar-${b.id}`} style={{ width: `${Math.round((computedProbabilities[b.id] || 0) * 100)}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary), var(--accent))' }} />
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }} data-testid={`prob-percent-${b.id}`}>{Math.round((computedProbabilities[b.id] || 0) * 10000) / 100}%</div>
                  {showRawWeights && (
                    <div data-testid={`raw-weight-${b.id}`} style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>weight: {typeof (b as any).startChance === 'number' ? (b as any).startChance : 'uniform'}</div>
                  )}
                </div>
              </div>
              </RichTooltip>
            ))}
            {visibleBackgrounds.length === 0 && (
              <div style={{ padding: '8px', color: 'var(--muted)' }}>No backgrounds available for this race.</div>
            )}
          </div>
        </div>

        {novelPreview && (
          <div style={{ marginBottom: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', color: 'var(--muted)', fontSize: '0.95rem', whiteSpace: 'pre-wrap' }}>
            {novelPreview}
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '12px' }}>
          <button onClick={() => setNovelOpen(true)} type="button" style={{ background: 'transparent', color: 'var(--primary)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: 6, cursor: 'pointer' }}>
            View Full Novel
          </button>
          {/* Save/Load controls requested on first screen */}
          <button
            onClick={() => { try { saveGame(); } catch (e) { /* ignore */ } }}
            type="button"
            disabled={saveInProgress}
            aria-disabled={saveInProgress}
            style={{ background: 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: 6, cursor: saveInProgress ? 'not-allowed' : 'pointer', position: 'relative' }}
          >
            💾 Save Game
            {saveInProgress && (
              <div style={{ position: 'absolute', top: '-26px', right: 0 }}>
                <SmallChip style={{ marginLeft: 8, fontSize: '0.85rem', color: 'var(--muted)', background: 'rgba(0,0,0,0.6)', borderRadius: 6 }}>Saving…</SmallChip>
              </div>
            )}
          </button>
          <button
            onClick={() => { setConfirmOpen(true); }}
            type="button"
            disabled={saveInProgress}
            aria-disabled={saveInProgress}
            style={{ background: saveInProgress ? 'rgba(255,255,255,0.03)' : 'transparent', color: saveInProgress ? 'var(--muted)' : 'var(--primary)', border: '1px solid var(--border-light)', padding: '8px 12px', borderRadius: 6, cursor: saveInProgress ? 'not-allowed' : 'pointer' }}
          >
            📁 Load Game
          </button>
          <ConfirmModal
            open={confirmOpen}
            title="Load saved game?"
            message="Loading will overwrite your current progress. Are you sure you want to load the most recent save?"
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => { setConfirmOpen(false); try { loadGame(); } catch (e) { /* ignore */ } }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleCreateCharacter}
            disabled={!name}
            style={{
              background: !name ? 'var(--muted)' : 'linear-gradient(135deg, var(--primary), var(--accent))',
              color: 'var(--dark)',
              border: '2px solid var(--primary)',
              borderRadius: '8px',
              padding: '12px 28px',
              fontSize: '1.05rem',
              fontWeight: 600,
              cursor: !name ? 'not-allowed' : 'pointer',
              opacity: !name ? 0.6 : 1
            }}
          >
            Begin Your Journey
          </button>
        </div>
        <LifeNovelModal open={novelOpen} onClose={() => setNovelOpen(false)} />
      </div>
    </div>
  );
}

