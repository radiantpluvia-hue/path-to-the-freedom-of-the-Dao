import { _registryContains } from '../src/systems/passiveRegistry';
import { MAJOR_SECTS } from '../src/systems/SectSystem';

describe('Passive registry bespoke mapping', () => {
  test('generated manual passive ids map to bespoke passive definitions', () => {
    // Pick first sect and its first passive id
    const sect = MAJOR_SECTS[0];
    const pid = `${sect.id}_passive_1`;
    expect(_registryContains(pid)).toBe(true);
  });
});
