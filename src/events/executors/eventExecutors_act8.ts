import type { EventExecutor } from '../../../utils/types';

export const act8EventExecutors: Record<string, EventExecutor> = {
  exec_act8_e01: (state: any, choice?: any) => {
    try {
      const next = { ...state };
      (next.eventLog ||= []).push('You read the inscription and feel its hum.');
      // grant minor insight when studying
      if (choice === 'c_yes') {
        next.player = { ...(next.player || {}), insight: (next.player?.insight || 0) + 5 };
      }
      return next;
    } catch (e) {
      return state;
    }
  },
  exec_act8_e01_followup: (state: any, choice?: any) => {
    try {
      const next = { ...state };
      if (choice === 'c_endure') {
        next.player = { ...(next.player || {}), daoComprehension: (next.player?.daoComprehension || 0) + 2, insight: (next.player?.insight || 0) + 10 };
        (next.eventLog ||= []).push('Your comprehension deepens after enduring the mnemonic.');
      } else if (choice === 'c_flee') {
        (next.eventLog ||= []).push('You fled, haunted by the echo.');
        next.player = { ...(next.player || {}), karma: (next.player?.karma || 0) - 2 };
      }
      return next;
    } catch (e) {
      return state;
    }
  },
  exec_act8_e02: (state: any, choice?: any) => {
    try {
      const next = { ...state };
      if (choice === 'c_accept') {
        next.player = { ...(next.player || {}), spiritStones: { ...(next.player?.spiritStones || {}), low: (next.player?.spiritStones?.low || 0) + 2 } };
        (next.eventLog ||= []).push('A traveler rewards your kindness with spirit stones.');
      } else {
        (next.eventLog ||= []).push('You decline; the traveler nods and continues on.');
      }
      return next;
    } catch (e) {
      return state;
    }
  }
};

export default act8EventExecutors;
