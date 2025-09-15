"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ITEM_CATALOG = void 0;
exports.getItemById = getItemById;
// Small catalog of equipment items (programmatic). We'll generate 48 items across slots.
exports.ITEM_CATALOG = (() => {
    const slots = ['head', 'chest', 'hands', 'weapon', 'boots', 'accessory1', 'accessory2', 'accessory3'];
    const prefixes = ['Jade', 'Crimson', 'Azure', 'Iron', 'Silk', 'Shadow', 'Celestial', 'Dragon', 'Phoenix', 'Eternal', 'Void', 'Heavenly', 'Pill-refined', 'Spiritbound'];
    const items = [];
    let i = 1;
    for (const slot of slots) {
        for (let n = 0; n < 6; n++) {
            const prefix = prefixes[(i * 7) % prefixes.length];
            const slotTitle = slot === 'weapon' ? 'Blade' : slot === 'hands' ? 'Gauntlets' : slot === 'boots' ? 'Boots' : slot === 'chest' ? 'Armor' : slot === 'head' ? 'Crown' : 'Adornment';
            const name = `${prefix} ${slotTitle} ${i}`;
            const atk = slot === 'weapon' ? Math.ceil((n + 1) * 10 + (i % 6)) : (n % 3 === 0 ? 3 : 1);
            const def = slot === 'chest' ? Math.ceil((n + 1) * 6) : (n % 4 === 0 ? 2 : 0);
            const hp = Math.floor((n + 1) * 60 + (i % 25));
            const qiMax = (i % 3 === 0) ? 6 : 0;
            const apBonus = (i % 4 === 0) ? 1 : 0;
            const passiveIds = (i % 5 === 0) ? [`passive_${((i % 100) || 100)}`] : [];
            const desc = `${name}: an item imbued with cultivation intent${passiveIds.length ? ' and a minor passive imprint' : ''}. It hums with qi.`;
            items.push({ id: `item_${i}`, name, slot, atk, def, hp, qiMax, apBonus, passiveIds, description: desc });
            i++;
        }
    }
    return items;
})();
function getItemById(id) {
    return exports.ITEM_CATALOG.find(it => it.id === id);
}
