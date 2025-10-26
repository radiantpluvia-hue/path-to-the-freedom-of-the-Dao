import { EventExecutor } from '../../../utils/types';

// Use loose any for sandbox executors to avoid strict GameState shape dependencies
const makeRecord = (id: string, message?: string): EventExecutor => {
  return (state: any, choice?: any) => {
    state = { ...state };
    state.eventLog = state.eventLog || [];
    state.eventLog.push({ id, message: message || `Ran ${id}`, choice });
    // simple sandbox effects: minor cultivation or items depending on id
    if (id.includes('breakthrough_success')) {
      state.player = { ...state.player, cultivation: { ...(state.player.cultivation || {}), stage: (state.player.cultivation?.stage || 0) + 1 } };
    }
    if (id.includes('trinket') || id.includes('relic')) {
      state.player = { ...state.player, inventory: [...(state.player.inventory || []), { id: `it_${id}`, name: `Item from ${id}`, description: `A sandbox item from ${id}` }] };
    }
    return state;
  };
};

export const sandboxEventExecutors: Record<string, EventExecutor> = {
  fn_sandbox_start: makeRecord('fn_sandbox_start', 'Player begins sandbox journey'),
  fn_sandbox_market: makeRecord('fn_sandbox_market'),
  fn_sandbox_shrine: makeRecord('fn_sandbox_shrine'),
  fn_sandbox_trinket: makeRecord('fn_sandbox_trinket'),
  fn_sandbox_contact: makeRecord('fn_sandbox_contact'),
  fn_sandbox_inner_awaken: makeRecord('fn_sandbox_inner_awaken'),
  fn_sandbox_train: makeRecord('fn_sandbox_train'),
  fn_sandbox_practice: makeRecord('fn_sandbox_practice'),
  fn_sandbox_rival_first: makeRecord('fn_sandbox_rival_first'),
  fn_sandbox_breakthrough_attempt: makeRecord('fn_sandbox_breakthrough_attempt'),
  fn_sandbox_breakthrough_success: makeRecord('fn_sandbox_breakthrough_success'),
  fn_sandbox_breakthrough_failure: makeRecord('fn_sandbox_breakthrough_failure'),
  fn_sandbox_trial_entry: makeRecord('fn_sandbox_trial_entry'),
  fn_sandbox_trial_reward: makeRecord('fn_sandbox_trial_reward'),
  fn_sandbox_relic: makeRecord('fn_sandbox_relic'),
  fn_sandbox_attune: makeRecord('fn_sandbox_attune'),
  fn_sandbox_mastery_path: makeRecord('fn_sandbox_mastery_path'),
  fn_sandbox_revenge_path: makeRecord('fn_sandbox_revenge_path'),
  fn_sandbox_rival_final: makeRecord('fn_sandbox_rival_final'),
  fn_sandbox_hub: makeRecord('fn_sandbox_hub'),
  fn_sandbox_world_explore: makeRecord('fn_sandbox_world_explore'),
  fn_sandbox_meet_sage: makeRecord('fn_sandbox_meet_sage'),
  fn_sandbox_mentor_path: makeRecord('fn_sandbox_mentor_path'),
  fn_sandbox_mastery_persist: makeRecord('fn_sandbox_mastery_persist'),
  fn_sandbox_ruins: makeRecord('fn_sandbox_ruins'),
  fn_sandbox_ruins_deep: makeRecord('fn_sandbox_ruins_deep'),
  fn_sandbox_epic_hook: makeRecord('fn_sandbox_epic_hook')
};

export default sandboxEventExecutors;
