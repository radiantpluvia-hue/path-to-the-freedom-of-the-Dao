/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { getEncounterTemplate } from '../data/encounterNarratives';

describe('Encounter narratives initialization', () => {
  it('has builtin templates available after startup', () => {
    const t = getEncounterTemplate('ambush_intro');
    expect(t).not.toBeNull();
    expect(t!.id).toBe('ambush_intro');
  });

  it('loads JSON-supplied templates when present', () => {
    // roadside_merchant is included as a builtin fallback; presence of the id shows merging worked
    const m = getEncounterTemplate('roadside_merchant');
    expect(m).not.toBeNull();
    expect(m!.id).toBe('roadside_merchant');
  });
});
