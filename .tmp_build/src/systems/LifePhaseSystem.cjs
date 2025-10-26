"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const narrativeTemplates_1 = require("./narrativeTemplates");
// Minimal LifePhaseSystem to manage life phases and chronicle entries.
class LifePhaseSystem {
    constructor(initial, tickProvider) {
        this.onPhaseStartCallbacks = [];
        this.onPhaseEndCallbacks = [];
        this.tickProvider = tickProvider || (() => Date.now());
        this.state = {
            currentPhase: null,
            pastPhases: [],
            reincarnationCount: 0,
            ancestors: [],
            ...initial
        };
    }
    startPhase(type, title, karmicModifiers) {
        const id = `life-${(this.state.pastPhases.length + (this.state.currentPhase ? 1 : 0) + 1)}`;
        const phase = {
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
            this.onPhaseStartCallbacks.forEach(cb => { try {
                cb(phase);
            }
            catch (e) {
                void e;
            } });
        }
        catch (e) {
            void e;
        }
        return phase;
    }
    endPhase() {
        const cp = this.state.currentPhase;
        if (!cp)
            return null;
        cp.endedAtTick = this.tickProvider();
        this.state.pastPhases.push(cp);
        this.state.currentPhase = null;
        if (cp.type === 'ReincarnationCycle') {
            this.state.reincarnationCount = (this.state.reincarnationCount || 0) + 1;
        }
        // notify listeners
        try {
            this.onPhaseEndCallbacks.forEach(cb => { try {
                cb(cp);
            }
            catch (e) {
                void e;
            } });
        }
        catch (e) {
            void e;
        }
        return cp;
    }
    // Listener registration
    addPhaseStartListener(cb) {
        if (typeof cb === 'function')
            this.onPhaseStartCallbacks.push(cb);
    }
    addPhaseEndListener(cb) {
        if (typeof cb === 'function')
            this.onPhaseEndCallbacks.push(cb);
    }
    recordEvent(e) {
        if (this.state.currentPhase) {
            this.state.currentPhase.events.push({ ...e, tick: e.tick || this.tickProvider() });
        }
        else {
            // If no current phase, create a Mortal Life and attach
            this.startPhase('Mortal');
            this.recordEvent(e);
        }
    }
    getChronicle() {
        const accum = [];
        for (const p of this.state.pastPhases)
            accum.push(...(p.events || []));
        if (this.state.currentPhase)
            accum.push(...this.state.currentPhase.events);
        return accum;
    }
    getState() {
        return this.state;
    }
    loadState(s) {
        this.state = {
            currentPhase: s.currentPhase || null,
            pastPhases: s.pastPhases || [],
            reincarnationCount: s.reincarnationCount || 0,
            ancestors: s.ancestors || []
        };
    }
    // Very small helper to produce a readable novel text for a given life or all lives
    renderNovel() {
        const lines = [];
        const appendPhase = (p) => {
            lines.push(`--- ${p.title || p.id} (${p.type}) ---`);
            for (const ev of p.events || []) {
                const when = ev.tick || '';
                // If event provides a templateId or matches TEMPLATES, render it
                const templateId = ev.templateId || ev.id;
                const tpl = (0, narrativeTemplates_1.templateForEvent)(templateId, 'generic_event');
                if (tpl) {
                    const ctx = {
                        ...p.karmicModifiers,
                        ...ev.context,
                        title: ev.title || ev.id,
                        description: ev.description || '',
                        playerName: (ev.context && ev.context.playerName) || 'The Protagonist',
                        region: (ev.context && ev.context.region) || 'unknown lands'
                    };
                    const rendered = (0, narrativeTemplates_1.renderTemplate)(tpl, ctx);
                    lines.push(`${rendered} ${when}`);
                }
                else {
                    lines.push(`${ev.title || ev.id}: ${ev.description || ''} ${when}`);
                }
            }
        };
        for (const p of this.state.pastPhases)
            appendPhase(p);
        if (this.state.currentPhase)
            appendPhase(this.state.currentPhase);
        return lines.join('\n');
    }
}
exports.default = LifePhaseSystem;
