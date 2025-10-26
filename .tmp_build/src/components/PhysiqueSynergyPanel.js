"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PhysiqueSynergyPanel = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const physiqueSynergies_1 = require("@/utils/physiqueSynergies");
const PhysiqueSynergyPanel = ({ activePhysiques, className = '' }) => {
    // Narrow the loosely-typed synergies to a predictable shape for rendering
    const activeSynergies = (0, physiqueSynergies_1.getActiveSynergies)(activePhysiques);
    const synergyBonuses = (0, physiqueSynergies_1.calculateSynergyBonuses)(activePhysiques);
    if (activeSynergies.length === 0) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: `physique-synergy-panel ${className}`, children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-bold text-amber-400 mb-2", children: "Physique Synergies" }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-400 text-sm", children: "No physique synergies active. Combine compatible physiques to unlock powerful synergies." })] }));
    }
    const formatBonusName = (bonusType) => {
        return bonusType
            .replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    };
    const formatBonusValue = (value, bonusType) => {
        if (bonusType.includes('speed') || bonusType.includes('damage') || bonusType.includes('resistance')) {
            return `+${(value * 100).toFixed(1)}%`;
        }
        return `+${value.toFixed(1)}`;
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `physique-synergy-panel ${className}`, children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-bold text-amber-400 mb-4", children: "Active Physique Synergies" }), (0, jsx_runtime_1.jsx)("div", { className: "space-y-4", children: activeSynergies.map((synergy, index) => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-lg p-4 border border-purple-500/30", children: [(0, jsx_runtime_1.jsxs)("div", { className: "flex items-start justify-between mb-2", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-md font-semibold text-purple-300", children: synergy.name }), (0, jsx_runtime_1.jsxs)("span", { className: "text-xs bg-purple-600/20 text-purple-300 px-2 py-1 rounded", children: ["Synergy #", index + 1] })] }), (0, jsx_runtime_1.jsx)("p", { className: "text-gray-300 text-sm mb-3 leading-relaxed", children: synergy.description }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-2", children: Object.entries(synergy.bonuses).map(([bonusType, bonusValue]) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center bg-black/20 rounded px-3 py-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-gray-300 text-sm", children: [formatBonusName(bonusType), ":"] }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-400 font-semibold text-sm", children: formatBonusValue(bonusValue, bonusType) })] }, bonusType))) }), (0, jsx_runtime_1.jsx)("div", { className: "mt-3 pt-3 border-t border-purple-500/20", children: (0, jsx_runtime_1.jsxs)("div", { className: "text-xs text-gray-400", children: [(0, jsx_runtime_1.jsx)("span", { className: "font-medium", children: "Required Physiques:" }), ' ', synergy.requiredPhysiques.map(physiqueId => {
                                        const physique = activePhysiques.find((p) => p.id === physiqueId);
                                        return physique ? physique.name : physiqueId;
                                    }).join(', ')] }) })] }, synergy.id))) }), Object.keys(synergyBonuses).length > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "mt-6 bg-gradient-to-r from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30", children: [(0, jsx_runtime_1.jsx)("h4", { className: "text-md font-semibold text-green-300 mb-3", children: "Total Synergy Bonuses" }), (0, jsx_runtime_1.jsx)("div", { className: "grid grid-cols-2 md:grid-cols-3 gap-3", children: Object.entries(synergyBonuses).map(([bonusType, totalValue]) => ((0, jsx_runtime_1.jsxs)("div", { className: "flex justify-between items-center bg-black/30 rounded px-3 py-2", children: [(0, jsx_runtime_1.jsxs)("span", { className: "text-gray-300 text-sm", children: [formatBonusName(bonusType), ":"] }), (0, jsx_runtime_1.jsx)("span", { className: "text-green-400 font-bold text-sm", children: formatBonusValue(totalValue, bonusType) })] }, bonusType))) })] })), (0, jsx_runtime_1.jsx)("div", { className: "mt-4 text-xs text-gray-500", children: (0, jsx_runtime_1.jsx)("p", { children: "* Synergy bonuses are multiplicative and stack with individual physique effects. Combine more physiques to discover new synergies!" }) })] }));
};
exports.PhysiqueSynergyPanel = PhysiqueSynergyPanel;
exports.default = exports.PhysiqueSynergyPanel;
