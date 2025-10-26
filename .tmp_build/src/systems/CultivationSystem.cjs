"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const registry_1 = require("../data/registry");
// ensure registry data (pathways etc.) is registered when this module loads
require("../bootstrap/registryBootstrap");
class CultivationSystemClass {
    selectPathway(player, pathwayId) {
        const data = registry_1.Registry.get('pathways') || {};
        const list = data.pathways || [];
        const p = list.find((x) => x.id === pathwayId) || null;
        if (!p)
            return false;
        player.cultivation = player.cultivation || {};
        player.cultivation.pathway = p.id;
        player.cultivation.bonuses = p.bonuses || {};
        // Emit persistent Buff objects for pathway bonuses so other systems process them uniformly
        player.activeBuffs = player.activeBuffs || [];
        const now = Date.now();
        const tick = player.currentTick || 0;
        const newBuffs = [];
        const bonuses = p.bonuses || {};
        for (const key of Object.keys(bonuses)) {
            const val = bonuses[key];
            const buffId = `pathway_${p.id}_${key}`;
            const buff = {
                id: buffId,
                name: `${p.name}: ${key}`,
                description: `Pathway bonus ${key}`,
                duration: -1,
                durationType: 'ticks',
                effects: { [key]: val },
                source: 'pathway',
                sourceId: p.id,
                stackable: false,
                appliedAt: now,
                appliedTick: tick,
                category: 'cultivation',
                isPermanent: true,
            };
            // Replace any existing buff with same id
            player.activeBuffs = player.activeBuffs.filter((b) => b.id !== buffId);
            player.activeBuffs.push(buff);
            newBuffs.push(buffId);
        }
        player.cultivation.buffIds = newBuffs;
        return true;
    }
    // Apply pathway bonuses to a simple stat object (returns modified copy)
    applyPathwayBonuses(player, stats) {
        const pathway = player.cultivation && player.cultivation.pathway ? player.cultivation.pathway : null;
        if (!pathway)
            return { ...stats };
        const data = registry_1.Registry.get('pathways') || {};
        const list = data.pathways || [];
        const p = list.find((x) => x.id === pathway) || null;
        if (!p)
            return { ...stats };
        const s = { ...stats };
        const b = p.bonuses || {};
        for (const k of Object.keys(b)) {
            const val = b[k];
            if (typeof val === 'number')
                s[k] = (s[k] || 0) + val;
            else
                s[k] = val;
        }
        return s;
    }
}
exports.default = new CultivationSystemClass();
