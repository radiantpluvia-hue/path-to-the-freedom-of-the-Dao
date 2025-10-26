/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { useGameStore } from '../store/useGameStore';
import { resolvePlannedEncountersAndMaybeInterrupt, resolveActiveEncounterOutcome } from '../systems/TravelEncounterSystem';
import { getEncounterTemplate } from '../data/encounterNarratives';

describe('Encounter branching and branchState persistence', () => {
  beforeEach(() => {
    // clear store activeEncounter and travel
    try { (useGameStore as any).setState({ player: { ...useGameStore.getState().player, activeEncounter: null, activeTravel: null, lastPlannedTravel: null } }); } catch (e) {}
  });

  it('records a choice into branchState when a choice is made', () => {
    const store = useGameStore.getState();
    // prepare an activeEncounter with a template id
    const ae = {
      encounterId: 'ambush_intro',
      startedAtTick: store.world.tick,
      meta: {},
      branchState: { currentTemplateId: 'ambush_intro', choiceHistory: [] }
    };
    useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: ae } } as any));

    const choice = { id: 'fight_now', text: 'Fight', consequence: 'combat' };

    // Simulate what EncounterModal.handleChoice does: append to history and update currentTemplateId
    const st = useGameStore.getState();
    const cur: any = st.player.activeEncounter;
    const newHist = (cur.branchState?.choiceHistory || []).concat([{ choiceId: choice.id, templateId: cur.branchState?.currentTemplateId, consequence: choice.consequence }]);
    const nextTid = (choice as any).nextTemplateId || null;
    const newBranch = { ...(cur.branchState || {}), currentTemplateId: nextTid, choiceHistory: newHist };
    useGameStore.setState(state => ({ player: { ...state.player, activeEncounter: { ...cur, branchState: newBranch } } } as any));

  const after = useGameStore.getState();
  expect(after.player.activeEncounter).not.toBeNull();
  expect(after.player.activeEncounter!.branchState).not.toBeNull();
  expect(after.player.activeEncounter!.branchState!.choiceHistory!.length).toBe(1);
  expect(after.player.activeEncounter!.branchState!.choiceHistory![0].choiceId).toBe('fight_now');
  });

  it('resolveActiveEncounterOutcome clears encounter and can resume travel', () => {
    const store = useGameStore.getState();
    // set a lastPlannedTravel and activeEncounter
    useGameStore.setState(state => ({ player: { ...state.player, lastPlannedTravel: { toNodeId: 'dest1', opts: { mode: 'walk' } }, activeEncounter: { encounterId: 'roadside_merchant', startedAtTick: store.world.tick } } } as any));

    // spy on startTravel to detect resume
    let resumed = false;
    (useGameStore.getState() as any).startTravel = (toNodeId: string | null, opts: any) => { resumed = true; return null; };

    resolveActiveEncounterOutcome({ success: true, resumeTravel: true });
  const after = useGameStore.getState();
  expect(after.player.activeEncounter).toBeNull();
    expect(resumed).toBe(true);
  });
});
