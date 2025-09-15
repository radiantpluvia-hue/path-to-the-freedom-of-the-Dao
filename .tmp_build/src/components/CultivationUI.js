"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CultivationUI = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/* eslint-disable no-restricted-imports -- imports core systems intentionally */
const react_1 = require("react");
const useGameStore_1 = require("../store/useGameStore");
const BreakthroughSystem_1 = require("../systems/BreakthroughSystem");
const cultivationRealms_1 = require("../data/cultivationRealms");
const realmHelpers_1 = require("../utils/realmHelpers");
const CultivationUI = ({ onClose }) => {
    const { player, updatePlayerState, addEventLog } = (0, useGameStore_1.useGameStore)();
    const [breakthroughSystem] = (0, react_1.useState)(() => new BreakthroughSystem_1.BreakthroughSystem());
    const [minorStageInfo, setMinorStageInfo] = (0, react_1.useState)(null);
    // Simplified cultivation state (not used yet)
    const realmKey = (0, realmHelpers_1.getRealmKeyFromPlayer)(player);
    const currentRealm = realmKey ? cultivationRealms_1.CULTIVATION_REALMS[realmKey] : null;
    const nextRealm = currentRealm?.nextRealm ? cultivationRealms_1.CULTIVATION_REALMS[currentRealm.nextRealm] : null;
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
            // Major realm breakthrough - always succeeds if at max stage
            const nextRealm = currentRealm?.nextRealm;
            if (nextRealm) {
                updatePlayerState({
                    realm: nextRealm,
                    realmId: cultivationRealms_1.REALM_ORDER.indexOf(nextRealm) + 1,
                    minorStage: 1,
                    currentQi: 0
                });
                addEventLog(`Successfully broke through to ${cultivationRealms_1.CULTIVATION_REALMS[nextRealm]?.name || nextRealm}!`);
            }
            else {
                addEventLog('Already at the highest realm!');
            }
        }
    };
    const handleCultivation = () => {
        if (!realmKey || !minorStageInfo)
            return;
        // Simple cultivation - gain Qi over time
        const baseQiGain = 10;
        const skillBonus = Math.floor((player.skills.cultivation?.level || 0) * 2);
        const totalGain = baseQiGain + skillBonus;
        updatePlayerState({
            currentQi: Math.min(player.qiRequired || 999999, player.currentQi + totalGain)
        });
        addEventLog(`Cultivated and gained ${totalGain} Qi`);
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
            zIndex: 1000
        }, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                background: 'var(--dark)',
                border: '2px solid var(--primary)',
                borderRadius: '12px',
                padding: '24px',
                maxWidth: '700px',
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
                            }, children: "\u00D7" })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '24px', padding: '16px', background: 'rgba(59,130,246,0.1)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h3", { style: { color: 'var(--primary)', marginTop: 0 }, children: currentRealm?.name || 'Unknown Realm' }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Stage:" }), " ", player.minorStage || 1, " / ", minorStageInfo?.maxStage || 1] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Stability:" }), (0, jsx_runtime_1.jsxs)("span", { style: { color: getStabilityColor(player.stability || 0), marginLeft: '4px' }, children: [player.stability || 0, "%"] })] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Qi Progress:" }), " ", player.currentQi, " / ", minorStageInfo?.qiRequired || 0] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Dao Heart:" }), " ", player.daoHeart || 0] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '12px' }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                                        background: 'rgba(255,255,255,0.1)',
                                        borderRadius: '4px',
                                        height: '8px',
                                        overflow: 'hidden'
                                    }, children: (0, jsx_runtime_1.jsx)("div", { style: {
                                            background: 'linear-gradient(90deg, var(--primary), var(--accent))',
                                            height: '100%',
                                            width: `${getStageProgress()}%`,
                                            transition: 'width 0.3s ease'
                                        } }) }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }, children: ["Stage Progress: ", getStageProgress().toFixed(1), "%"] })] })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px', padding: '12px', background: 'rgba(212,175,55,0.1)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: 'var(--primary)', marginTop: 0 }, children: "\uD83E\uDDD8 Cultivation" }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 14, color: 'var(--text-secondary)', marginBottom: 12 }, children: "Cultivate to gain Qi. Higher cultivation skill increases Qi gain." }), (0, jsx_runtime_1.jsxs)("button", { onClick: handleCultivation, style: {
                                padding: '12px 20px',
                                background: 'var(--primary)',
                                color: 'var(--dark)',
                                border: 'none',
                                borderRadius: 6,
                                cursor: 'pointer',
                                fontWeight: 'bold'
                            }, children: ["Cultivate (+", 10 + Math.floor((player.skills.cultivation?.level || 0) * 2), " Qi)"] })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginBottom: '20px' }, children: (0, jsx_runtime_1.jsx)("button", { onClick: handleBreakthrough, disabled: !minorStageInfo || (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage), style: {
                            width: '100%',
                            padding: '12px',
                            background: (player.minorStage || 1) >= (minorStageInfo?.maxStage || 1) ? 'var(--accent)' : 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            opacity: (!minorStageInfo || (player.currentQi < minorStageInfo.qiRequired && (player.minorStage || 1) < minorStageInfo.maxStage)) ? 0.5 : 1,
                            fontWeight: 'bold'
                        }, children: (player.minorStage || 1) >= (minorStageInfo?.maxStage || 1)
                            ? `Breakthrough to ${nextRealm?.name || 'Next Realm'}`
                            : `Advance to Stage ${(player.minorStage || 1) + 1}` }) }), nextRealm && ((0, jsx_runtime_1.jsxs)("div", { style: { marginBottom: '20px', padding: '12px', background: 'rgba(34,197,94,0.1)', borderRadius: '8px' }, children: [(0, jsx_runtime_1.jsxs)("h4", { style: { color: 'var(--accent)', marginTop: 0, marginBottom: '8px' }, children: ["Next Realm: ", nextRealm.name] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: '14px', color: 'var(--text-secondary)' }, children: nextRealm.description })] })), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '20px', padding: '12px', background: 'rgba(212,175,55,0.1)', borderRadius: '6px' }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { color: 'var(--primary)', marginTop: 0 }, children: "\uD83D\uDCA1 Cultivation Tips" }), (0, jsx_runtime_1.jsxs)("ul", { style: { fontSize: '14px', color: 'var(--text-secondary)', margin: 0, paddingLeft: '20px' }, children: [(0, jsx_runtime_1.jsx)("li", { children: "Cultivate regularly to gain Qi for breakthroughs" }), (0, jsx_runtime_1.jsx)("li", { children: "Higher cultivation skill increases Qi gain per session" }), (0, jsx_runtime_1.jsx)("li", { children: "Complete all minor stages before attempting realm breakthrough" }), (0, jsx_runtime_1.jsx)("li", { children: "Each realm unlocks new abilities and increases your power" })] })] })] }) }));
};
exports.CultivationUI = CultivationUI;
