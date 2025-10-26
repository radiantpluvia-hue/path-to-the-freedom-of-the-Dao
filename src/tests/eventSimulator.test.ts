import { chooseByAffinity, simulateEventSelection, seededRng } from '@/utils/eventSimulator';
import template from '@/data/eventTemplates/destiny_affinity_template.json';

const event = template[0];

test('chooseByAffinity biases choices by affinity', () => {
  // high positive affinity should prefer 'help'
  const high = simulateEventSelection(event as any, 5, 500, seededRng(12345));
  // high should pick 'help' significantly more than 'harm'
  const helpHigh = high['help'] || 0;
  const harmHigh = high['harm'] || 0;
  expect(typeof helpHigh).toBe('number');
  expect(typeof harmHigh).toBe('number');
  expect(helpHigh).toBeGreaterThan(harmHigh);

  // high negative affinity should prefer 'harm'
  const low = simulateEventSelection(event as any, -5, 500, seededRng(54321));
  const helpLow = low['help'] || 0;
  const harmLow = low['harm'] || 0;
  expect(typeof helpLow).toBe('number');
  expect(typeof harmLow).toBe('number');
  expect(harmLow).toBeGreaterThan(helpLow);
});
