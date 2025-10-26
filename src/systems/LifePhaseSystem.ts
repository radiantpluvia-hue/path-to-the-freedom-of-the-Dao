import { LifePhase, LifeEvent, LifePhaseState, PhaseType } from '../types';
import { renderTemplate, templateForEvent } from './narrativeTemplates';

// Minimal LifePhaseSystem to manage life phases and chronicle entries.
export default class LifePhaseSystem {
  private state: LifePhaseState;
  private tickProvider: () => number;
  private onPhaseStartCallbacks: Array<(phase: any) => void> = [];
  private onPhaseEndCallbacks: Array<(phase: any) => void> = [];

  constructor(initial?: Partial<LifePhaseState>, tickProvider?: () => number) {
    this.tickProvider = tickProvider || (() => Date.now());
    this.state = {
      currentPhase: null,
      pastPhases: [],
      reincarnationCount: 0,
      ancestors: [],
      ...initial
    } as LifePhaseState;
  }

  startPhase(type: PhaseType, title?: string, karmicModifiers?: Record<string, number>): LifePhase {
    const id = `life-${(this.state.pastPhases.length + (this.state.currentPhase ? 1 : 0) + 1)}`;
    const phase: LifePhase = {
      id,
      type,
      startedAtTick: this.tickProvider(),
      events: [],
      title: title || `${type} of ${id}`,
      karmicModifiers
    };
    if (this.state.currentPhase) {
      // archive current
      this.endPhase();
    }
    this.state.currentPhase = phase;
    // notify listeners
    try {
      this.onPhaseStartCallbacks.forEach(cb => { try { cb(phase); } catch (e) { void e; } });
    } catch (e) { void e; }
    return phase;
  }

  endPhase(): LifePhase | null {
    const cp = this.state.currentPhase;
    if (!cp) return null;
    cp.endedAtTick = this.tickProvider();
    this.state.pastPhases.push(cp);
    this.state.currentPhase = null;
    if (cp.type === 'ReincarnationCycle') {
      this.state.reincarnationCount = (this.state.reincarnationCount || 0) + 1;
    }
    // notify listeners
    try {
      this.onPhaseEndCallbacks.forEach(cb => { try { cb(cp); } catch (e) { void e; } });
    } catch (e) { void e; }
    return cp;
  }

  // Listener registration
  addPhaseStartListener(cb: (phase: any) => void) {
    if (typeof cb === 'function') this.onPhaseStartCallbacks.push(cb);
  }
  addPhaseEndListener(cb: (phase: any) => void) {
    if (typeof cb === 'function') this.onPhaseEndCallbacks.push(cb);
  }

  recordEvent(e: LifeEvent) {
    if (this.state.currentPhase) {
      this.state.currentPhase.events.push({ ...e, tick: e.tick || this.tickProvider() });
    } else {
      // If no current phase, create a Mortal Life and attach
      this.startPhase('Mortal');
      this.recordEvent(e);
    }
  }

  getChronicle(): LifeEvent[] {
    const accum: LifeEvent[] = [];
    for (const p of this.state.pastPhases) accum.push(...(p.events || []));
    if (this.state.currentPhase) accum.push(...this.state.currentPhase.events);
    return accum;
  }

  getState(): LifePhaseState {
    return this.state;
  }

  loadState(s: Partial<LifePhaseState>) {
    this.state = {
      currentPhase: s.currentPhase || null,
      pastPhases: s.pastPhases || [],
      reincarnationCount: s.reincarnationCount || 0,
      ancestors: s.ancestors || []
    } as LifePhaseState;
  }

  // Very small helper to produce a readable novel text for a given life or all lives
  renderNovel(): string {
    const lines: string[] = [];
    const appendPhase = (p: LifePhase) => {
      lines.push(`--- ${p.title || p.id} (${p.type}) ---`);
      for (const ev of p.events || []) {
        const when = ev.tick || '';
        // If event provides a templateId or matches TEMPLATES, render it
        const templateId = (ev as any).templateId || ev.id;
        const tpl = templateForEvent(templateId, 'generic_event');
        if (tpl) {
          const ctx = {
            ...p.karmicModifiers,
            ...ev.context,
            title: ev.title || ev.id,
            description: ev.description || '',
            playerName: (ev.context && ev.context.playerName) || 'The Protagonist',
            region: (ev.context && ev.context.region) || 'unknown lands'
          };
          const rendered = renderTemplate(tpl, ctx);
          lines.push(`${rendered} ${when}`);
        } else {
          lines.push(`${ev.title || ev.id}: ${ev.description || ''} ${when}`);
        }
      }
    };
    for (const p of this.state.pastPhases) appendPhase(p);
    if (this.state.currentPhase) appendPhase(this.state.currentPhase);
    return lines.join('\n');
  }
}
