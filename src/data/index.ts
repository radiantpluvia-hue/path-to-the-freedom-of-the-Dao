import { WEAPONS } from './weapons';
import { PASSIVES } from './passives';
import { ACTIVE_ABILITIES } from './skills/more_active_abilities';
import { FORMATIONS } from './formations';

export { WEAPONS } from './weapons';
export { PASSIVES } from './passives';
export { ACTIVE_ABILITIES } from './skills/more_active_abilities';
export { FORMATIONS } from './formations';

// Convenience default export for registries
export default {
  WEAPONS,
  PASSIVES,
  ACTIVE_ABILITIES,
  FORMATIONS,
};

// Additional common data exports for public consumption
export { ALL_BLOODLINES } from './bloodlines_fixed';
export { PHYSIQUES } from './physiques';
export { ALL_MANUALS } from './manuals';
export { CULTIVATION_REALMS } from './cultivationRealms';
export { allRecipes } from './craftingRecipes';

// Dev/editor seeds: if present, merge for editor tooling and data indexes. These are optional
// and wrapped in try/catch so CI/builds without the seeds do not fail.
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedEvents = require('../../data/events/seed_events.json');
  // attach to default export so simple editors can discover seed payloads
  (module.exports as any).SEED_EVENTS = seedEvents;
} catch (e) {
  // ignore missing dev seed pack
}

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedBatchBEvents = require('../../data/events/seed_batch_b_events.json');
  (module.exports as any).SEED_BATCH_B_EVENTS = seedBatchBEvents;
} catch (e) { /* ignore missing dev seed pack */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedItems = require('../../data/items/seed_items.json');
  (module.exports as any).SEED_ITEMS = seedItems;
} catch (e) { /* ignore missing dev seed pack */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedBatchBItems = require('../../data/items/seed_batch_b_items.json');
  (module.exports as any).SEED_BATCH_B_ITEMS = seedBatchBItems;
} catch (e) { /* ignore missing dev seed pack */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedManuals = require('../../data/manuals/seed_manuals.json');
  (module.exports as any).SEED_MANUALS = seedManuals;
} catch (e) { /* ignore missing dev seed pack */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedBatchBManuals = require('../../data/manuals/seed_batch_b_manuals.json');
  (module.exports as any).SEED_BATCH_B_MANUALS = seedBatchBManuals;
} catch (e) { /* ignore missing dev seed pack */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedPassives = require('../../data/passives/seed_passives.json');
  (module.exports as any).SEED_PASSIVES = seedPassives;
} catch (e) { /* ignore missing dev seed pack */ }

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const seedBatchBPassives = require('../../data/passives/seed_batch_b_passives.json');
  (module.exports as any).SEED_BATCH_B_PASSIVES = seedBatchBPassives;
} catch (e) { /* ignore missing dev seed pack */ }
