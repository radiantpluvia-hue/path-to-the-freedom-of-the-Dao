"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listRelics = listRelics;
exports.findRelic = findRelic;
exports.isRelicClaimed = isRelicClaimed;
exports.claimRelic = claimRelic;
exports.releaseRelic = releaseRelic;
exports.getRelicRegistryState = getRelicRegistryState;
exports.loadRelicRegistryState = loadRelicRegistryState;
exports.relicToEquipment = relicToEquipment;
exports.equipRelicOnPlayer = equipRelicOnPlayer;
exports.claimRelicAndGet = claimRelicAndGet;
exports.forceEquipRelicReplacingMythic = forceEquipRelicReplacingMythic;
// Simple Relic registry to allow future dynamic behaviors (locking, claiming, world-unique checks)
// Currently just provides helpers parallel to weapons/accessories.
const registry_1 = require("../data/registry");
const EquipmentSystem_1 = require("./EquipmentSystem");
const passiveRegistry_1 = require("./passiveRegistry");
function listRelics() {
    return (0, registry_1.getRelics)();
}
function findRelic(id) {
    return (0, registry_1.getRelics)().find(r => r.id === id) || null;
}
// Placeholder for future unique-claim logic if needed
const claimed = new Set();
function isRelicClaimed(id) { return claimed.has(id); }
function claimRelic(id) { if (claimed.has(id))
    return false; claimed.add(id); return true; }
function releaseRelic(id) { claimed.delete(id); }
function getRelicRegistryState() { return { claimed: Array.from(claimed) }; }
function loadRelicRegistryState(state) { claimed.clear(); state?.claimed?.forEach(id => claimed.add(id)); }
// Map relic stat keys to canonical player stat keys used by equipment system
const STAT_KEY_MAP = { atk: 'attack', def: 'defense', hp: 'maxHp', qi: 'qiMax', crit: 'critChance' };
function relicToEquipment(relicId) {
    const relic = findRelic(relicId);
    if (!relic)
        return null;
    const stats = {};
    if (relic.stats) {
        Object.entries(relic.stats).forEach(([k, v]) => {
            const mapped = STAT_KEY_MAP[k] || k;
            stats[mapped] = (stats[mapped] || 0) + (v || 0);
        });
    }
    // slot mapping: weapon -> mainHand, armor -> armor, accessory -> accessory1 (caller may choose alt)
    const slot = relic.slot === 'weapon' ? 'mainHand' : relic.slot === 'armor' ? 'armor' : 'accessory1';
    return { id: relic.id, name: relic.name, description: relic.description, slot, stats, passives: relic.passives || [] };
}
// Convenience: attempt to equip a relic directly onto a provided player object (mutative pattern avoided; returns new player)
function equipRelicOnPlayer(player, relicId) {
    const eq = relicToEquipment(relicId);
    if (!eq)
        return player;
    try {
        let p = { ...player };
        // Enforce mythic relic equip conflict rule: only one mythic relic at a time
        try {
            const relic = findRelic(relicId);
            if (relic && relic.rarity === 'Mythic') {
                // Scan existing equipped items for any other mythic relic ids
                const allRelics = listRelics();
                const mythicIds = new Set(allRelics.filter(r => r.rarity === 'Mythic').map(r => r.id));
                // Equipment entries have id == relic.id when converted
                const equippedRelicIds = Object.values(p.equipment || {}).map((it) => it && it.id).filter((id) => mythicIds.has(id));
                if (equippedRelicIds.length && !equippedRelicIds.includes(relic.id)) {
                    // Conflict: already have a different mythic relic equipped; reject equip
                    return player; // unchanged
                }
            }
        }
        catch { /* non-fatal */ }
        const slot = eq.slot;
        const previous = p.equipment?.[slot] || null;
        if (previous) {
            p = (0, EquipmentSystem_1.removeEquipmentBonuses)(p, previous);
        }
        // Ensure equipment container exists
        p.equipment = { ...(p.equipment || {}) };
        // Apply bonuses + passives
        p = (0, EquipmentSystem_1.applyEquipmentBonuses)(p, eq);
        // Guarantee passiveIds tracking if passive system uses it
        (eq.passives || []).forEach((pid) => {
            if (!p.passiveIds)
                p.passiveIds = [];
            if (!p.passiveIds.includes(pid))
                p.passiveIds.push(pid);
            // In case passive registry side-effects not yet applied
            try {
                p = (0, passiveRegistry_1.applyPassiveToPlayer)(p, pid);
            }
            catch (e) { /* ignore */ }
        });
        p.equipment[slot] = eq;
        claimRelic(relicId);
        return p;
    }
    catch {
        return player;
    }
}
// Helper to mark relic claimed & return reference (used by market / quest integration)
function claimRelicAndGet(relicId) {
    claimRelic(relicId);
    return findRelic(relicId);
}
// Force-equip variant: if another Mythic relic is equipped, remove its bonuses and equip new relic.
function forceEquipRelicReplacingMythic(player, relicId) {
    const eq = relicToEquipment(relicId);
    if (!eq)
        return player;
    try {
        let p = { ...player };
        const relic = findRelic(relicId);
        if (relic && relic.rarity === 'Mythic') {
            // remove any other mythic relic bonuses currently equipped
            const allRelics = listRelics();
            const mythicIds = new Set(allRelics.filter(r => r.rarity === 'Mythic').map(r => r.id));
            for (const [slot, equippedRaw] of Object.entries(p.equipment || {})) {
                const equipped = equippedRaw;
                if (equipped && mythicIds.has(equipped.id) && equipped.id !== relic.id) {
                    p = (0, EquipmentSystem_1.removeEquipmentBonuses)(p, equipped);
                    // clear the slot
                    p.equipment = { ...(p.equipment || {}) };
                    p.equipment[slot] = null;
                }
            }
        }
        // Now use existing equip flow (apply bonuses, passives)
        const slot = eq.slot;
        const previous = p.equipment?.[slot] || null;
        if (previous) {
            p = (0, EquipmentSystem_1.removeEquipmentBonuses)(p, previous);
        }
        p.equipment = { ...(p.equipment || {}) };
        p = (0, EquipmentSystem_1.applyEquipmentBonuses)(p, eq);
        (eq.passives || []).forEach((pid) => {
            if (!p.passiveIds)
                p.passiveIds = [];
            if (!p.passiveIds.includes(pid))
                p.passiveIds.push(pid);
            try {
                p = (0, passiveRegistry_1.applyPassiveToPlayer)(p, pid);
            }
            catch (e) { /* ignore */ }
        });
        p.equipment[slot] = eq;
        claimRelic(relicId);
        return p;
    }
    catch {
        return player;
    }
}
// Expose runtime registry on globalThis for SaveLoadSystem and test injection fallbacks
try {
    const runtime = {
        listRelics,
        findRelic,
        isRelicClaimed,
        claimRelic,
        releaseRelic,
        getRelicRegistryState,
        loadRelicRegistryState,
        relicToEquipment,
        equipRelicOnPlayer,
        claimRelicAndGet,
        forceEquipRelicReplacingMythic
    };
    globalThis.relicRegistry = runtime;
    globalThis.RelicRegistry = runtime;
}
catch (e) { /* ignore in restricted environments */ }
