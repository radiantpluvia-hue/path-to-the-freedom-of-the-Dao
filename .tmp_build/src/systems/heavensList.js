"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreEntity = scoreEntity;
exports.buildHeavensList = buildHeavensList;
exports.setHeavensList = setHeavensList;
const DEFAULT_CFG = { combatWeight: 0.8, karmaWeight: 0.2, fameWeight: 0.02, maxEntries: 100 };
function scoreEntity(e, cfg = DEFAULT_CFG) {
    const fame = e.fame ?? 0;
    return e.combatPower * cfg.combatWeight + e.karma * cfg.karmaWeight + fame * (cfg.fameWeight ?? 0);
}
function buildHeavensList(candidates, cfg = DEFAULT_CFG) {
    const sorted = [...candidates].sort((a, b) => {
        const sa = scoreEntity(a, cfg);
        const sb = scoreEntity(b, cfg);
        if (sb !== sa)
            return sb - sa;
        if ((b.karma ?? 0) !== (a.karma ?? 0))
            return (b.karma ?? 0) - (a.karma ?? 0);
        if ((b.fame ?? 0) !== (a.fame ?? 0))
            return (b.fame ?? 0) - (a.fame ?? 0);
        return a.name.localeCompare(b.name);
    }).slice(0, cfg.maxEntries ?? 100);
    return sorted.map((e, i) => ({ ...e, rank: i + 1 }));
}
function setHeavensList(state, list) {
    state.world.heavensList = list;
    return state;
}
