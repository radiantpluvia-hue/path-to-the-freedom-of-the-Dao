"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectFromWeightedList = selectFromWeightedList;
const rng_1 = require("./rng");
/**
 * Select one item from a list given a weight accessor. Weights may be zero or positive.
 * If total weight is <= 0 we fall back to uniform random selection.
 * rng is a function that returns a number in [0,1).
 */
function selectFromWeightedList(list, getWeight, rng) {
    if (!list || list.length === 0)
        return null;
    const weights = list.map(getWeight);
    const total = weights.reduce((s, w) => s + (isFinite(w) && w > 0 ? w : 0), 0);
    if (total <= 0) {
        const rfn = rng || (0, rng_1.getRng)();
        return list[Math.floor(rfn() * list.length)];
    }
    const rfn = rng || (0, rng_1.getRng)();
    let r = rfn() * total;
    for (let i = 0; i < list.length; i++) {
        r -= weights[i];
        if (r <= 0)
            return list[i];
    }
    return list[list.length - 1];
}
