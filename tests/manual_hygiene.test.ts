import { act1EventExecutors } from '../src/events/executors/eventExecutors_act1';
import { act2EventExecutors } from '../src/events/executors/eventExecutors_act2';
import { act3EventExecutors } from '../src/events/executors/eventExecutors_act3';
import { act6EventExecutors } from '../utils/eventExecutors_act6';
import { act7EventExecutors } from '../src/events/eventExecutors_act7';

function hasDescriptionAndEffectOrPassive(obj: any): boolean {
  if (!obj) return false;
  const hasDesc = typeof obj.description === 'string' && obj.description.trim().length > 0;
  const hasEffects = obj.effects && typeof obj.effects === 'object' && Object.keys(obj.effects).length > 0;
  const hasPassive = typeof obj.passiveId === 'string' && obj.passiveId.trim().length > 0;
  return hasDesc && (hasEffects || hasPassive);
}

describe('Inline-created manuals hygiene', () => {
  test('act1 tutorial grants intro_meditation with description and effects', () => {
    const gs: any = { player: { manuals: [], inventory: [] }, world: {} };
    const out = act1EventExecutors['fn_act1_tutorial_welcome'](gs as any);
    const manuals = out.player.manuals || [];
    const m = manuals.find((x: any) => x && x.id === 'intro_meditation');
    expect(m).toBeDefined();
    expect(hasDescriptionAndEffectOrPassive(m)).toBeTruthy();
  });

  test('act2 mentor guidance grants mentor_basics with description and effects', () => {
    const gs: any = { player: { manuals: [], inventory: [] }, world: {} };
    const out = act2EventExecutors['fn_act2_mentor_guidance'](gs as any, {});
    const manuals = out.player.manuals || [];
    const m = manuals.find((x: any) => x && x.id === 'mentor_basics');
    expect(m).toBeDefined();
    expect(hasDescriptionAndEffectOrPassive(m)).toBeTruthy();
  });

  test('act3 spellbinders gathering grants spellbinders_note with description and effects', () => {
    const gs: any = { player: { manuals: [], inventory: [] }, world: {} };
    const out = act3EventExecutors['fn_act3_spellbinders_gathering'](gs as any, { choice: 'attend_and_learn' });
    const manuals = out.player.manuals || [];
    const m = manuals.find((x: any) => x && x.id === 'spellbinders_note');
    expect(m).toBeDefined();
    expect(hasDescriptionAndEffectOrPassive(m)).toBeTruthy();
  });

  test('act6 tutelage circle grants a manual fragment with description and effects', () => {
    const gs: any = { player: { manuals: [], inventory: [] }, world: {} };
    const out = act6EventExecutors['fn_act6_tutelage_circle'](gs as any);
    const manuals = out.player.manuals || [];
    const m = manuals.find((x: any) => x && x.id === 'manual_fragment');
    expect(m).toBeDefined();
    expect(hasDescriptionAndEffectOrPassive(m)).toBeTruthy();
  });

  test('act7 event grants celestial_manual in inventory with description and effects or passive', () => {
    const gs: any = { player: { manuals: [], inventory: [] }, world: {} };
    const out = act7EventExecutors['act7_event_1'](gs as any);
    const inv = out.player.inventory || [];
    const item = inv.find((i: any) => i && i.id === 'celestial_manual');
    expect(item).toBeDefined();
    expect(hasDescriptionAndEffectOrPassive(item)).toBeTruthy();
  });
});
