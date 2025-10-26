"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventManager = void 0;
const worldState_1 = require("./worldState");
const rumorSystem_1 = require("./rumorSystem");
// Load templates from /data/events if available; fall back to empty map
const eventTemplates = {};
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const templates = require('../../data/events/bandit_chain.json');
    if (Array.isArray(templates)) {
        for (const t of templates)
            eventTemplates[t.id] = t;
    }
}
catch (e) { /* ignore missing file in some environments */ }
// Merge developer seed events if present
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedTemplates = require('../../data/events/seed_events.json');
    if (Array.isArray(seedTemplates)) {
        for (const t of seedTemplates)
            eventTemplates[t.id] = t;
    }
}
catch (e) { /* ignore missing seeds */ }
exports.eventManager = {
    createInstance(templateId, origin) {
        const tpl = eventTemplates[templateId];
        if (!tpl)
            throw new Error('template not found');
        const inst = { id: 'ei_' + Math.random().toString(36).slice(2, 9), templateId, state: { step: 0 }, origin, startedAt: Date.now() };
        worldState_1.worldState.pushEventInstance(inst);
        return inst;
    },
    advanceInstance(instanceId, choiceId) {
        // read instance from worldState
        const insts = worldState_1.worldState.getEventInstances();
        const inst = insts.find((i) => i.id === instanceId);
        if (!inst)
            throw new Error('instance not found');
        const tpl = eventTemplates[inst.templateId];
        if (!tpl)
            throw new Error('template not found');
        // advance by step and optionally schedule nextEvents
        const currentStep = inst.state && typeof inst.state.step === 'number' ? inst.state.step : 0;
        const nextStep = currentStep + 1;
        worldState_1.worldState.updateEventInstance(instanceId, (i) => { i.state = i.state || {}; i.state.step = nextStep; });
        worldState_1.worldState.pushEvent({ id: 'ev_' + Math.random().toString(36).slice(2, 8), time: Date.now(), type: 'eventAdvance', payload: { instanceId, choiceId } });
        // Generate rumor from this event advance to seed world rumors
        try {
            rumorSystem_1.rumorSystem.generateRumorFromEvent({ instanceId: inst.id, templateId: inst.templateId, choiceId, title: tpl.title });
        }
        catch (e) { /* ignore */ }
        return true;
    },
    getInstances() { return worldState_1.worldState.getEventInstances(); },
    // checkInterrupts called each meditation tick; returns truthy interrupt when found
    checkInterrupts(session) {
        const stability = session.chosenType ? session.chosenType.stability || 0.5 : 0.8;
        const region = (session.origin && session.origin.region) || 'central';
        const regionData = worldState_1.worldState.getRegion(region);
        const baseChance = 0.01; // baseline interrupt chance per tick
        let chance = baseChance + (1 - stability) * 0.1;
        if (regionData && regionData.corrupted)
            chance += 0.05;
        if (chance > 0.5)
            chance = 0.5;
        if (Math.random() < chance) {
            const inst = this.createInstance('bandit_ambush', { region });
            worldState_1.worldState.pushEvent({ id: 'interrupt_' + inst.id, type: 'interrupt', payload: { instanceId: inst.id } });
            return { type: 'interrupt', reason: 'Bandit activity nearby', severity: 'medium', options: [{ id: 'stabilize', text: 'Stabilize' }, { id: 'withdraw', text: 'Safely Withdraw' }, { id: 'continue', text: 'Continue' }] };
        }
        return null;
    }
};
