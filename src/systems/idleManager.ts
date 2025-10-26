import { meditationSubsystem, MeditationSession } from './meditationSubsystem';

type IdleOptions = { modifiers?: Record<string, number>; interruptionsAllowed?: boolean };

export type IdleManagerSession = MeditationSession & {
  lastTickAt: number;
  interrupted?: boolean;
};

const sessions: Record<string, IdleManagerSession> = {};

function makeId() { return 's_' + Math.random().toString(36).slice(2, 9); }

export const idleManager = {
  startMeditation(meditationId: string, opts?: IdleOptions) {
    const sessionId = makeId();
    const sessBase = meditationSubsystem.startSession(sessionId, meditationId, { modifiers: opts?.modifiers });
    const sess: IdleManagerSession = { ...sessBase, lastTickAt: Date.now(), interrupted: false };
    sessions[sessionId] = sess;
    return sessionId;
  },
  stopMeditation(sessionId: string, reason = 'manual') {
    const s = sessions[sessionId];
    if (!s) return null;
    const result = meditationSubsystem.endSession(s, reason);
    delete sessions[sessionId];
    return result;
  },
  getSession(sessionId: string) {
    return sessions[sessionId] ? { ...sessions[sessionId] } : null;
  },
  listSessions() {
    return Object.keys(sessions);
  },
  // tick called with dtSeconds to advance all sessions; in production this can be run every 1s
  tick(dtSeconds: number) {
    const results: Array<{ sessionId: string; progress: number; events: any[] }> = [];
    for (const id of Object.keys(sessions)) {
      const s = sessions[id];
      // check interrupts via a safe hook into EventManager; fall back to no interrupts
      let interrupted = false;
      try {
        const maybeEventManager: any = (globalThis as any).game && (globalThis as any).game.eventManager;
        if (maybeEventManager && typeof maybeEventManager.checkInterrupts === 'function') {
          const interrupt = maybeEventManager.checkInterrupts(s);
          if (interrupt) { interrupted = true; s.interrupted = true; }
        }
      } catch (e) { /* ignore */ }

      if (interrupted) {
        // mark and skip progress for this simple skeleton
        results.push({ sessionId: id, progress: 0, events: [{ type: 'interruption' }] });
        continue;
      }

      const res = meditationSubsystem.tickSession(s, dtSeconds);
      if (res.events && res.events.length) s.pendingEvents.push(...res.events);
      s.lastTickAt = Date.now();
      results.push({ sessionId: id, progress: res.progress, events: res.events });
    }
    return results;
  }
};

// Expose for tests/dev
export function _resetIdleManagerForTests() { for (const k of Object.keys(sessions)) delete sessions[k]; }
