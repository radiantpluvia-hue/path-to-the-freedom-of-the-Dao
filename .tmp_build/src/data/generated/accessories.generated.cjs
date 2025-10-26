"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GENERATED_ACCESSORIES = void 0;
// Auto-generated accessories
exports.GENERATED_ACCESSORIES = (() => {
    const arr = [];
    const slots = ['ring', 'amulet', 'belt', 'trinket', 'charm'];
    for (let i = 1; i <= 100; i++) {
        const id = `gen_accessory_${String(i).padStart(3, '0')}`;
        const name = `Talisman ${i}`;
        const slot = slots[i % slots.length];
        const tier = i % 25 === 0 ? 'S' : i % 10 === 0 ? 'A' : 'C';
        const atk = (i % 6 === 0) ? 4 : (i % 3 === 0) ? 2 : 0;
        const def = (i % 7 === 0) ? 3 : 0;
        const hp = (i % 11 === 0) ? 40 : 0;
        const passiveRef = `gen_passive_${String(((i * 3) % 100) + 1).padStart(3, '0')}`; // reference generated passive
        // Add a short lore blurb and hint at the passive to make generated accessories feel less generic
        arr.push({
            id,
            name,
            slot,
            tier,
            stats: { atk: atk || undefined, def: def || undefined, hp: hp || undefined },
            passives: [passiveRef],
            description: `${name}, a ${slot} of tier ${tier}. Rumored origin: a wandering craftsman imbued this talisman with a subtle charm (${passiveRef}). It carries an air of quiet purpose.`
        });
    }
    return arr;
})();
exports.default = exports.GENERATED_ACCESSORIES;
