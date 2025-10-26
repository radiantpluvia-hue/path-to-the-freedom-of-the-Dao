"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.relationshipManager = void 0;
const worldState_1 = require("./worldState");
const relations = [];
exports.relationshipManager = {
    modifyRelationship(actorA, actorB, delta, reason) {
        let rel = relations.find(r => r.actorA === actorA && r.actorB === actorB);
        if (!rel) {
            rel = { actorA, actorB, favor: 0, envy: 0, fear: 0 };
            relations.push(rel);
        }
        rel.favor += delta.favor || 0;
        rel.envy += delta.envy || 0;
        rel.fear += delta.fear || 0;
        worldState_1.worldState.pushEvent({ id: 'rel_' + Math.random().toString(36).slice(2, 8), type: 'relationChange', payload: { actorA, actorB, delta, reason } });
        return rel;
    },
    getRelation(actorA, actorB) {
        return relations.find(r => r.actorA === actorA && r.actorB === actorB) || { actorA, actorB, favor: 0, envy: 0, fear: 0 };
    }
};
