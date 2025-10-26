"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRESETS = void 0;
// Minimal partial presets to apply via setState in dev
exports.PRESETS = {
    quick: {
        player: {
            currentQi: 200,
            fatigue: 0,
            techniques: [{ id: 'dt_test_tech', name: 'DT Test', masteryXp: 0, masteryRank: 0 }],
            hp: 100,
            qi: 100,
        }
    },
    highfatigue: {
        player: {
            currentQi: 200,
            fatigue: 22,
            techniques: [{ id: 'dt_test_tech', name: 'DT Test', masteryXp: 0, masteryRank: 0 }]
        }
    }
};
exports.default = exports.PRESETS;
