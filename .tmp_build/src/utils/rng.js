"use strict";
// Central RNG helper for deterministic replay support.
// Prefer an injected RNG on a context/state, then the domain shim getRng(), then Math.random.
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
exports.getRng = getRng;
exports.roll = roll;
exports.randInt = randInt;
exports.choice = choice;
const domainShim = __importStar(require("./domainSystem"));
const seededRng_1 = require("./seededRng");
function getRng(source) {
    try {
        if (source && typeof source.rng === 'function')
            return source.rng;
        if (domainShim && typeof domainShim.getRng === 'function') {
            const g = domainShim.getRng();
            if (typeof g === 'function')
                return g;
        }
    }
    catch (e) {
        // fall through
    }
    // As a safer fallback, prefer the runtime seeded RNG helper if present (tests may override it)
    try {
        if (seededRng_1.runtimeRng && typeof seededRng_1.runtimeRng === 'function')
            return seededRng_1.runtimeRng;
    }
    catch (e) { /* ignore */ }
    return Math.random;
}
function roll(source) {
    return getRng(source)();
}
function randInt(max, source) {
    return Math.floor(getRng(source)() * max);
}
function choice(arr, source) {
    if (!arr || arr.length === 0)
        return undefined;
    return arr[randInt(arr.length, source)];
}
