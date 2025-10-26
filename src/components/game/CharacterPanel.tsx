import React, { useEffect, useMemo } from 'react';
import { Card } from '../core/Card';
import RichTooltip from '@/components/ui/RichTooltip';
import TierBadge from '@/components/ui/TierBadge';
import SmallChip from '@/components/ui/SmallChip';
import DestinyAffinityBadge from '../ui/DestinyAffinityBadge';
import AlignmentPassivesPanel from './AlignmentPassivesPanel';
import { getPassive, ensureGeneratedPassives } from '@/systems/passiveRegistry';

type CharacterPanelProps = {
  player: any;
  setUIProperty?: (k: string, v: any) => void;
};

export const CharacterPanel: React.FC<CharacterPanelProps> = ({ player, setUIProperty }) => {
  // Proactively ensure generated passives load so names/descriptions resolve in tooltips
  useEffect(() => { try { ensureGeneratedPassives(); } catch (e) { /* ignore */ } }, []);

  const passiveIds: string[] = useMemo(() => {
    const eq = player?.equipment || {};
    const fromEquipment = Object.values(eq).flatMap((it: any) => (it && Array.isArray(it.passives)) ? it.passives : []);
    const declared = Array.isArray(player?.passiveIds) ? player.passiveIds : [];
    const all = [...declared, ...fromEquipment].filter(Boolean) as string[];
    // Avoid duplicating alignment tag passives (they are shown by AlignmentPassivesPanel)
    const filtered = all.filter(id => typeof id === 'string' && !id.startsWith('tag_'));
    return Array.from(new Set(filtered));
  }, [player?.equipment, player?.passiveIds]);

  const passiveMeta = useMemo(() => {
    return passiveIds.map((id) => {
      let def: any = null;
      try { def = getPassive(id); } catch (e) { def = null; }
      const name = (def && (def.name || def.id)) || id;
      const description = (def && def.description) || 'No description available.';
      // Try to extract tier from registered passive; fall back to canonical data JSON
      let tier: string | undefined = def && def.tier;
      if (!tier) {
        try {
          // relative path from this file to src/data/skills/all_skills.json
          // guarded so bundlers that inline generated passives won't break
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const ALL_SKILLS = require('../../data/skills/all_skills.json');
          const found = Array.isArray(ALL_SKILLS) ? ALL_SKILLS.find((s: any) => s && s.id === id) : null;
          if (found && found.tier) tier = found.tier;
        } catch (e) {
          // ignore lookup failures
        }
      }
      return { id, name, description, tier };
    });
  }, [passiveIds]);

  return (
    <Card title="Character">
      <div style={{ textAlign: 'center', marginBottom: '15px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '5px' }}>👤</div>
        <h3 style={{ color: 'var(--primary)', marginBottom: '5px' }}>{player.name || 'Cultivator'}</h3>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem' }}>
          {player.race} {player.gender} • Age {player.age}
        </div>
        <div style={{ color: 'var(--muted)', fontSize: '0.9rem', marginTop: 4 }}>
          Lifespan: {player.lifespan ?? 0}
        </div>
        {/* Time skip controls removed per spec */}
        {player.destinyAffinity !== undefined && (
          <div style={{ marginTop: 8 }}>
            <DestinyAffinityBadge value={player.destinyAffinity} history={player.destinyHistory || []} onOpenThreads={() => setUIProperty?.('showNarrative', true)} />
          </div>
        )}
      </div>
      {/* Show alignment as a separate badge so milestones like Antihero are visible */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8, gap: 8 }}>
        {player.alignment?.id ? (
          <RichTooltip content={`${player.alignment.displayName || player.alignment.id}\n${player.alignment?.axes ? `Virtue:${player.alignment.axes.virtue} Order:${player.alignment.axes.order} Independence:${player.alignment.axes.independence} Ruthlessness:${player.alignment.axes.ruthlessness}` : ''}`}>
            <SmallChip style={{ borderRadius: 12, background: 'rgba(255,255,255,0.02)', color: 'var(--primary)', fontWeight: 600, fontSize: 12 }}>{player.alignment.displayName || player.alignment.id}</SmallChip>
          </RichTooltip>
        ) : (
          <div style={{ color: 'var(--muted)', fontSize: 12 }}>Alignment: Neutral</div>
        )}
      </div>
      <AlignmentPassivesPanel player={player} />

      <div style={{ marginTop: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>Passives</h4>
          <span style={{ color: 'var(--muted)', fontSize: 12 }}>hover to view details</span>
        </div>
        {passiveMeta.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>No active passives</div>
        ) : (
          <div style={{ marginTop: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {passiveMeta.map(p => (
              <RichTooltip key={p.id} content={(
                <div style={{ display: 'grid', gap: 6, maxWidth: 320 }}>
                  {p.tier ? <div style={{ fontWeight: 700 }}>Tier: <TierBadge tier={p.tier} /></div> : null}
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>{p.description}</div>
                </div>
              )}>
                <SmallChip style={{ display: 'inline-flex', alignItems: 'center', gap: 6, borderRadius: 12, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)', fontSize: 12, color: 'var(--text-primary)' }}>
                  <span style={{ opacity: 0.8 }}>♦</span>
                  <span>{p.name}</span>
                  {p.tier ? (
                    <TierBadge tier={p.tier} small={true} />
                  ) : null}
                </SmallChip>
              </RichTooltip>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default CharacterPanel;
