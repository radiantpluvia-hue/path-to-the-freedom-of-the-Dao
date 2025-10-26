"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const Training = __importStar(require("../game/training"));
describe('Training engine', () => {
    afterEach(() => {
        jest.restoreAllMocks();
    });
    test('computeSuccessModifier applies bloodline and physique and mentor bonuses', () => {
        const player = { bloodline: 'beast_whisperer', physique: 'turtle_ancient', mentor: { bonusTrainingPct: 0.05 } };
        const training = Training.getTraining('beast_taming');
        const mul = Training.computeSuccessModifier(player, training);
        // bloodline beast_whisperer => +0.15, physique turtle_ancient doesn't affect beast_taming but mentor adds +0.05
        // So expected multiplier = 1 * (1 + 0.15) * (1 + 0.05) = 1.15 * 1.05
        expect(Number(mul.toFixed(4))).toBeCloseTo(1.15 * 1.05, 4);
    });
    test('startTraining deducts costs, consumes items, sets queue and cooldown', () => {
        const player = { id: 'p1', realm: 2, stamina: 10, qi: 10, inventory: { basic_herbs: 1 }, cooldowns: {}, trainingQueue: null };
        const now = 1000;
        const res = Training.startTraining(player, 'alchemy_practice', now);
        expect(res).toEqual({ ok: true });
        const t = Training.getTraining('alchemy_practice');
        expect(player.stamina).toBe(10 - (t.cost?.stamina || 0));
        expect(player.qi).toBe(10 - (t.cost?.qi || 0));
        expect(player.inventory.basic_herbs).toBe(0);
        expect(player.trainingQueue).toBeTruthy();
        expect(player.cooldowns.training['alchemy_practice']).toBe(now + (t.cooldown_ticks || 0));
    });
    test('resolveTraining applies rewards on success', () => {
        const player = { id: 'p2', realm: 2, stamina: 20, qi: 20, inventory: {}, cooldowns: {}, trainingQueue: { id: 'alchemy_practice', startedAtTick: 0, endTick: 0 }, xp: {}, skills: {} };
        // force success
        jest.spyOn(Math, 'random').mockReturnValue(0.0);
        const res = Training.resolveTraining(player, 1);
        expect(res.ok).toBe(true);
        expect(res.success).toBe(true);
        // xp and skill increase applied
        const t = Training.getTraining('alchemy_practice');
        expect(player.xp.alchemy).toBe(t.xp_gain.alchemy);
        // The engine applies the reward and also fires the onComplete hook which
        // further increases alchemy skill (+1), so total increase is reward + hook.
        expect(player.skills.alchemy).toBe(t.xp_gain.alchemy > 0 ? (t.rewards.alchemy_skill_increase + 1) : t.rewards.alchemy_skill_increase + 1);
        expect(player.trainingQueue).toBeNull();
    });
    test('resolveTraining handles failure and backlash', () => {
        const player = { id: 'p3', realm: 8, stamina: 100, qi: 100, inventory: { sacrificial_incense: 1 }, cooldowns: {}, trainingQueue: null, dao_heart_corruption: 0 };
        const now = 2000;
        const start = Training.startTraining(player, 'heart_demon_confrontation', now);
        expect(start.ok).toBe(true);
        // Force first random to be > success chance so resolve fails, second random to be <= backlash chance
        const mock = jest.spyOn(Math, 'random')
            .mockImplementationOnce(() => 0.99) // success roll -> fail
            .mockImplementationOnce(() => 0.2); // backlash roll -> trigger (backlash_chance 0.30)
        const r = Training.resolveTraining(player, now + 1000);
        expect(r.ok).toBe(true);
        expect(r.success).toBe(false);
        expect(r.backlash).toBe(true);
        // backlash corruption increased by 5 per definition
        expect(player.dao_heart_corruption).toBeGreaterThanOrEqual(5);
        expect(player.trainingQueue).toBeNull();
        mock.mockRestore();
    });
    test('startTraining fails when required items are missing', () => {
        const player = { id: 'p4', realm: 8, stamina: 100, qi: 100, inventory: {}, cooldowns: {} };
        const res = Training.startTraining(player, 'heart_demon_confrontation', 5000);
        expect(res.error).toBe('missing_items');
    });
    test('startTraining blocked by cooldown if attempted too soon', () => {
        const player = { id: 'p5', realm: 2, stamina: 100, qi: 100, inventory: { basic_herbs: 2 }, cooldowns: {}, trainingQueue: null };
        const now = 6000;
        const first = Training.startTraining(player, 'alchemy_practice', now);
        expect(first.ok).toBe(true);
        // attempt again immediately
        const second = Training.startTraining(player, 'alchemy_practice', now + 1);
        expect(second.error).toBe('cooldown');
    });
    test('startTraining returns locked when player realm is too low', () => {
        const player = { id: 'p6', realm: 1, stamina: 100, qi: 100, inventory: { array_stone: 1 }, cooldowns: {} };
        const res = Training.startTraining(player, 'array_training', 7000);
        expect(res.error).toBe('locked');
    });
});
