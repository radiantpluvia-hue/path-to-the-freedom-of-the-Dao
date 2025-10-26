"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkAndApplyAlignmentUnlocks = checkAndApplyAlignmentUnlocks;
// Ordered rules: earlier rules have precedence when multiple match
const RULES = [
    {
        id: 'demon_demonic_cultivator',
        name: 'Demonic Cultivator',
        predicate: (p) => {
            const align = p.alignment?.id;
            if (align === 'demonic')
                return true;
            const r = p.alignment?.axes?.ruthlessness ?? 0;
            return r >= 60;
        },
        flag: 'unlocked_demonic_cultivator'
    },
    {
        id: 'human_antihero',
        name: 'Antihero',
        // Treat antihero as an alignment milestone only; do not set player.background.
        treatAsAlignment: true,
        predicate: (p) => {
            const axes = p.alignment?.axes;
            if (!axes)
                return false;
            return (axes.independence || 0) >= 40 && (axes.virtue || 0) <= -10;
        },
        flag: 'unlocked_antihero'
    },
    {
        id: 'human_rogue_roaming',
        name: 'Rogue Cultivator',
        treatAsAlignment: true,
        predicate: (p) => {
            const axes = p.alignment?.axes;
            if (!axes)
                return false;
            return (axes.independence || 0) >= 60 && (axes.order || 0) <= -20;
        },
        flag: 'unlocked_rogue_roaming'
    }
];
// Apply rules to a player and optional storyFlags object. Returns list of unlocked ids.
function checkAndApplyAlignmentUnlocks(player, storyFlags) {
    const unlocked = [];
    try {
        if (!player)
            return unlocked;
        for (const rule of RULES) {
            try {
                if (rule.predicate(player)) {
                    // If this rule is an alignment milestone only, do not set a background.
                    if (rule.treatAsAlignment) {
                        if (storyFlags && rule.flag)
                            storyFlags[rule.flag] = true;
                        // Also emit unlocked id for UI/display logic but avoid mutating player.background
                        unlocked.push(rule.id);
                        // stop after first match to enforce precedence
                        break;
                    }
                    // Otherwise, behave as legacy: set background if it's different
                    if (!player.background || player.background.id !== rule.id) {
                        player.background = { id: rule.id, name: rule.name || rule.id };
                        if (storyFlags && rule.flag)
                            storyFlags[rule.flag] = true;
                        unlocked.push(rule.id);
                        // stop after first match to enforce precedence
                        break;
                    }
                }
            }
            catch (e) {
                // ignore predicate errors for robustness
            }
        }
    }
    catch (e) {
        // noop
    }
    return unlocked;
}
exports.default = { RULES, checkAndApplyAlignmentUnlocks };
