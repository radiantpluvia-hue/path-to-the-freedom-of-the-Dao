"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CultivationUI = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- imports core systems intentionally */
const react_1 = require("react");
const useGameStore_1 = require("../store/useGameStore");
const attemptHelpers_1 = require("../utils/attemptHelpers");
const BreakthroughSystem_1 = require("../systems/BreakthroughSystem");
const cultivationRealms_1 = require("../data/cultivationRealms");
const playerHelpers_1 = require("../utils/playerHelpers");
const realmHelpersLoader_1 = require("../utils/realmHelpersLoader");
const cultivationMechanics_1 = require("../../cultivationMechanics");
const tribulationPatterns_1 = require("@/utils/tribulationPatterns");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
const CultivationUI = ({ onClose }) => {
    const store = (0, useGameStore_1.useGameStore)();
    const { player, updatePlayerState, addEventLog, setUIProperty: _setUIProperty } = store;
    const [breakthroughSystem] = (0, react_1.useState)(() => new BreakthroughSystem_1.BreakthroughSystem());
    const [showBreakthroughPicker, setShowBreakthroughPicker] = (0, react_1.useState)(false);
    const [availableChallenges, setAvailableChallenges] = (0, react_1.useState)([]);
    const [minorStageInfo, setMinorStageInfo] = (0, react_1.useState)(null);
    const [showConfirmAttempt, setShowConfirmAttempt] = (0, react_1.useState)(false);
    const [pendingChallenge, setPendingChallenge] = (0, react_1.useState)(null);
    // Cultivation allocation state
    const [_allocatedDays, _setAllocatedDays] = (0, react_1.useState)(player.cultivationDaysAllocated || 0);
    const realmKey = (0, realmHelpersLoader_1.getRealmKeyFromPlayerSync)(player);
    const currentRealm = realmKey ? cultivationRealms_1.CULTIVATION_REALMS[realmKey] : null;
    const nextRealm = currentRealm?.nextRealm ? cultivationRealms_1.CULTIVATION_REALMS[currentRealm.nextRealm] : null;
    const realmDifficulty = currentRealm?.breakthroughDifficulty || 1;
    const patternPreview = realmKey ? (0, tribulationPatterns_1.pickPattern)(realmDifficulty) : null;
    // Manual gating: require at least one cultivation manual to attempt breakthroughs
    const hasManual = Array.isArray(player.manuals) && player.manuals.length > 0;
    const isCultivating = !!(store.ui && store.ui.isCultivating);
    // Calculate remaining lifespan in minutes
    const remainingLifespanYears = (player.lifespan || 150) - (player.age || 16);
    const remainingLifespanDays = remainingLifespanYears * 365;
    const remainingLifespanMinutes = remainingLifespanDays * 1440;
    const _maxSessionMinutes = Math.min(525600, remainingLifespanMinutes); // 365 days max
    // Mark some imported helpers and intentionally-unused local bindings in this UI to avoid noisy warnings
    // (they're referenced in other code paths or intended for future features)
    void cultivationMechanics_1.calculateCultivationSpeed;
    void cultivationMechanics_1.generateCultivationSession;
    void cultivationMechanics_1.getApplicableModifiers;
    void tribulationPatterns_1.resolvePatternTribulation;
    // Referencing these intentionally-unused bindings prevents ESLint from reporting them as unused
    void _setUIProperty;
    void _allocatedDays;
    void _setAllocatedDays;
    void _maxSessionMinutes;
    (0, react_1.useEffect)(() => {
        const stageInfo = breakthroughSystem.getMinorStageInfo(realmKey, player.minorStage || 1);
        setMinorStageInfo(stageInfo);
    }, [realmKey, player.minorStage, breakthroughSystem]);
    const handleBreakthrough = () => {
        if (!realmKey || !minorStageInfo)
            return;
        const currentStage = player.minorStage || 1;
        const maxStage = minorStageInfo.maxStage;
        // Check if we can breakthrough to next stage
        if (currentStage < maxStage) {
            // Minor breakthrough - always succeeds if player has enough Qi
            if (player.currentQi >= minorStageInfo.qiRequired) {
                const newStage = currentStage + 1;
                updatePlayerState({
                    minorStage: newStage,
                    currentQi: Math.max(0, player.currentQi - minorStageInfo.qiRequired)
                });
                addEventLog(`Successfully advanced to ${currentRealm?.name} stage ${newStage}!`);
            }
            else {
                addEventLog(`Insufficient Qi: ${player.currentQi}/${minorStageInfo.qiRequired}`);
            }
        }
        else {
            // Major realm breakthrough attempt is handled by store rules (gates on Qi/manuals)
            if (currentRealm?.nextRealm) {
                // Instead of immediately calling the store gate, present a challenge picker so the player can select
                const rk = realmKey;
                const challenges = store.breakthroughSystem?.getAvailableChallenges?.(rk) || breakthroughSystem.getAvailableChallenges(rk) || [];
                setAvailableChallenges(Array.isArray(challenges) ? challenges : []);
                setShowBreakthroughPicker(true);
            }
            else {
                addEventLog('Already at the highest realm!');
            }
        }
    };
    const getStageProgress = () => {
        if (!minorStageInfo)
            return 0;
        return Math.min(100, (player.currentQi / minorStageInfo.qiRequired) * 100);
    };
    const getStabilityColor = (stability) => {
        if (stability >= 80)
            return '#16a34a';
        if (stability >= 60)
            return '#ca8a04';
        if (stability >= 40)
            return '#ea580c';
        return '#dc2626';
    };
    // Consolidation estimate helpers (mirror store logic for display)
    const consolidationThreshold = 3; // ticks
    const getTicksSpent = () => {
        const startTick = player.cultivationStartTick || 0;
        const ticks = Math.max(0, (store.world?.tick || 0) - startTick);
        return ticks;
    };
    const getConsolidationFactor = () => {
        const ticks = getTicksSpent();
        return Math.min(1, ticks / consolidationThreshold);
    };
    const getEstimatedPenalty = () => {
        const factor = getConsolidationFactor();
        const daoHeart = player.daoHeart || 0;
        return Math.floor((1 - factor) * daoHeart);
    };
    const isPenaltyCatastrophic = (penalty) => {
        const dao = player.daoHeart || 0;
        // catastrophic if penalty removes >= 50% of daoHeart
        return dao > 0 && penalty >= Math.ceil(dao * 0.5);
    };
    const attemptChallenge = (challengeId, force = false) => {
        const penalty = getEstimatedPenalty();
        if (!force && isPenaltyCatastrophic(penalty)) {
            setPendingChallenge(challengeId);
            setShowConfirmAttempt(true);
            return;
        }
        try {
            (0, attemptHelpers_1.performBreakthroughAttempt)(challengeId);
        }
        catch (e) { /* no-op */ }
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9000
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                background: 'var(--dark)',
                border: '2px solid var(--primary)',
                borderRadius: '12px',
                padding: '20px',
                maxWidth: '640px',
                width: '90%',
                maxHeight: '80vh',
                overflowY: 'auto',
                opacity: 1
            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsx)("h2", { style: { color: 'var(--primary)', margin: 0 }, children: "\uD83E\uDDD8 Cultivation Progress" }), (0, jsx_runtime_1.jsx)("button", { onClick: onClose, style: {
                                background: 'none',
                                border: 'none',
                                color: 'var(--text)',
                                fontSize: '24px',
                                cursor: 'pointer'
                            }, children: "\u00D7" })] }), showBreakthroughPicker && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8900, backgroundColor: 'rgba(0,0,0,0.6)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 560, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0 }, children: "Choose a Breakthrough Challenge" }), (0, jsx_runtime_1.jsx)("p", { style: { color: 'var(--muted)' }, children: "Select a breakthrough challenge to attempt. Consolidation penalties will be applied automatically based on recent cultivation speed." }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: 8, marginTop: 12 }, children: availableChallenges && availableChallenges.length ? (availableChallenges.map((c) => ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 12, borderRadius: 6, background: 'rgba(255,255,255,0.02)', display: 'flex', gap: 12 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 'bold' }, children: c.name || c.id }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: ["Difficulty: ", Math.round(c.difficulty || 0)] })] }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem', marginTop: 6 }, children: c.description }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 12, marginTop: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }, children: "Requirements" }), c.requirements && c.requirements.skills ? Object.entries(c.requirements.skills).map(([sk, val]) => (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: `${sk}: ${val}` }, sk)) : (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "None" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { width: 180 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.85rem', color: 'var(--muted)', fontWeight: '600' }, children: "Risks" }), c.risks && c.risks.length ? c.risks.map((r, i) => (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '0.9rem' }, children: r }, i)) : (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: "Minor" })] })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', alignItems: 'center' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => { setShowBreakthroughPicker(false); attemptChallenge(c.id); }, style: { padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Attempt" }) }) })] }, c.id)))) : ((0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "No breakthrough challenges available. Improve your cultivation foundation or attempt minor stage advancement." })) }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', justifyContent: 'flex-end', marginTop: 12 }, children: (0, jsx_runtime_1.jsx)("button", { onClick: () => setShowBreakthroughPicker(false), style: { padding: 0, border: 'none', background: 'transparent', cursor: 'pointer' }, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Close" }) }) })] }) })), showConfirmAttempt && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 8950, backgroundColor: 'rgba(0,0,0,0.7)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 460, background: 'var(--card-bg)', borderRadius: 8, padding: 18, border: '1px solid rgba(255,255,255,0.06)' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { marginTop: 0 }, children: "Confirm Risky Attempt" }), (0, jsx_runtime_1.jsxs)("p", { style: { color: 'var(--muted)' }, children: ["The consolidation penalty is high. Attempting now will cost ", (0, jsx_runtime_1.jsx)("strong", { children: getEstimatedPenalty() }), " Dao Heart. Proceed only if you accept this loss."] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => { setShowConfirmAttempt(false); setPendingChallenge(null); }, style: { padding: '8px 12px' }, children: "Cancel" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => { setShowConfirmAttempt(false); if (pendingChallenge)
                                            attemptChallenge(pendingChallenge, true); setPendingChallenge(null); }, style: { padding: '8px 12px', background: 'var(--accent)', color: 'white', border: 'none', borderRadius: 4 }, children: "Proceed" })] })] }) })), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '24px', padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--primary)', marginTop: 0 }, children: currentRealm?.name || 'Unknown Realm' }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Stage:" }), ' ', (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Current stage: ${player.minorStage || 1}\nTotal minor stages in this realm: ${minorStageInfo?.maxStage || 1}\nComplete all minor stages to attempt a realm breakthrough.`, children: (0, jsx_runtime_1.jsxs)("span", { style: { textDecoration: 'underline dotted', cursor: 'help' }, children: [player.minorStage || 1, " / ", minorStageInfo?.maxStage || 1] }) })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Stability:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: getStabilityColor(player.stability || 0), marginLeft: '4px' }, children: [player.stability || 0, "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Qi Progress:" }), " ", player.currentQi, " / ", minorStageInfo?.qiRequired || 0] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Dao Heart:" }), " ", player.daoHeart || 0] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '12px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        height: '8px',
                                        overflow: 'hidden'
                                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                                            height: '100%',
                                            width: `${getStageProgress()}%`,
                                            transition: 'width 0.3s ease'
                                        } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }, children: ["Stage Progress: ", getStageProgress().toFixed(1), "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '24px', padding: '16px', background: 'rgba(147,51,234,0.1)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: '#a855f7', marginTop: 0 }, children: "\uD83D\uDD2E Cultivation Insights" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Insight Points:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: '#a855f7', marginLeft: '4px' }, children: player.insightPoints || 0 })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Next Realm Cost:" }), (0, jsx_runtime_1.jsx)("span", { style: { color: (0, realmHelpersLoader_1.canAdvanceRealm)(player) ? '#10b981' : '#ef4444', marginLeft: '4px' }, children: (0, realmHelpersLoader_1.costForNextRealm)((0, playerHelpers_1.getPlayerRealmId)(player) || 1) })] })] }), realmKey && minorStageInfo && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '12px', padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }, children: (0, jsx_runtime_1.jsx)("strong", { children: "Breakthrough Requirements:" }) }), (() => {
                                    const attempt = (0, cultivationMechanics_1.generateBreakthroughAttempt)(realmKey, player.minorStage || 1, (player.minorStage || 1) + 1);
                                    return ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: 'var(--text-muted)' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Qi Required: ", attempt.qiRequired] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Success Chance: ", (attempt.successChance * 100).toFixed(1), "%"] })] }));
                                })()] })), !(0, realmHelpersLoader_1.canAdvanceRealm)(player) && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: '8px', padding: '8px', background: 'rgba(239,68,68,0.1)', borderRadius: '4px', border: '1px solid #ef4444' }, children: (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '12px', color: '#ef4444' }, children: "\u26A0\uFE0F Insufficient insight points for realm advancement. Seek mentorship or enlightenment opportunities." }) }))] }), patternPreview && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '24px', padding: '16px', background: 'rgba(239,68,68,0.1)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: '#ef4444', marginTop: 0 }, children: "\u26A1 Upcoming Tribulation" }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '16px', fontWeight: 'bold', color: 'var(--text)' }, children: patternPreview.name }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }, children: ["Pattern ID: ", patternPreview.id, " | Minimum Realm Difficulty: ", patternPreview.realmMinDifficulty] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '14px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }, children: "Tribulation Waves:" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexDirection: 'column', gap: '6px' }, children: [patternPreview.waves.slice(0, 2).map((wave, index) => ((0, jsx_runtime_1.jsxs)("div", { style: {
                                                padding: '8px',
                                                background: 'rgba(0,0,0,0.2)',
                                                borderRadius: '4px',
                                                fontSize: '12px'
                                            }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontWeight: 'bold', color: '#ef4444' }, children: ["Wave ", index + 1, ": ", wave.element, " (Intensity: ", wave.intensity, ")"] }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--text-muted)', marginTop: '2px' }, children: [wave.count, " strikes"] })] }, index))), patternPreview.waves.length > 2 && ((0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }, children: ["...and ", patternPreview.waves.length - 2, " more waves"] }))] })] }), patternPreview.curses && patternPreview.curses.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '14px', fontWeight: 'bold', color: 'var(--text)', marginBottom: '8px' }, children: "Potential Curses:" }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: '6px' }, children: [patternPreview.curses.slice(0, 3).map((curse, index) => ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { borderRadius: 12, fontSize: '11px', background: 'rgba(239,68,68,0.2)', color: '#ef4444' }, children: curse.name || curse.id }, index))), patternPreview.curses.length > 3 && ((0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { borderRadius: 12, fontSize: '11px', background: 'rgba(0,0,0,0.2)', color: 'var(--text-muted)' }, children: `+${patternPreview.curses.length - 3} more` }))] })] })), (0, jsx_runtime_1.jsxs)("div", { style: { padding: '8px', background: 'rgba(0,0,0,0.2)', borderRadius: '4px', fontSize: '12px', color: 'var(--text-secondary)' }, children: [(0, jsx_runtime_1.jsx)("strong", { children: "Difficulty:" }), " ", realmDifficulty >= 20 ? 'Extreme' : realmDifficulty >= 15 ? 'Very Hard' : realmDifficulty >= 10 ? 'Hard' : 'Moderate', (0, jsx_runtime_1.jsx)("br", {}), (0, jsx_runtime_1.jsx)("strong", { children: "Preparation:" }), " Strengthen your foundation and seek protective treasures before attempting breakthrough."] })] })), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '12px', padding: '12px', background: 'rgba(99,102,241,0.06)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700 }, children: "Consolidation" }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.9rem' }, children: ["Threshold: ", consolidationThreshold, " ticks"] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8, fontSize: '0.95rem' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: ["Ticks spent consolidating: ", (0, jsx_runtime_1.jsx)("strong", { children: getTicksSpent() })] }), (0, jsx_runtime_1.jsxs)("div", { children: ["Consolidation factor: ", (0, jsx_runtime_1.jsxs)("strong", { children: [(getConsolidationFactor() * 100).toFixed(0), "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 6, color: getEstimatedPenalty() > 0 ? '#f97316' : '#10b981' }, children: ["Estimated Dao Heart penalty if you attempt now: ", (0, jsx_runtime_1.jsx)("strong", { children: getEstimatedPenalty() })] })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: 10, fontSize: '0.85rem', color: 'var(--muted)' }, children: "Tip: Waiting increases consolidation and reduces penalties. Seclusion grants extra consolidation time." })] }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: !hasManual && !isCultivating ? 'You need a cultivation manual to cultivate. Find one via Work or Explore.' : undefined, children: (0, jsx_runtime_1.jsx)("button", { onClick: handleBreakthrough, disabled: !minorStageInfo ||
                                    (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage) ||
                                    (!hasManual && !isCultivating), style: {
                                    width: '100%',
                                    padding: '12px',
                                    background: (player.minorStage || 1) >= (minorStageInfo?.maxStage || 1) ? 'var(--accent)' : 'var(--primary)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    cursor: 'pointer',
                                    opacity: (!minorStageInfo || (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage) || (!hasManual && !isCultivating)) ? 0.5 : 1,
                                    fontWeight: 'bold'
                                }, children: (player.minorStage || 1) >= (minorStageInfo?.maxStage || 1)
                                    ? `Breakthrough to ${nextRealm?.name || 'Next Realm'}`
                                    : `Advance to Stage ${(player.minorStage || 1) + 1}` }) })] }), nextRealm && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px', padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsxs)("h4", { style: { color: 'var(--accent)', marginTop: 0, marginBottom: '8px' }, children: ["Next Realm: ", nextRealm.name] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '14px', color: 'var(--text-secondary)' }, children: nextRealm.description })] })), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '20px', padding: '12px', background: 'rgba(212,175,55,0.1)', borderRadius: '6px' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: 'var(--primary)', marginTop: 0 }, children: "\uD83D\uDCA1 Cultivation Tips" }), (0, jsx_runtime_1.jsxs)("ul", { style: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px' }, children: [(0, jsx_runtime_1.jsx)("li", { children: "Allocate days per year to cultivation using the slider above" }), (0, jsx_runtime_1.jsx)("li", { children: "More allocated days = more Qi gain, but fewer days for other activities" }), (0, jsx_runtime_1.jsx)("li", { children: "Cultivation happens automatically each day based on your allocation" }), (0, jsx_runtime_1.jsx)("li", { children: "Complete all minor stages before attempting realm breakthrough" }), (0, jsx_runtime_1.jsx)("li", { children: "Each realm unlocks new abilities and increases your power" }), (0, jsx_runtime_1.jsx)("li", { children: "Cannot allocate more days than your remaining lifespan" })] })] })] }) }));
};
exports.CultivationUI = CultivationUI;
