"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.allRecipes = exports.CULTIVATION_REALMS = exports.ALL_MANUALS = exports.PHYSIQUES = exports.ALL_BLOODLINES = exports.FORMATIONS = exports.ACTIVE_ABILITIES = exports.PASSIVES = exports.WEAPONS = void 0;
const weapons_1 = require("./weapons");
const passives_1 = require("./passives");
const more_active_abilities_1 = require("./skills/more_active_abilities");
const formations_1 = require("./formations");
var weapons_2 = require("./weapons");
Object.defineProperty(exports, "WEAPONS", { enumerable: true, get: function () { return weapons_2.WEAPONS; } });
var passives_2 = require("./passives");
Object.defineProperty(exports, "PASSIVES", { enumerable: true, get: function () { return passives_2.PASSIVES; } });
var more_active_abilities_2 = require("./skills/more_active_abilities");
Object.defineProperty(exports, "ACTIVE_ABILITIES", { enumerable: true, get: function () { return more_active_abilities_2.ACTIVE_ABILITIES; } });
var formations_2 = require("./formations");
Object.defineProperty(exports, "FORMATIONS", { enumerable: true, get: function () { return formations_2.FORMATIONS; } });
// Convenience default export for registries
exports.default = {
    WEAPONS: weapons_1.WEAPONS,
    PASSIVES: passives_1.PASSIVES,
    ACTIVE_ABILITIES: more_active_abilities_1.ACTIVE_ABILITIES,
    FORMATIONS: formations_1.FORMATIONS,
};
// Additional common data exports for public consumption
var bloodlines_fixed_1 = require("./bloodlines_fixed");
Object.defineProperty(exports, "ALL_BLOODLINES", { enumerable: true, get: function () { return bloodlines_fixed_1.ALL_BLOODLINES; } });
var physiques_1 = require("./physiques");
Object.defineProperty(exports, "PHYSIQUES", { enumerable: true, get: function () { return physiques_1.PHYSIQUES; } });
var manuals_1 = require("./manuals");
Object.defineProperty(exports, "ALL_MANUALS", { enumerable: true, get: function () { return manuals_1.ALL_MANUALS; } });
var cultivationRealms_1 = require("./cultivationRealms");
Object.defineProperty(exports, "CULTIVATION_REALMS", { enumerable: true, get: function () { return cultivationRealms_1.CULTIVATION_REALMS; } });
var craftingRecipes_1 = require("./craftingRecipes");
Object.defineProperty(exports, "allRecipes", { enumerable: true, get: function () { return craftingRecipes_1.allRecipes; } });
// Dev/editor seeds: if present, merge for editor tooling and data indexes. These are optional
// and wrapped in try/catch so CI/builds without the seeds do not fail.
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedEvents = require('../../data/events/seed_events.json');
    // attach to default export so simple editors can discover seed payloads
    module.exports.SEED_EVENTS = seedEvents;
}
catch (e) {
    // ignore missing dev seed pack
}
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedBatchBEvents = require('../../data/events/seed_batch_b_events.json');
    module.exports.SEED_BATCH_B_EVENTS = seedBatchBEvents;
}
catch (e) { /* ignore missing dev seed pack */ }
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedItems = require('../../data/items/seed_items.json');
    module.exports.SEED_ITEMS = seedItems;
}
catch (e) { /* ignore missing dev seed pack */ }
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedBatchBItems = require('../../data/items/seed_batch_b_items.json');
    module.exports.SEED_BATCH_B_ITEMS = seedBatchBItems;
}
catch (e) { /* ignore missing dev seed pack */ }
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedManuals = require('../../data/manuals/seed_manuals.json');
    module.exports.SEED_MANUALS = seedManuals;
}
catch (e) { /* ignore missing dev seed pack */ }
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedBatchBManuals = require('../../data/manuals/seed_batch_b_manuals.json');
    module.exports.SEED_BATCH_B_MANUALS = seedBatchBManuals;
}
catch (e) { /* ignore missing dev seed pack */ }
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedPassives = require('../../data/passives/seed_passives.json');
    module.exports.SEED_PASSIVES = seedPassives;
}
catch (e) { /* ignore missing dev seed pack */ }
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const seedBatchBPassives = require('../../data/passives/seed_batch_b_passives.json');
    module.exports.SEED_BATCH_B_PASSIVES = seedBatchBPassives;
}
catch (e) { /* ignore missing dev seed pack */ }
