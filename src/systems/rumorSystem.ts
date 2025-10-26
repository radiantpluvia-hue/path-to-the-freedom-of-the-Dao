import { worldState } from './worldState';
import { randInt, roll } from '../utils/rng';

export type Rumor = {
  id: string;
  source?: string;
  content: string;
  truthiness: number; // 0-1
  expiry?: number; // epoch ms
  postedAt: number;
};

export const rumorSystem = {
  postRumor(r: { id?: string; source?: string; content: string; truthiness?: number; expiryMs?: number }) {
  const now = Date.now();
  const rum: Rumor = { id: r.id || 'r_' + randInt(0x100000).toString(36).slice(0,9), source: r.source || 'unknown', content: r.content, truthiness: typeof r.truthiness === 'number' ? r.truthiness : 0.5, expiry: r.expiryMs, postedAt: now };
  worldState.pushEvent({ id: 'rumor_'+rum.id, type: 'rumorPosted', payload: { rumor: rum } });
  worldState.pushEvent({ id: 'rumor_log_'+randInt(0x100000).toString(36).slice(0,6), type: 'rumorLog', payload: { rumorId: rum.id } });
    // store in worldState.rumors as well
    worldState.postRumor({ id: rum.id, content: rum.content, truthiness: rum.truthiness, expiry: rum.expiry });
    return rum;
  },
  getRumors(filter?: { minTruthiness?: number; activeOnly?: boolean }) {
    const all = worldState.getRumors();
    const now = Date.now();
    return all.filter((r: { id: string; content: string; truthiness: number; expiry?: number }) => {
      if (filter && typeof filter.minTruthiness === 'number' && r.truthiness < filter.minTruthiness) return false;
      if (filter && filter.activeOnly && r.expiry && r.expiry < now) return false;
      return true;
    });
  },
  expireRumors() {
    const now = Date.now();
    const current = worldState.getRumors();
    const active = current.filter((r: { id: string; content: string; truthiness: number; expiry?: number }) => !(r.expiry && r.expiry < now));
    // Overwrite the rumor list via mutation
    worldState.applyMutation(s => { s.rumors = active; });
    return active;
  },
  generateRumorFromEvent(eventData: { instanceId?: string; templateId?: string; choiceId?: string; title?: string }) {
    // Simple rumor generation logic: content derived from title + embellishment
  const truthiness = Math.max(0.1, roll() * 0.9);
    const content = eventData.title ? `${eventData.title} has been reported nearby.` : `Strange happenings observed.`;
    const rum = this.postRumor({ source: 'event', content, truthiness, expiryMs: Date.now() + 1000 * 60 * 60 * 24 * 7 });
    return rum;
  }
};
