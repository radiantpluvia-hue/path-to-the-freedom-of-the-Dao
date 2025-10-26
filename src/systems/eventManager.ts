import { worldState, EventInstance } from './worldState';
import { rumorSystem } from './rumorSystem';
import { randInt, roll } from '../utils/rng';

export type InterruptDecision = {
  type: 'interrupt' | 'none';
  reason?: string;
  severity?: 'low'|'medium'|'high';
  options?: Array<{ id: string; text: string }>;
};

// Load templates from /data/events if available; fall back to empty map
const eventTemplates: Record<string, any> = {};
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const templates = require('../../data/events/bandit_chain.json');
  if (Array.isArray(templates)) {
    for (const t of templates) eventTemplates[t.id] = t;
  }
} catch (e) { /* ignore missing file in some environments */ }

// Merge developer seed events if present
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedTemplates = require('../../data/events/seed_events.json');
  if (Array.isArray(seedTemplates)) {
    for (const t of seedTemplates) eventTemplates[t.id] = t;
  }
} catch (e) { /* ignore missing seeds */ }

export const eventManager = {
  createInstance(templateId: string, origin?: any) {
    const tpl = eventTemplates[templateId];
    if (!tpl) throw new Error('template not found');
    const inst: EventInstance = { id: 'ei_' + randInt(0x100000).toString(36).slice(0,7), templateId, state: { step: 0 }, origin, startedAt: Date.now() };
    worldState.pushEventInstance(inst);
    return inst;
  },
  advanceInstance(instanceId: string, choiceId?: string) {
    // read instance from worldState
    const insts = worldState.getEventInstances();
    const inst = insts.find((i: any) => i.id === instanceId);
    if (!inst) throw new Error('instance not found');
    const tpl = eventTemplates[inst.templateId];
    if (!tpl) throw new Error('template not found');
    // advance by step and optionally schedule nextEvents
    const currentStep = inst.state && typeof inst.state.step === 'number' ? inst.state.step : 0;
    const nextStep = currentStep + 1;
    worldState.updateEventInstance(instanceId, (i) => { i.state = i.state || {}; i.state.step = nextStep; });
  worldState.pushEvent({ id: 'ev_' + randInt(0x100000).toString(36).slice(0,6), time: Date.now(), type: 'eventAdvance', payload: { instanceId, choiceId } });
    // Generate rumor from this event advance to seed world rumors
    try { rumorSystem.generateRumorFromEvent({ instanceId: inst.id, templateId: inst.templateId, choiceId, title: tpl.title }); } catch (e) { /* ignore */ }
    return true;
  },
  getInstances() { return worldState.getEventInstances(); },

  // checkInterrupts called each meditation tick; returns truthy interrupt when found
  checkInterrupts(session: any) : InterruptDecision | null {
    const stability = session.chosenType ? session.chosenType.stability || 0.5 : 0.8;
    const region = (session.origin && session.origin.region) || 'central';
    const regionData = worldState.getRegion(region);
    const baseChance = 0.01; // baseline interrupt chance per tick
    let chance = baseChance + (1 - stability) * 0.1;
    if (regionData && regionData.corrupted) chance += 0.05;
    if (chance > 0.5) chance = 0.5;

    if (roll() < chance) {
      const inst = this.createInstance('bandit_ambush', { region });
      worldState.pushEvent({ id: 'interrupt_'+inst.id, type: 'interrupt', payload: { instanceId: inst.id } });
      return { type: 'interrupt', reason: 'Bandit activity nearby', severity: 'medium', options: [ { id: 'stabilize', text: 'Stabilize' }, { id: 'withdraw', text: 'Safely Withdraw' }, { id: 'continue', text: 'Continue' } ] };
    }
    return null;
  }
};
