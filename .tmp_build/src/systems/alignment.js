"use strict";
// Alignment system: canonical shape under player.alignment
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALIGNMENTS = exports.DEFAULT_AXES = void 0;
exports.axesToAlignment = axesToAlignment;
exports.setPlayerAlignment = setPlayerAlignment;
exports.shiftPlayerAxes = shiftPlayerAxes;
exports.axisDeltasForAction = axisDeltasForAction;
exports.onPlayerAction = onPlayerAction;
exports.getSectReactionForPlayer = getSectReactionForPlayer;
exports.DEFAULT_AXES = {
    virtue: 0,
    order: 0,
    independence: 0,
    ruthlessness: 0,
};
function clampAxis(v) {
    if (v > 100)
        return 100;
    if (v < -100)
        return -100;
    return Math.round(v);
}
exports.ALIGNMENTS = {
    neutral: {
        id: 'neutral',
        displayName: 'Neutral',
        description: 'Balanced or undecided path. No strong lean towards any extreme.',
        reputationModifier: 1,
        sectReactionModifiers: {},
        passiveTags: [],
    },
    righteous: {
        id: 'righteous',
        displayName: 'Righteous',
        description: 'Follows virtue and order. Helps others, defends the weak. Favored by orthodox sects.',
        reputationModifier: 1.1,
        sectReactionModifiers: {},
        passiveTags: ['honor_bound', 'sect_favored'],
        onBecome: (player) => {
            if (player.reputation !== undefined)
                player.reputation += 5;
        },
    },
    demonic: {
        id: 'demonic',
        displayName: 'Demonic',
        description: 'Seeks power above all. Uses forbidden methods; sects distrust or outlaw them.',
        reputationModifier: 0.8,
        sectReactionModifiers: {},
        passiveTags: ['bloodthirsty', 'forbidden_affinity'],
        onBecome: (player) => {
            if (player.reputation !== undefined)
                player.reputation -= 10;
        },
    },
    unorthodox: {
        id: 'unorthodox',
        displayName: 'Unorthodox',
        description: 'Follows a personal path. Uses unconventional techniques and moral flexibility.',
        reputationModifier: 0.95,
        sectReactionModifiers: {},
        passiveTags: ['wildcraft', 'unpredictable'],
    },
    antihero: {
        id: 'antihero',
        displayName: 'Antihero',
        description: 'Lone cultivator — pragmatic, distrusts sects and official systems; sometimes helps, sometimes harms.',
        reputationModifier: 0.9,
        sectReactionModifiers: {},
        passiveTags: ['lone_wolf', 'pragmatist'],
    },
};
function axesToAlignment(axes) {
    const righteousScore = axes.virtue * 1.2 + axes.order * 1.0 - axes.ruthlessness * 0.8;
    const demonicScore = axes.ruthlessness * 1.3 - axes.virtue * 1.0;
    const independenceScore = axes.independence * 1.2 + axes.virtue * 0.2 - axes.order * 0.3;
    const unorthodoxScore = axes.independence * 0.8 - axes.order * 0.7 + axes.ruthlessness * 0.1;
    const scores = {
        righteous: righteousScore,
        demonic: demonicScore,
        unorthodox: unorthodoxScore,
        antihero: independenceScore,
        neutral: 0,
    };
    const maxId = Object.keys(scores).reduce((best, key) => {
        const k = key;
        return scores[k] > scores[best] ? k : best;
    }, 'neutral');
    const maxScore = scores[maxId];
    if (maxScore < 15)
        return 'neutral';
    return maxId;
}
function setPlayerAlignment(player, newAxes) {
    const axes = {
        virtue: clampAxis(newAxes.virtue),
        order: clampAxis(newAxes.order),
        independence: clampAxis(newAxes.independence),
        ruthlessness: clampAxis(newAxes.ruthlessness),
    };
    const newId = axesToAlignment(axes);
    const prevId = player.alignment?.id ?? 'neutral';
    if (prevId !== newId) {
        const prev = exports.ALIGNMENTS[prevId];
        const next = exports.ALIGNMENTS[newId];
        try {
            prev?.onLeave?.(player);
            next?.onBecome?.(player);
        }
        catch (e) {
            // swallow errors; consider logging
            // console.error('Alignment hook error', e);
        }
    }
    player.alignment = {
        id: newId,
        axes,
        lastUpdatedAt: Date.now(),
    };
    if (player.reputation !== undefined) {
        const mod = exports.ALIGNMENTS[newId]?.reputationModifier ?? 1;
        player.reputation = Math.round((player.reputation || 0) * mod);
    }
    // Apply/remove alignment-derived passives
    try {
        // lazy import to avoid cycles
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const bridge = require('./AlignmentPassiveBridge');
        if (bridge && typeof bridge.applyAlignmentPassives === 'function') {
            const updated = bridge.applyAlignmentPassives(player);
            Object.assign(player, updated);
        }
    }
    catch (_e) { /* ignore */ }
}
function shiftPlayerAxes(player, deltas) {
    const current = player.alignment?.axes ?? { ...exports.DEFAULT_AXES };
    const updated = {
        virtue: clampAxis((current.virtue || 0) + (deltas.virtue || 0)),
        order: clampAxis((current.order || 0) + (deltas.order || 0)),
        independence: clampAxis((current.independence || 0) + (deltas.independence || 0)),
        ruthlessness: clampAxis((current.ruthlessness || 0) + (deltas.ruthlessness || 0)),
    };
    setPlayerAlignment(player, updated);
}
function axisDeltasForAction(action) {
    switch (action) {
        case 'help_innocent':
            return { virtue: +8, order: +2, ruthlessness: -4 };
        case 'punish_criminal':
            return { virtue: +4, order: +3, ruthlessness: +1 };
        case 'steal_qi':
            return { ruthlessness: +6, virtue: -5, independence: +1 };
        case 'use_forbidden_art':
            return { ruthlessness: +10, independence: +5, virtue: -8 };
        case 'refuse_sect_mission':
            return { independence: +6, order: -5 };
        case 'join_sect_mission':
            return { order: +6, independence: -3 };
        case 'kill_unarmed':
            return { ruthlessness: +15, virtue: -12, order: -4 };
        case 'save_rival':
            return { virtue: +7, independence: +1 };
        case 'betray_ally':
            return { ruthlessness: +8, independence: +4, virtue: -6 };
        default:
            return {};
    }
}
function onPlayerAction(player, action) {
    const deltas = axisDeltasForAction(action);
    shiftPlayerAxes(player, deltas);
    const alignmentId = player.alignment?.id ?? 'neutral';
    const passiveTags = exports.ALIGNMENTS[alignmentId]?.passiveTags ?? [];
    if (!player.passives && passiveTags.length)
        player.passives = [];
    if (passiveTags.length && player.passives)
        player.passives.push(...passiveTags.filter((t) => !player.passives.includes(t)));
    // Re-apply alignment passives after action-driven shift
    try {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const bridge = require('./AlignmentPassiveBridge');
        if (bridge && typeof bridge.applyAlignmentPassives === 'function') {
            const updated = bridge.applyAlignmentPassives(player);
            Object.assign(player, updated);
        }
    }
    catch (_e) { /* ignore */ }
    // After applying axis shifts and any passive tags, check for hidden background unlocks.
    try {
        // Import helper lazily to avoid cycles at module init
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { checkAndApplyAlignmentUnlocks } = require('./alignmentUnlocks');
        if (typeof checkAndApplyAlignmentUnlocks === 'function') {
            // Use the store to record story flags and to provide UI feedback
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const useGameStore = require('../store/useGameStore').useGameStore;
            // load friendly names and rules from alignmentUnlocks (lazy require to avoid cycles)
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { RACE_BACKGROUNDS } = require('../data/raceBackgrounds');
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            const { RULES } = require('./alignmentUnlocks');
            const state = useGameStore.getState ? useGameStore.getState() : null;
            const storyFlags = state && state.story ? state.story.storyFlags : undefined;
            const unlocked = checkAndApplyAlignmentUnlocks(player, storyFlags);
            if (unlocked && unlocked.length) {
                try {
                    let displayName = unlocked[0];
                    let description = '';
                    try {
                        // find matching background entry by id across races
                        for (const raceKey of Object.keys(RACE_BACKGROUNDS || {})) {
                            const arr = RACE_BACKGROUNDS[raceKey];
                            const found = arr && arr.find && arr.find((b) => b.id === unlocked[0]);
                            if (found) {
                                displayName = found.name || unlocked[0];
                                description = found.description || '';
                                break;
                            }
                        }
                    }
                    catch (e) { /* ignore */ }
                    // Build richer UX message: title + brief flavor
                    const titleMsg = `You have unlocked a new path: ${displayName}.`;
                    const flavor = description ? ` ${description}` : '';
                    if (state && typeof state.addEventLog === 'function')
                        state.addEventLog(titleMsg + flavor);
                    if (state && typeof state.showToast === 'function')
                        state.showToast(`${titleMsg}${flavor}`, 4500, 'success');
                    // persist canonical story flag using RULES mapping when available
                    if (useGameStore.setState && storyFlags) {
                        try {
                            let flagKey;
                            if (Array.isArray(RULES)) {
                                const r = RULES.find((rr) => rr.id === unlocked[0]);
                                if (r && r.flag)
                                    flagKey = r.flag;
                            }
                            if (!flagKey)
                                flagKey = (unlocked[0] === 'demon_demonic_cultivator') ? 'unlocked_demonic_cultivator' : (`unlocked_${unlocked[0]}`);
                            useGameStore.setState((s) => ({ story: { ...s.story, storyFlags: { ...(s.story.storyFlags || {}), [flagKey]: true } } }));
                        }
                        catch (e) { /* ignore */ }
                    }
                }
                catch (e) { /* ignore UI failures */ }
            }
        }
    }
    catch (e) {
        // ignore failures to avoid crashing action flow
    }
}
function getSectReactionForPlayer(player, sectId) {
    const alignmentId = player.alignment?.id ?? 'neutral';
    const base = exports.ALIGNMENTS[alignmentId]?.sectReactionModifiers?.[sectId] ?? 0;
    return base;
}
exports.default = {
    ALIGNMENTS: exports.ALIGNMENTS,
    DEFAULT_AXES: exports.DEFAULT_AXES,
    setPlayerAlignment,
    shiftPlayerAxes,
    onPlayerAction,
    axisDeltasForAction,
    axesToAlignment,
    getSectReactionForPlayer,
};
