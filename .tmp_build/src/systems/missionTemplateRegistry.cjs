"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMissionTemplate = registerMissionTemplate;
exports.getRegisteredMissionTemplate = getRegisteredMissionTemplate;
exports.clearMissionRegistry = clearMissionRegistry;
exports.listRegisteredTemplates = listRegisteredTemplates;
const registry = {};
function registerMissionTemplate(t) {
    if (!t || !t.id)
        return false;
    registry[t.id] = t;
    return true;
}
function getRegisteredMissionTemplate(id) {
    return registry[id] || null;
}
function clearMissionRegistry() {
    for (const k of Object.keys(registry))
        delete registry[k];
}
function listRegisteredTemplates() {
    return Object.values(registry);
}
// Seed with a couple of common templates (safe defaults for tests/dev)
registerMissionTemplate({ id: 'herb_collection', title: 'Herb Collection', description: 'Collect herbs for your sect.', type: 'gather', target: 'spirit_herbs', location: 'Misty Valley', difficulty: 'easy' });
registerMissionTemplate({ id: 'beast_core_hunt', title: 'Beast Core Hunt', description: 'Hunt beasts for cores.', type: 'defeat', target: 'shadow_wolves', location: 'Dark Forest', difficulty: 'medium' });
exports.default = {
    registerMissionTemplate,
    getRegisteredMissionTemplate,
    clearMissionRegistry,
    listRegisteredTemplates
};
