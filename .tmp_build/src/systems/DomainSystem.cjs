"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DomainSystem = void 0;
const rng_1 = require("../utils/rng");
const DEFAULT_PARAMS = {
    tickIntervalSec: 60,
    baseInfluenceThreshold: 100,
    influenceDecayPerTick: 0.02,
    ownershipLeadPct: 0.25,
    contestDurationSec: 3600,
    garrisonWeight: 0.5,
    baseYield: { gold: 10, food: 20, spirit_ore: 1, spirit_stone: 0, influencePoint: 1 },
    rarityMultipliers: { common: 1, rare: 1.5, ancient: 2.5 },
    upkeepMultiplierPerBuildingLevel: 0.05,
    raidBaseSuccessChance: 0.35,
};
class DomainSystem {
    // Static methods for backward compatibility
    static defaultState() {
        return {
            id: 'player_domain',
            level: 1,
            xp: 0,
            resources: { gold: 0, food: 0, spirit_ore: 0, spirit_stone: 0, influencePoint: 0 },
            territories: {},
            factions: {},
            buildings: {},
            lastTickIso: Date.now(),
            unlocks: {},
            bonuses: {},
        };
    }
    static addResource(state, resource, amount) {
        const newState = { ...state };
        newState.resources = { ...newState.resources };
        newState.resources[resource] = (newState.resources[resource] || 0) + amount;
        return newState;
    }
    static setUnlock(state, unlockId, unlocked) {
        const newState = { ...state };
        newState.unlocks = { ...newState.unlocks };
        newState.unlocks[unlockId] = unlocked;
        return newState;
    }
    static addBonus(state, bonusId, value) {
        const newState = { ...state };
        newState.bonuses = { ...newState.bonuses };
        newState.bonuses[bonusId] = (newState.bonuses[bonusId] || 0) + value;
        return newState;
    }
    static gainXP(state, xpAmount) {
        const newState = { ...state };
        newState.xp += xpAmount;
        // Level up logic if needed
        while (newState.xp >= this.getXPForLevel(newState.level + 1)) {
            newState.level++;
        }
        return newState;
    }
    static getXPForLevel(level) {
        return level * 100; // Simple XP curve
    }
    constructor(domainState, params, rng) {
        this.state = domainState;
        this.params = { ...DEFAULT_PARAMS, ...params };
        this.rng = rng || (0, rng_1.getRng)();
    }
    tick(_deltaSeconds = this.params.tickIntervalSec) {
        this.decayInfluence();
        this.resolveTerritoryContests();
        this.applyIncome();
    }
    decayInfluence() {
        for (const territoryId in this.state.territories) {
            const territory = this.state.territories[territoryId];
            for (const factionId in territory.influence) {
                territory.influence[factionId] = Math.max(0, territory.influence[factionId] * (1 - this.params.influenceDecayPerTick));
            }
        }
    }
    resolveTerritoryContests() {
        const nowIso = Date.now();
        for (const territoryId in this.state.territories) {
            const territory = this.state.territories[territoryId];
            const influences = Object.entries(territory.influence).sort((a, b) => b[1] - a[1]);
            const top = influences[0];
            const runnerUp = influences[1] || [null, 0];
            const defenseModifier = this.computeDefenseModifier(territory);
            if (top &&
                top[1] >= this.params.baseInfluenceThreshold + defenseModifier &&
                top[1] >= runnerUp[1] * (1 + this.params.ownershipLeadPct)) {
                if (territory.ownerFactionId !== top[0]) {
                    territory.ownerFactionId = top[0];
                    territory.contestedSince = null;
                    territory.lastActionIso = nowIso;
                    // TODO: Emit territoryCaptured event for telemetry
                }
            }
            else if (top && top[1] > runnerUp[1]) {
                if (!territory.contestedSince) {
                    territory.contestedSince = nowIso;
                }
            }
            else {
                territory.contestedSince = null;
            }
        }
    }
    computeDefenseModifier(territory) {
        let defense = 0;
        if (territory.garrison) {
            defense += territory.garrison.troops * this.params.garrisonWeight;
        }
        for (const buildingId in territory.buildings) {
            const building = territory.buildings[buildingId];
            void building;
            // Placeholder: Add building defense bonus if applicable
            // defense += getBuildingDefenseBonus(building);
        }
        return defense;
    }
    calculateResourceGeneration() {
        const totalIncome = {
            gold: 0,
            food: 0,
            spirit_ore: 0,
            spirit_stone: 0,
            influencePoint: 0,
        };
        for (const territoryId in this.state.territories) {
            const income = this.getTerritoryIncome(this.state.territories[territoryId]);
            for (const key in income) {
                totalIncome[key] += income[key];
            }
        }
        return totalIncome;
    }
    applyIncome() {
        const income = this.calculateResourceGeneration();
        for (const key in income) {
            const resourceKey = key;
            this.state.resources[resourceKey] = (this.state.resources[resourceKey] || 0) + income[resourceKey];
        }
    }
    changeTerritoryInfluence(territoryId, factionId, delta, _reason) {
        const territory = this.state.territories[territoryId];
        if (!territory)
            return;
        territory.influence[factionId] = (territory.influence[factionId] || 0) + delta;
        if (territory.influence[factionId] < 0)
            territory.influence[factionId] = 0;
        // TODO: Log reason for influence change if needed
    }
    attemptClaimTerritory(_territoryId, _factionId, _actorContext) {
        // Placeholder for claim logic
        return { success: false, message: 'Not implemented' };
    }
    build(_territoryId, _buildingPrototypeId, _builderId) {
        // Placeholder for build logic
        return { success: false, message: 'Not implemented' };
    }
    upgradeBuilding(_buildingInstanceId) {
        // Placeholder for upgrade logic
        return { success: false, message: 'Not implemented' };
    }
    raidTerritory(_territoryId, _attackerFactionId, _raidParams) {
        // Placeholder for raid logic
        return { success: false, message: 'Not implemented' };
    }
    transferResources(resourceDelta) {
        for (const key in resourceDelta) {
            const resourceKey = key;
            this.state.resources[resourceKey] = (this.state.resources[resourceKey] || 0) + resourceDelta[resourceKey];
            if (this.state.resources[resourceKey] < 0)
                this.state.resources[resourceKey] = 0;
        }
    }
    recruitGarrison(territoryId, hireCount, quality) {
        const territory = this.state.territories[territoryId];
        if (!territory)
            return false;
        if (!territory.garrison) {
            territory.garrison = { troops: 0, quality: 0 };
        }
        territory.garrison.troops += hireCount;
        // Weighted average quality (default existing quality to 0 if undefined)
        const prevQuality = typeof territory.garrison.quality === 'number' ? territory.garrison.quality : 0;
        territory.garrison.quality =
            (prevQuality * (territory.garrison.troops - hireCount) + quality * hireCount) / territory.garrison.troops;
        return true;
    }
    serialize() {
        return this.state;
    }
    getTerritoryIncome(territory) {
        const base = this.params.baseYield;
        const rarityMultiplier = this.params.rarityMultipliers[territory.rarity ?? "H"] || 1;
        const buildingBonus = 0;
        for (const buildingId in territory.buildings) {
            const building = territory.buildings[buildingId];
            void building;
            // Placeholder: building prototype yield bonus
            // buildingBonus += getBuildingYieldBonus(building);
        }
        const income = {
            gold: Math.round(base.gold * rarityMultiplier * (1 + buildingBonus)),
            food: Math.round(base.food * rarityMultiplier * (1 + buildingBonus)),
            spirit_ore: Math.round(base.spirit_ore * rarityMultiplier * (1 + buildingBonus)),
            spirit_stone: 0,
            influencePoint: Math.round(base.influencePoint * rarityMultiplier),
        };
        return income;
    }
    computeInfluenceDecay() {
        this.decayInfluence();
    }
}
exports.DomainSystem = DomainSystem;
