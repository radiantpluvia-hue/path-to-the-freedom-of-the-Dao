"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idleManager = void 0;
exports._resetIdleManagerForTests = _resetIdleManagerForTests;
const meditationSubsystem_1 = require("./meditationSubsystem");
const sessions = {};
function makeId() { return 's_' + Math.random().toString(36).slice(2, 9); }
exports.idleManager = {
    startMeditation(meditationId, opts) {
        const sessionId = makeId();
        const sessBase = meditationSubsystem_1.meditationSubsystem.startSession(sessionId, meditationId, { modifiers: opts?.modifiers });
        const sess = { ...sessBase, lastTickAt: Date.now(), interrupted: false };
        sessions[sessionId] = sess;
        return sessionId;
    },
    stopMeditation(sessionId, reason = 'manual') {
        const s = sessions[sessionId];
        if (!s)
            return null;
        const result = meditationSubsystem_1.meditationSubsystem.endSession(s, reason);
        delete sessions[sessionId];
        return result;
    },
    getSession(sessionId) {
        return sessions[sessionId] ? { ...sessions[sessionId] } : null;
    },
    listSessions() {
        return Object.keys(sessions);
    },
    // tick called with dtSeconds to advance all sessions; in production this can be run every 1s
    tick(dtSeconds) {
        const results = [];
        for (const id of Object.keys(sessions)) {
            const s = sessions[id];
            // check interrupts via a safe hook into EventManager; fall back to no interrupts
            let interrupted = false;
            try {
                const maybeEventManager = globalThis.game && globalThis.game.eventManager;
                if (maybeEventManager && typeof maybeEventManager.checkInterrupts === 'function') {
                    const interrupt = maybeEventManager.checkInterrupts(s);
                    if (interrupt) {
                        interrupted = true;
                        s.interrupted = true;
                    }
                }
            }
            catch (e) { /* ignore */ }
            if (interrupted) {
                // mark and skip progress for this simple skeleton
                results.push({ sessionId: id, progress: 0, events: [{ type: 'interruption' }] });
                continue;
            }
            const res = meditationSubsystem_1.meditationSubsystem.tickSession(s, dtSeconds);
            if (res.events && res.events.length)
                s.pendingEvents.push(...res.events);
            s.lastTickAt = Date.now();
            results.push({ sessionId: id, progress: res.progress, events: res.events });
        }
        return results;
    }
};
// Expose for tests/dev
function _resetIdleManagerForTests() { for (const k of Object.keys(sessions))
    delete sessions[k]; }
