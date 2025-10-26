import { enqueueThought, peekThoughts, consumeThoughts, registerListener, clearThoughts, getQueueLength } from '../systems/InnerVoice';

describe('InnerVoice basic behavior', () => {
  const speaker = 'test_actor';
  beforeEach(() => { clearThoughts(speaker); });

  test('enqueue/peek/consume ordering and listener', () => {
    const heard: string[] = [];
    const unregister = registerListener(speaker, (t) => heard.push(t.text));

    enqueueThought(speaker, 'first', { importance: 1 });
    enqueueThought(speaker, 'second', { importance: 2 });
    enqueueThought(speaker, 'third', { importance: 1 });

    expect(getQueueLength(speaker)).toBe(3);

    const peeked = peekThoughts(speaker, 10).map(t => t.text);
    expect(peeked).toEqual(['first','second','third']);

    const consumed = consumeThoughts(speaker, 2).map(t => t.text);
    expect(consumed).toEqual(['first','second']);
    expect(heard).toEqual(['first','second','third']);

    unregister();
  });
});
