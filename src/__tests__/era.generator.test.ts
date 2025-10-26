import { generateEraFromTemplate } from '@/era/eraGenerator';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const eras = require('../../data/eras/default_eras.json');

describe('era.generator', () => {
  test('deterministic for same seed', () => {
    const template = eras[0];
    const a = generateEraFromTemplate(template, { seed: 'seed1', playerId: 'p1', reincarnationCount: 1 });
    const b = generateEraFromTemplate(template, { seed: 'seed1', playerId: 'p1', reincarnationCount: 1 });
    expect(a).toEqual(b);
  });
  test('different seed -> different era', () => {
    const template = eras[0];
    const a = generateEraFromTemplate(template, { seed: 'seedA', playerId: 'p1', reincarnationCount: 1 });
    const b = generateEraFromTemplate(template, { seed: 'seedB', playerId: 'p1', reincarnationCount: 1 });
    expect(a).not.toEqual(b);
  });
});
