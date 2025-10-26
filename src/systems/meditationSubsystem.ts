// Simple MeditationSubsystem for Task B

export type MeditationType = {
  id: string;
  name: string;
  description?: string;
  baseXpRate: number; // XP per second
  stability: number; // 0-1 chance to resist interruption
  specialOutcomes?: string[];
};

export type MeditationSession = {
  sessionId: string;
  meditationId: string;
  startTime: number;
  chosenType?: MeditationType;
  modifiers?: Record<string, number>;
  currentProgress: number; // XP accumulated
  pendingEvents: any[];
};

export type MeditationResult = {
  sessionId: string;
  meditationId: string;
  success: boolean;
  progressGained: number;
  special?: string | null;
};

export const MEDITATION_TEMPLATES: Record<string, MeditationType> = {
  quiet_cultivation: {
    id: 'quiet_cultivation',
    name: 'Quiet Cultivation',
    baseXpRate: 1.0,
    stability: 0.95,
    specialOutcomes: ['calm_insight']
  },
  heart_demon_confrontation: {
    id: 'heart_demon_confrontation',
    name: 'Heart Demon Confrontation',
    baseXpRate: 2.5,
    stability: 0.6,
    specialOutcomes: ['demon_mark']
  },
  comprehend_dao: {
    id: 'comprehend_dao',
    name: 'Comprehend Dao',
    baseXpRate: 0.7,
    stability: 0.9,
    specialOutcomes: ['dao_insight']
  }
};

import { roll } from '../utils/rng';

export const meditationSubsystem = {
  getTemplate(id: string) {
    return MEDITATION_TEMPLATES[id] || null;
  },
  startSession(sessionId: string, meditationId: string, opts?: { modifiers?: Record<string, number> }) {
    const t = this.getTemplate(meditationId);
    const sess: MeditationSession = {
      sessionId,
      meditationId,
      startTime: Date.now(),
      chosenType: t || undefined,
      modifiers: opts?.modifiers || {},
      currentProgress: 0,
      pendingEvents: []
    };
    return sess;
  },
  tickSession(session: MeditationSession, dtSeconds: number) {
    if (!session.chosenType) return { progress: 0, events: [] };
    const rate = session.chosenType.baseXpRate;
    const modifier = session.modifiers && session.modifiers.xpMultiplier ? session.modifiers.xpMultiplier : 1;
    const progress = rate * dtSeconds * modifier;
    session.currentProgress += progress;
    // roll for special outcome (very small chance per tick)
    const events: any[] = [];
    if (session.chosenType.specialOutcomes && roll() < (1 - session.chosenType.stability) * 0.02) {
      events.push({ type: 'specialOutcome', outcome: session.chosenType.specialOutcomes[0] });
    }
    return { progress, events };
  },
  endSession(session: MeditationSession, _reason: string) : MeditationResult {
    const gained = session.currentProgress;
    const special = session.pendingEvents.length > 0 ? session.pendingEvents[0] : null;
    return { sessionId: session.sessionId, meditationId: session.meditationId, success: true, progressGained: gained, special };
  }
};
