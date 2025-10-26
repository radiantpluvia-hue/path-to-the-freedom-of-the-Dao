"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultCombatant = exports.applyCombatBuffs = exports.resolveRound = exports.calculateDamage = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- imports core systems intentionally for minigame UI */
const react_1 = require("react");
const skills_1 = require("./skills");
const registry_1 = require("../../data/registry");
const items_1 = require("./items");
const balance_1 = require("../../config/balance");
const useGameStore_1 = require("../../store/useGameStore");
const Tooltip_1 = __importDefault(require("../ui/Tooltip"));
const combatConfig_1 = require("../../systems/combatConfig");
const rng_1 = require("../../utils/rng");
const CombatSimulation = ({ difficulty = 'medium', player, rival, onComplete }) => {
    const [p, setP] = (0, react_1.useState)(() => ({ ...(0, combatConfig_1.defaultCombatant)('player', 'Player', difficulty), ...player }));
    const [r, setR] = (0, react_1.useState)(() => ({ ...(0, combatConfig_1.defaultCombatant)('rival', 'Rival', difficulty), ...rival }));
    const [inventory, setInventory] = (0, react_1.useState)(() => items_1.ITEM_CATALOG.slice(0, 8).map(i => i.id));
    const [_logs, setLogs] = (0, react_1.useState)([]);
    const store = (0, useGameStore_1.useGameStore)();
    const initialFromStore = (store.player && store.player.settings && store.player.settings.powerScalePercent);
    const [powerPercent, setPowerPercent] = (0, react_1.useState)(typeof initialFromStore === 'number' ? Math.round(initialFromStore) : Math.round((0, balance_1.getPowerScale)() * 100));
    const [round, setRound] = (0, react_1.useState)(1);
    const [finished, setFinished] = (0, react_1.useState)(false);
    (0, react_1.useEffect)(() => {
        if (!finished && (p.hp <= 0 || r.hp <= 0)) {
            setFinished(true);
            const winner = p.hp > 0 && r.hp <= 0 ? 'player' : r.hp > 0 && p.hp <= 0 ? 'rival' : 'draw';
            onComplete && onComplete({ winner });
        }
    }, [p.hp, r.hp, finished, onComplete]);
    const chooseRivalAction = (playerState, rivalState) => {
        if (rivalState.hp <= Math.floor(rivalState.maxHp * 0.25))
            return 'defend';
        const equipped = rivalState.equippedSkills || [];
        for (const sid of equipped) {
            const s = (0, skills_1.getSkillById)(sid);
            const cd = (rivalState.skillCooldowns && rivalState.skillCooldowns[sid]) || 0;
            if (s && cd === 0 && (rivalState.ap || 0) >= (s.cost.ap || 0) && (rivalState.qi || 0) >= (s.cost.qi || 0)) {
                return 'special';
            }
        }
        try {
            const rfn = (store && store.rng) ? store.rng : (0, rng_1.getRng)(store);
            const _sam = typeof rfn === 'function' ? rfn() : Math.random();
            if ((rivalState.specialCooldown || 0) === 0 && _sam < 0.15)
                return 'special';
        }
        catch (e) {
            if ((rivalState.specialCooldown || 0) === 0 && Math.random() < 0.15)
                return 'special';
        }
        return 'attack';
    };
    const applyBuffs = combatConfig_1.applyCombatBuffs;
    const takeAction = (playerAction) => {
        if (finished)
            return;
        const rivalAction = chooseRivalAction(p, r);
        const pBuffed = applyBuffs(p);
        const rBuffed = applyBuffs(r);
        const result = (0, combatConfig_1.resolveRound)(pBuffed, rBuffed, playerAction, rivalAction);
        const decCooldowns = (cds) => {
            const next = {};
            if (!cds)
                return next;
            Object.keys(cds).forEach(k => { next[k] = Math.max(0, (cds[k] || 0) - 1); });
            return next;
        };
        setP(prev => ({ ...prev, hp: result.player.hp, ap: (prev.ap || 0), qi: (prev.qi || 0), specialCooldown: result.player.specialCooldown, skillCooldowns: decCooldowns(prev.skillCooldowns) }));
        setR(prev => ({ ...prev, hp: result.rival.hp, specialCooldown: result.rival.specialCooldown, skillCooldowns: decCooldowns(prev.skillCooldowns) }));
        setLogs(prev => [...result.logs, `--- End of round ${round} ---`, ...prev].slice(0, 100));
        setRound(prev => prev + 1);
    };
    const performSkill = (skillId) => {
        if (finished)
            return;
        const skill = (0, skills_1.getSkillById)(skillId);
        if (!skill)
            return setLogs(prev => [`Unknown skill ${skillId}`, ...prev]);
        const cd = (p.skillCooldowns && p.skillCooldowns[skillId]) || 0;
        if (cd > 0)
            return setLogs(prev => [`Skill ${skill.name} is on cooldown (${cd})`, ...prev]);
        if ((p.ap || 0) < (skill.cost.ap || 0) || (p.qi || 0) < (skill.cost.qi || 0))
            return setLogs(prev => [`Not enough resources for ${skill.name}`, ...prev]);
        const rivalAction = chooseRivalAction(p, r);
        const pBuffed = applyBuffs(p);
        const rBuffed = applyBuffs(r);
        const performHit = (attacker, defender, label) => {
            const dmg = (0, combatConfig_1.calculateDamage)(attacker, defender, 'special');
            const newDef = { ...defender, hp: Math.max(0, defender.hp - dmg) };
            return { dmg, defender: newDef, log: `${attacker.name} ${label} ${defender.name} for ${dmg} damage.` };
        };
        const logsOut = [];
        const actor = { ...pBuffed, attack: Math.floor((pBuffed.attack || 0) + skill.power) };
        let target = { ...rBuffed };
        const firstIsPlayer = actor.speed >= target.speed;
        if (!firstIsPlayer) {
            if (rivalAction !== 'defend') {
                const rivalDmg = (0, combatConfig_1.calculateDamage)(target, actor, rivalAction);
                actor.hp = Math.max(0, actor.hp - rivalDmg);
                logsOut.push(`${target.name} ${rivalAction} ${actor.name} for ${rivalDmg} damage.`);
            }
            else {
                logsOut.push(`${target.name} defends before ${actor.name}'s technique.`);
            }
        }
        const mechanics = skill.mechanics || [];
        const multi = mechanics.find(m => m.type === 'multiHit');
        const chain = mechanics.find(m => m.type === 'chain');
        const conditional = mechanics.find(m => m.type === 'conditional');
        if (multi && (multi.hits || 0) > 1) {
            const hits = multi.hits || 2;
            for (let hi = 0; hi < hits; hi++) {
                const decay = 1 - Math.min(0.6, hi * 0.15);
                const tempActor = { ...actor, attack: Math.max(1, Math.floor((actor.attack || 1) * decay)) };
                const res = performHit(tempActor, target, `(multi-hit ${hi + 1}/${hits})`);
                target = res.defender;
                logsOut.push(res.log);
                if (target.hp <= 0)
                    break;
            }
        }
        else {
            const res = performHit(actor, target, 'strikes');
            target = res.defender;
            logsOut.push(res.log);
        }
        if (conditional && conditional.condition) {
            const m = conditional.condition.match(/target_below_(\d+)_?hp?/);
            if (m) {
                const pct = Number(m[1]);
                if (target.hp <= Math.floor((target.maxHp || 1) * (pct / 100))) {
                    const extra = Math.max(1, Math.floor(skill.power * 0.5));
                    target.hp = Math.max(0, target.hp - extra);
                    logsOut.push(`${actor.name} triggers conditional effect (${conditional.condition}) dealing ${extra} bonus damage.`);
                }
            }
        }
        if (chain && (chain.chainLength || 0) > 0 && target.hp > 0) {
            const chainLen = chain.chainLength || 1;
            for (let ci = 0; ci < chainLen; ci++) {
                const mult = 0.6;
                const tempActor = { ...actor, attack: Math.max(1, Math.floor((actor.attack || 1) * mult)) };
                const res = performHit(tempActor, target, `(chain ${ci + 1}/${chainLen})`);
                target = res.defender;
                logsOut.push(res.log);
                if (target.hp <= 0)
                    break;
            }
        }
        if (firstIsPlayer) {
            if (target.hp > 0) {
                if (rivalAction === 'defend') {
                    logsOut.push(`${target.name} defends in response.`);
                }
                else {
                    const dmg = (0, combatConfig_1.calculateDamage)(target, actor, rivalAction);
                    actor.hp = Math.max(0, actor.hp - dmg);
                    logsOut.push(`${target.name} ${rivalAction} ${actor.name} for ${dmg} damage.`);
                }
            }
        }
        const nextPcds = { ...(p.skillCooldowns || {}) };
        nextPcds[skillId] = skill.cooldown;
        Object.keys(nextPcds).forEach(k => { nextPcds[k] = Math.max(0, (nextPcds[k] || 0) - 1); });
        const nextRcds = { ...(r.skillCooldowns || {}) };
        Object.keys(nextRcds).forEach(k => { nextRcds[k] = Math.max(0, (nextRcds[k] || 0) - 1); });
        setP(prev => ({ ...prev, hp: actor.hp, ap: Math.max(0, (prev.ap || 0) - (skill.cost?.ap || 0)), qi: Math.max(0, (prev.qi || 0) - (skill.cost?.qi || 0)), skillCooldowns: nextPcds }));
        setR(prev => ({ ...prev, hp: target.hp, skillCooldowns: nextRcds }));
        setLogs(prev => [...logsOut, `Used skill: ${skill.name}`, `--- End of round ${round} ---`, ...prev].slice(0, 200));
        setRound(prev => prev + 1);
    };
    const _conjureFormation = (formationId) => {
        if (finished)
            return;
        const f = (0, registry_1.getFormationById)(formationId);
        if (!f)
            return;
        setP(prev => ({ ...prev, activeFormationId: formationId }));
        setLogs(prev => [`Conjured formation: ${f.name}`, ...prev]);
    };
    const equipItem = (itemId) => {
        const it = (0, items_1.getItemById)(itemId);
        if (!it)
            return setLogs(prev => [`Cannot equip unknown item ${itemId}`, ...prev]);
        setP(prev => ({ ...prev, equipment: { ...prev.equipment, [it.slot]: itemId } }));
        setInventory(prev => prev.filter(id => id !== itemId));
        setLogs(prev => [`Equipped ${it.name}`, ...prev]);
    };
    const unequipItem = (slot) => {
        setP(prev => {
            const itemId = prev.equipment ? prev.equipment[slot] : undefined;
            if (!itemId)
                return prev;
            setInventory(inv => [itemId, ...inv]);
            const nextEquip = { ...(prev.equipment || {}) };
            delete nextEquip[slot];
            setLogs(prevLogs => [`Unequipped ${itemId}`, ...prevLogs]);
            return { ...prev, equipment: nextEquip };
        });
    };
    const _attemptEscape = () => {
        if (finished)
            return;
        const chance = Math.min(0.75, 0.15 + (p.speed - r.speed) * 0.02);
        try {
            const rfn = (store && store.rng) ? store.rng : (0, rng_1.getRng)(store);
            const _sam = typeof rfn === 'function' ? rfn() : Math.random();
            if (_sam < chance) {
                setFinished(true);
                onComplete && onComplete({ winner: 'player' });
                setLogs(prev => ['Escape successful!', ...prev]);
            }
            else {
                setLogs(prev => ['Escape attempt failed.', ...prev]);
                takeAction('defend');
            }
        }
        catch (e) {
            if (Math.random() < chance) {
                setFinished(true);
                onComplete && onComplete({ winner: 'player' });
                setLogs(prev => ['Escape successful!', ...prev]);
            }
            else {
                setLogs(prev => ['Escape attempt failed.', ...prev]);
                takeAction('defend');
            }
        }
    };
    const _openInventory = () => {
        setLogs(prev => ['Opened inventory (placeholder).', ...prev]);
    };
    // Use intentionally-unused helpers to keep imports/definitions from being flagged
    // This has no runtime effect; it simply references them so ESLint treats them as used.
    void registry_1.getFormations;
    void _conjureFormation;
    void _attemptEscape;
    void _openInventory;
    void _logs;
    return ((0, jsx_runtime_1.jsxs)("div", { className: "mini-game combat-simulation", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Martial Clash \u2014 Cultivation Simulation" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 24 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { children: p.name }), (0, jsx_runtime_1.jsxs)("p", { children: ["HP: ", p.hp, " / ", p.maxHp] }), (0, jsx_runtime_1.jsxs)("p", { children: ["ATK: ", p.attack, " DEF: ", p.defense, " SPD: ", p.speed] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h4", { children: r.name }), (0, jsx_runtime_1.jsxs)("p", { children: ["HP: ", r.hp, " / ", r.maxHp] }), (0, jsx_runtime_1.jsxs)("p", { children: ["ATK: ", r.attack, " DEF: ", r.defense, " SPD: ", r.speed] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 8 }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { display: 'block', fontSize: 12 }, children: ["Global Power Scale: ", powerPercent, "%"] }), (0, jsx_runtime_1.jsx)("input", { type: "range", min: 1, max: 100, value: powerPercent, onChange: (e) => { const v = Number(e.target.value); setPowerPercent(v); (0, balance_1.setPowerScalePercent)(v); setLogs(prev => [`Power scale set to ${v}%`, ...prev]); }, style: { width: '100%' } })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Equipped Skills (up to 8):" }), (0, jsx_runtime_1.jsx)("div", { children: (p.equippedSkills || []).slice(0, 8).map((id, i) => {
                                    const s = (0, skills_1.getSkillById)(id);
                                    const cd = (p.skillCooldowns && p.skillCooldowns[id]) || 0;
                                    return ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: 6 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => performSkill(id), disabled: Boolean(finished || cd > 0 || (((p.ap || 0) === 0) && (s && (s.cost.ap || 0) > 0))), children: s ? s.name : id }), ' ', (0, jsx_runtime_1.jsx)("small", { children: s ? ((0, jsx_runtime_1.jsxs)(jsx_runtime_1.Fragment, { children: [(0, jsx_runtime_1.jsx)("span", { style: { marginRight: 6 }, children: `(${(0, skills_1.getUITierLabel)(s.tier)}) AP ${s.cost.ap || 0} QI ${s.cost.qi || 0} CD ${s.cooldown}` }), (0, jsx_runtime_1.jsx)(Tooltip_1.default, { content: (0, skills_1.getUITierRealms)(s.tier).map(r => r.name).join(' / '), children: (0, jsx_runtime_1.jsx)("small", { style: { textDecoration: 'underline', cursor: 'help' }, children: "?" }) })] })) : '' }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsxs)("small", { children: ["Cooldown: ", cd] }) })] }, i));
                                }) }), (0, jsx_runtime_1.jsx)("small", { children: "Learn up to 8 techniques; invoke a technique to expend AP/QI and trigger its cooldown." }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Imprints (Bloodlines / Physique / Manuals):" }), (0, jsx_runtime_1.jsx)("ul", { children: (p.passiveIds || []).slice(0, 10).map((pid, i) => {
                                            const pass = (0, registry_1.getPassiveById)(pid);
                                            return (0, jsx_runtime_1.jsx)("li", { children: pass ? `${pass.name} (${(0, skills_1.getUITierLabel)(pass.tier)})` : pid }, i);
                                        }) }), (0, jsx_runtime_1.jsx)("small", { children: "Imprints are lingering cultivation echoes: bloodline legacies, physique traits, and manual inscriptions." })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Active Array:" }), (0, jsx_runtime_1.jsx)("div", { children: p.activeFormationId ? ((0, registry_1.getFormationById)(p.activeFormationId)?.name || p.activeFormationId) : 'None' })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Artifacts & Garb:" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 12, flexWrap: 'wrap' }, children: Object.keys((p.equipment || {})).map((slot) => {
                                            const sid = (p.equipment || {})[slot];
                                            const it = sid ? (0, items_1.getItemById)(sid) : undefined;
                                            return ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid #ccc', padding: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("strong", { children: slot }) }), (0, jsx_runtime_1.jsx)("div", { children: it ? it.name : 'empty' }), it && (0, jsx_runtime_1.jsx)("button", { onClick: () => unequipItem(slot), children: "Unequip" })] }, slot));
                                        }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Satchel:" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 8, flexWrap: 'wrap' }, children: inventory.map(id => {
                                            const it = (0, items_1.getItemById)(id);
                                            return ((0, jsx_runtime_1.jsxs)("div", { style: { border: '1px solid #ddd', padding: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { children: it ? it.name : id }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("small", { children: it?.description }) }), (0, jsx_runtime_1.jsx)("div", { children: (0, jsx_runtime_1.jsx)("button", { onClick: () => equipItem(id), children: "Wield / Wear" }) })] }, id));
                                        }) })] })] }), finished && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Result:" }), " ", p.hp > 0 && r.hp <= 0 ? 'Player wins' : r.hp > 0 && p.hp <= 0 ? 'Rival wins' : 'Draw'] }))] })] }));
};
var combatConfig_2 = require("../../systems/combatConfig");
Object.defineProperty(exports, "calculateDamage", { enumerable: true, get: function () { return combatConfig_2.calculateDamage; } });
Object.defineProperty(exports, "resolveRound", { enumerable: true, get: function () { return combatConfig_2.resolveRound; } });
Object.defineProperty(exports, "applyCombatBuffs", { enumerable: true, get: function () { return combatConfig_2.applyCombatBuffs; } });
Object.defineProperty(exports, "defaultCombatant", { enumerable: true, get: function () { return combatConfig_2.defaultCombatant; } });
exports.default = CombatSimulation;
