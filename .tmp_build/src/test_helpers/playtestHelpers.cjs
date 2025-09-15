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
exports.initializeStoreForPlaytest = initializeStoreForPlaytest;
exports.shutdownPlaytest = shutdownPlaytest;
exports.advanceTicks = advanceTicks;
exports.getStoreSnapshot = getStoreSnapshot;
const seededRng_ts_1 = require("../utils/seededRng.ts");
// freshStore pattern used across tests: require the module after resetModules
async function initializeStoreForPlaytest(seed) {
    // Reset modules when possible (jest environment) - best-effort
    try {
        global.jest?.resetModules?.();
    }
    catch (e) { /* not running under jest */ }
    if (seed !== undefined)
        (0, seededRng_ts_1.setRuntimeRng)((0, seededRng_ts_1.makeSeededRng)(seed));
    // Dynamically import the store module so this helper works in ESM runtime
    const storeMod = await Promise.resolve().then(() => __importStar(require('../store/useGameStore.ts')));
    const useGameStore = storeMod.useGameStore;
    const store = useGameStore;
    const actions = {
        startNewGame: (opts) => {
            const s = useGameStore.getState();
            if (typeof s.startNewGame === 'function')
                return s.startNewGame(opts);
            try {
                useGameStore.setState({ player: { ...s.player, name: opts?.name || 'Playtester' } });
            }
            catch (e) { /* ignore */ }
        },
        unlockMentor: (mentorId) => {
            const s = useGameStore.getState();
            if (typeof s.unlockMentor === 'function')
                return s.unlockMentor(mentorId);
        },
        advanceDays: (days) => {
            for (let i = 0; i < (days || 1); i++) {
                const s = useGameStore.getState();
                try {
                    s.dailyTick?.();
                }
                catch (e) { /* ignore */ }
            }
        },
        triggerActEvents: (actNum) => {
            const s = useGameStore.getState();
            if (typeof s.triggerActEvents === 'function')
                return s.triggerActEvents(actNum);
        }
    };
    return { store, actions };
}
function shutdownPlaytest() {
    try {
        (0, seededRng_ts_1.clearRuntimeRng)();
    }
    catch (e) { /* ignore */ }
}
function advanceTicks(store, ticks) {
    for (let i = 0; i < ticks; i++) {
        try {
            store.getState().dailyTick?.();
        }
        catch (e) { /* ignore */ }
        try {
            store.getState().seclusionTick?.();
        }
        catch (e) { /* ignore */ }
        try {
            store.getState().hermitTick?.();
        }
        catch (e) { /* ignore */ }
    }
}
function getStoreSnapshot(store) {
    try {
        return store.getState();
    }
    catch (e) {
        return null;
    }
}
exports.default = {
    initializeStoreForPlaytest,
    shutdownPlaytest,
    advanceTicks,
    getStoreSnapshot
};
