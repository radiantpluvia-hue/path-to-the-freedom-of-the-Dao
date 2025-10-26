"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = TravelPanel;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importStar(require("react"));
const seededRng_1 = require("@/utils/seededRng");
const playerHelpers_1 = require("@/utils/playerHelpers");
const useGameStore_1 = require("../../store/useGameStore");
const Button_1 = require("../core/Button");
const SmallChip_1 = __importDefault(require("../ui/SmallChip"));
const travelPath_1 = require("@/utils/travelPath");
function TravelPanel({ onClose }) {
    const store = (0, useGameStore_1.useGameStore)();
    const { player, startTravel } = store;
    const [preRoll, setPreRoll] = react_1.default.useState(true);
    const discovered = (player.unlockedMapNodes || []).slice(0, 50);
    const nodes = player.mapNodes || [];
    const edges = player.mapEdges || [];
    const nodeInfo = (0, react_1.useMemo)(() => {
        const map = {};
        for (const id of discovered) {
            const path = (0, travelPath_1.findShortestPath)(nodes, edges, player.currentMapNode || null, id) || null;
            map[id] = { path, etaSecs: path ? path.totalDurationSeconds : 0, etaTicks: path ? path.totalDurationTicks : 0 };
            // aggregate cost along path
            if (path && path.path && path.path.length > 1) {
                const plannedCost = {};
                for (let i = 0; i < path.path.length - 1; i++) {
                    const a = path.path[i];
                    const b = path.path[i + 1];
                    const e = (edges || []).find((ed) => (ed.from === a && ed.to === b) || (ed.from === b && ed.to === a));
                    if (e && e.cost) {
                        for (const k of Object.keys(e.cost || {}))
                            plannedCost[k] = (plannedCost[k] || 0) + (e.cost?.[k] || 0);
                    }
                }
                if (Object.keys(plannedCost).length > 0)
                    map[id].plannedCost = plannedCost;
                // list encounters
                const encounters = [];
                for (let i = 0; i < path.path.length - 1; i++) {
                    const a = path.path[i];
                    const b = path.path[i + 1];
                    const e = (edges || []).find((ed) => (ed.from === a && ed.to === b) || (ed.from === b && ed.to === a));
                    if (e && e.encounter)
                        encounters.push({ from: a, to: b, encounter: e.encounter });
                }
                if (encounters.length > 0) {
                    // If preRoll toggle on, preview which edges would pre-roll as willTrigger
                    if (preRoll) {
                        for (const ec of encounters) {
                            try {
                                const chance = ec.encounter?.chance;
                                if (typeof chance === 'number') {
                                    const roll = (0, seededRng_1.runtimeRng)();
                                    ec.willTrigger = roll < Math.max(0, Math.min(1, chance));
                                }
                            }
                            catch (e) {
                                void e;
                            }
                        }
                    }
                    map[id].encounters = encounters;
                }
            }
        }
        return map;
    }, [discovered.join(','), JSON.stringify(nodes || []), JSON.stringify(edges || []), player.currentMapNode, preRoll]);
    const handleStart = (nodeId, useGate) => {
        const realm = (0, playerHelpers_1.getPlayerRealmKey)(player) || 'mortal';
        const mortalSlow = (realm === 'mortal' || realm === 'foundation');
        // pass useGate flag; UI now makes the gate choice explicit
        if (mortalSlow) {
            startTravel(nodeId, { fromNodeId: player.currentMapNode || null, mode: 'walk', useGate, preRollEncounters: preRoll });
        }
        else {
            // higher realms: teleport/instant
            startTravel(nodeId, { fromNodeId: player.currentMapNode || null, mode: 'teleport', useGate, preRollEncounters: preRoll });
        }
        onClose();
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: { position: 'fixed', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, background: 'rgba(0,0,0,0.35)' }, children: (0, jsx_runtime_1.jsxs)("div", { style: { width: 720, maxHeight: '80vh', overflow: 'auto', background: 'var(--card-bg)', border: '1px solid rgba(255,255,255,0.06)', padding: 16, borderRadius: 8, boxShadow: '0 6px 24px rgba(0,0,0,0.45)' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Travel" }), (0, jsx_runtime_1.jsx)("p", { children: "Choose a discovered destination to travel to." }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', flexWrap: 'wrap', gap: 8 }, children: [discovered.length === 0 && (0, jsx_runtime_1.jsx)("div", { children: "No discovered locations yet." }), discovered.map((id) => {
                            const info = nodeInfo[id] || {};
                            return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 8, border: '1px solid rgba(255,255,255,0.04)', borderRadius: 6, minWidth: 220 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: id.replace(/_/g, ' ') }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsxs)("div", { children: ["ETA: ", info.etaSecs ? `${info.etaSecs}s` : (info.etaTicks ? `${info.etaTicks} ticks` : 'Instant')] }), info.plannedCost && (0, jsx_runtime_1.jsxs)("div", { children: ["Cost: ", Object.entries(info.plannedCost).map(([k, v]) => `${k}:${v}`).join(', ')] }), info.encounters && info.encounters.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 6 }, children: ["Risk: ", Math.round(info.encounters.reduce((acc, e) => acc + (e.encounter?.chance || 0), 0) * 100), "%", (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: 'var(--muted)', marginTop: 6 }, children: info.encounters.map((ec, idx) => ((0, jsx_runtime_1.jsxs)("div", { children: [ec.from, ' -> ', ec.to, " - chance: ", Math.round((ec.encounter?.chance || 0) * 100), "% ", ec.willTrigger !== undefined ? ` (pre-roll: ${ec.willTrigger ? 'YES' : 'NO'})` : ''] }, idx))) })] }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8, display: 'flex', gap: 8 }, children: [(0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleStart(id, false), children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Walk" }) }), (0, jsx_runtime_1.jsx)(Button_1.Button, { onClick: () => handleStart(id, true), variant: "secondary", children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Use Gate" }) })] })] }, id));
                        })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 16 }, children: [(0, jsx_runtime_1.jsxs)("label", { style: { display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }, children: [(0, jsx_runtime_1.jsx)("input", { type: "checkbox", checked: preRoll, onChange: (e) => setPreRoll(e.target.checked) }), (0, jsx_runtime_1.jsx)("span", { style: { fontSize: 13 }, children: "Pre-roll encounters (deterministic) when starting travel" })] }), (0, jsx_runtime_1.jsx)(Button_1.Button, { variant: "secondary", onClick: onClose, children: (0, jsx_runtime_1.jsx)(SmallChip_1.default, { children: "Close" }) })] })] }) }));
}
