"use strict";
// Simple MeditationSubsystem for Task B
Object.defineProperty(exports, "__esModule", { value: true });
exports.meditationSubsystem = exports.MEDITATION_TEMPLATES = void 0;
exports.MEDITATION_TEMPLATES = {
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
exports.meditationSubsystem = {
    getTemplate(id) {
        return exports.MEDITATION_TEMPLATES[id] || null;
    },
    startSession(sessionId, meditationId, opts) {
        const t = this.getTemplate(meditationId);
        const sess = {
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
    tickSession(session, dtSeconds) {
        if (!session.chosenType)
            return { progress: 0, events: [] };
        const rate = session.chosenType.baseXpRate;
        const modifier = session.modifiers && session.modifiers.xpMultiplier ? session.modifiers.xpMultiplier : 1;
        const progress = rate * dtSeconds * modifier;
        session.currentProgress += progress;
        // roll for special outcome (very small chance per tick)
        const events = [];
        if (session.chosenType.specialOutcomes && Math.random() < (1 - session.chosenType.stability) * 0.02) {
            events.push({ type: 'specialOutcome', outcome: session.chosenType.specialOutcomes[0] });
        }
        return { progress, events };
    },
    endSession(session, _reason) {
        const gained = session.currentProgress;
        const special = session.pendingEvents.length > 0 ? session.pendingEvents[0] : null;
        return { sessionId: session.sessionId, meditationId: session.meditationId, success: true, progressGained: gained, special };
    }
};
