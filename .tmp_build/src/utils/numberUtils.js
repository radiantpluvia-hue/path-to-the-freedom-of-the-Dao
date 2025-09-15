"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidNumber = isValidNumber;
exports.toSafeNumber = toSafeNumber;
exports.clamp = clamp;
function isValidNumber(value) {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
}
function toSafeNumber(value, fallback = 0) {
    if (isValidNumber(value))
        return value;
    const coerced = Number(value);
    return isValidNumber(coerced) ? coerced : fallback;
}
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
