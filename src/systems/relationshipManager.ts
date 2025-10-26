import { worldState } from './worldState';

export type Relation = { actorA: string; actorB: string; favor: number; envy: number; fear: number };

const relations: Relation[] = [];

export const relationshipManager = {
  modifyRelationship(actorA: string, actorB: string, delta: { favor?: number; envy?: number; fear?: number }, reason?: string) {
    let rel = relations.find(r => r.actorA === actorA && r.actorB === actorB);
    if (!rel) { rel = { actorA, actorB, favor: 0, envy: 0, fear: 0 }; relations.push(rel); }
    rel.favor += delta.favor || 0;
    rel.envy += delta.envy || 0;
    rel.fear += delta.fear || 0;
    worldState.pushEvent({ id: 'rel_' + Math.random().toString(36).slice(2,8), type: 'relationChange', payload: { actorA, actorB, delta, reason } });
    return rel;
  },
  getRelation(actorA: string, actorB: string) {
    return relations.find(r => r.actorA === actorA && r.actorB === actorB) || { actorA, actorB, favor: 0, envy: 0, fear: 0 };
  }
};
