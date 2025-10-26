"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eraGenerator_1 = require("@/era/eraGenerator");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const eras = require('../../data/eras/default_eras.json');
describe('era.generator', () => {
    test('deterministic for same seed', () => {
        const template = eras[0];
        const a = (0, eraGenerator_1.generateEraFromTemplate)(template, { seed: 'seed1', playerId: 'p1', reincarnationCount: 1 });
        const b = (0, eraGenerator_1.generateEraFromTemplate)(template, { seed: 'seed1', playerId: 'p1', reincarnationCount: 1 });
        expect(a).toEqual(b);
    });
    test('different seed -> different era', () => {
        const template = eras[0];
        const a = (0, eraGenerator_1.generateEraFromTemplate)(template, { seed: 'seedA', playerId: 'p1', reincarnationCount: 1 });
        const b = (0, eraGenerator_1.generateEraFromTemplate)(template, { seed: 'seedB', playerId: 'p1', reincarnationCount: 1 });
        expect(a).not.toEqual(b);
    });
});
