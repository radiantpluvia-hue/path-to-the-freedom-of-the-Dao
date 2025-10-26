import { loreCodex } from '../systems/loreCodex';
import { worldState } from '../systems/worldState';

describe('LoreCodex basics', () => {
  beforeEach(() => { worldState.reset(); });

  test('add and list fragments', () => {
    const f = loreCodex.addFragment({ title: 'Old Echo', content: 'An echo of the past', era: 'Primordial', tags: ['echo'] });
    expect(f).toBeDefined();
    const list = loreCodex.listFragments({ era: 'Primordial' });
    expect(list.find(x => x.id === f.id)).toBeDefined();
  });

  test('astral wandering yields fragment on long sessions', () => {
    const session = { currentProgress: 300 } as any;
    // force success
    jest.spyOn(Math, 'random').mockReturnValue(0.1);
    const frag = loreCodex.tryAstralWander(session);
    expect(frag).toBeDefined();
    (Math.random as any).mockRestore();
  });
});
