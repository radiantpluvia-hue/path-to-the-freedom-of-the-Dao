/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import React, { useMemo, useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { evaluateObjectives, type Objective } from '@/events/storyEvents';
import { Card } from './core/Card';
import { Progress } from './core/Progress';
import SmallChip from './ui/SmallChip';

function QuestItem({ quest }: { quest: any }) {
  const store = useGameStore();
  const [open, setOpen] = useState(false);

  const gameState = useMemo(() => (({
    player: store.player,
    world: store.world,
    story: store.story,
    ui: store.ui,
    systems: store.systems
  }) as any), [store.player, store.world, store.story, store.ui, store.systems]);

  const objectives: Objective[] = Array.isArray(quest?.objectives) ? (quest.objectives as any) : [];
  const { allCompleted: _allCompleted, results } = useMemo(() => evaluateObjectives(gameState, objectives), [gameState, objectives]);
  void _allCompleted;

  const progress = useMemo(() => {
    if (!objectives.length) return quest?.status === 'completed' ? 100 : 0;
    const completedCount = objectives.filter(o => results[o.id]?.isCompleted).length;
    return Math.floor((completedCount / objectives.length) * 100);
  }, [objectives, results, quest?.status]);

  const shortDesc = String(quest?.description || '');

  return (
    <div style={{ padding: 10, border: '1px solid var(--border)', borderRadius: 6, background: 'rgba(255,255,255,0.04)' }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'baseline' }}>
            <strong style={{ color: 'var(--primary)' }}>{quest?.title}</strong>
            {quest?.status && (
              <SmallChip style={{ fontSize: 12, color: 'var(--muted)' }}>{quest.status}</SmallChip>
            )}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {shortDesc.length > 120 ? (
              <>
                {open ? shortDesc : `${shortDesc.slice(0, 120)}…`}
                <button type="button" onClick={() => setOpen(!open)} style={{ marginLeft: 8, fontSize: 12, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}>
                  <SmallChip>{open ? 'Less' : 'More'}</SmallChip>
                </button>
              </>
            ) : shortDesc}
          </div>
        </div>
        <div style={{ width: 120 }}>
          <Progress value={progress} max={100} />
          <div style={{ textAlign: 'right', fontSize: 12, color: 'var(--muted)' }}>{progress}%</div>
        </div>
      </div>

      {objectives.length > 0 && (
        <div style={{ marginTop: 8, display: 'grid', gap: 6 }}>
          {objectives.map((obj) => {
            const r = results[obj.id] || { progress: 0, isCompleted: false };
            return (
              <div key={obj.id} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{obj.description || obj.type}</div>
                </div>
                <div style={{ width: 100 }}>
                  <Progress value={Math.floor((r.progress || 0) * 100)} max={100} />
                </div>
                <div style={{ width: 70, textAlign: 'right', fontSize: 12, color: r.isCompleted ? 'var(--success)' : 'var(--muted)' }}>
                  {r.isCompleted ? 'Done' : `${Math.floor((r.progress || 0) * 100)}%`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function QuestPanels() {
  const store = useGameStore();
  const gameState = useMemo(() => (({
    player: store.player,
    world: store.world,
    story: store.story,
    ui: store.ui,
    systems: store.systems
  }) as any), [store.player, store.world, store.story, store.ui, store.systems]);

  const currentAct = useMemo(() => {
    try {
      if (store.storySystem && typeof (store.storySystem as any).getCurrentAct === 'function') {
        return (store.storySystem as any).getCurrentAct(gameState as any);
      }
    } catch (e) {
      // non-fatal: fall through
    }
    return null;
  }, [store.storySystem, gameState]);

  const mainQuests = useMemo(() => Array.isArray(currentAct?.mainQuests) ? currentAct!.mainQuests : [], [currentAct]);
  const sideQuests = useMemo(() => Array.isArray(currentAct?.sideQuests) ? currentAct!.sideQuests : [], [currentAct]);

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Card title="Main Quests">
        {mainQuests.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No main quests.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {mainQuests.map((q: any) => (
              <QuestItem key={q?.id} quest={q} />
            ))}
          </div>
        )}
      </Card>

      <Card title="Side Quests">
        {sideQuests.length === 0 ? (
          <div style={{ color: 'var(--muted)', fontSize: 13 }}>No side quests.</div>
        ) : (
          <div style={{ display: 'grid', gap: 8 }}>
            {sideQuests.map((q: any) => (
              <QuestItem key={q?.id} quest={q} />
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default QuestPanels;
