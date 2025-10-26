"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const useGameStore_1 = require("@/store/useGameStore");
const passiveRegistry_1 = require("@/systems/passiveRegistry");
describe('weapons + passives integration', () => {
    beforeEach(() => {
        // reset store to initial state if available
        if (useGameStore_1.useGameStore.getInitialState)
            useGameStore_1.useGameStore.setState(useGameStore_1.useGameStore.getInitialState());
    });
    test('equipping a weapon with a passive applies equipment stats and passive effects', () => {
        // register a passive that grants +7 atk and attaches an onHit hook
        (0, passiveRegistry_1.registerPassive)({
            id: 'test_weapon_passive_plus7',
            name: 'Weapon Might +7',
            apply: (p) => {
                const np = { ...p };
                np.stats = { ...(np.stats || {}) };
                np.stats.atk = (np.stats.atk || 0) + 7;
                // attach a dummy onHit hook for verification
                np._passiveHooks = { ...(np._passiveHooks || {}), onHit: [...(np._passiveHooks?.onHit || []), { id: 'test_weapon_passive_plus7', fn: () => { } }] };
                return np;
            },
            remove: (p) => {
                const np = { ...p };
                np.stats = { ...(np.stats || {}) };
                np.stats.atk = (np.stats.atk || 0) - 7;
                if (np._passiveHooks && Array.isArray(np._passiveHooks.onHit))
                    np._passiveHooks.onHit = np._passiveHooks.onHit.filter((h) => h.id !== 'test_weapon_passive_plus7');
                return np;
            }
        });
        // prepare base stats and ensure equipment container
        useGameStore_1.useGameStore.setState((s) => ({ player: { ...s.player, stats: { ...(s.player.stats || {}), atk: 10 }, equipment: { mainHand: null, offHand: null, armor: null, accessory1: null, accessory2: null, mount: null, companion: null, innerCore: null } } }));
        const weapon = { id: 'wpn_test_1', name: 'Test Blade', slot: 'mainHand', stats: { atk: 5 }, passives: ['test_weapon_passive_plus7'], type: 'weapon' };
        // equip the weapon using the store helper (which should apply equipment stats and invoke passives)
        useGameStore_1.useGameStore.equipItem('mainHand', weapon);
        const after = useGameStore_1.useGameStore.getState().player;
        // numeric check: base 10 + weapon 5 + passive 7
        expect(after.stats.atk).toBe(10 + 5 + 7);
        // passive registry should have added onHit hook to player _passiveHooks
        expect(after._passiveHooks && Array.isArray(after._passiveHooks.onHit)).toBeTruthy();
        const hasHook = after._passiveHooks.onHit.some((h) => h.id === 'test_weapon_passive_plus7');
        expect(hasHook).toBe(true);
        // unequip and ensure effects removed
        useGameStore_1.useGameStore.unequipItem('mainHand');
        const post = useGameStore_1.useGameStore.getState().player;
        expect(post.stats.atk).toBe(10);
        (0, passiveRegistry_1.unregisterPassive)('test_weapon_passive_plus7');
    });
});
