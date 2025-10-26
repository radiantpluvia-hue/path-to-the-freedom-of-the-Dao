const path = require('path');
const { validateEvents } = require('../../scripts/verify/validateEvents.cjs');

test('event JSON files validate against minimal schema', () => {
  const root = path.resolve(__dirname, '../../');
  const errors = validateEvents(root);
  if (errors.length) {
    // pretty-print for developer
  const msg = errors.map((e: any) => JSON.stringify(e, null, 2)).join('\n');
    throw new Error('Event validation failed:\n' + msg);
  }
});
