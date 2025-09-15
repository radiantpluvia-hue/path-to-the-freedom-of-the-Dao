import { EventExecutor } from '../../../utils/types';
import { act1EventExecutors } from './eventExecutors_act1';
import { act2EventExecutors } from './eventExecutors_act2';
import { act3EventExecutors } from './eventExecutors_act3';
import { act4EventExecutors } from './eventExecutors_act4';
import { act5EventExecutors } from './eventExecutors_act5';
import { act6EventExecutors } from './eventExecutors_act6';
import { act7EventExecutors } from './eventExecutors_act7';
import mentorRegistry from './eventExecutors_mentors';
import { globalExecutors } from './eventExecutors_global.registry';
import stubRegistry from './eventExecutors_stubs';

const merged: Record<string, EventExecutor> = {
  ...globalExecutors,
  ...act1EventExecutors,
  ...act2EventExecutors,
  ...act3EventExecutors,
  ...act4EventExecutors,
  ...act5EventExecutors,
  ...act6EventExecutors,
  ...act7EventExecutors,
  ...mentorRegistry,
  ...stubRegistry
};

const makeSafeStub = (id: string): EventExecutor => {
  return (state: any, _choice?: any) => {
    try {
      // non-destructive no-op that records that the executor ran
      state = { ...state };
      (state.__meta ||= { eventsRan: [] });
      if (!state.__meta.eventsRan.includes(id)) state.__meta.eventsRan.push(id);
    } catch (e) {
      // swallow intentionally
    }
    return state;
  };
};

export function getExecutor(id: string): EventExecutor {
  return merged[id] || makeSafeStub(id);
}

export const executorIds = Object.keys(merged);

export default merged;
