"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const logger_1 = require("@/utils/logger");
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
const useGameStore_1 = require("../store/useGameStore");
const DomainSystem_1 = require("../systems/DomainSystem");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const FormationSelector_1 = __importDefault(require("./FormationSelector"));
const RandomizedCharacters_1 = __importDefault(require("./RandomizedCharacters"));
require("./DomainPanel.css");
const DomainPanel = () => {
    const { systems, addDomainResource, setDomainUnlock, addDomainBonus: _addDomainBonus, gainDomainXP, addEventLog } = (0, useGameStore_1.useGameStore)();
    const domainState = systems.domain;
    const [selectedTerritory, setSelectedTerritory] = (0, react_1.useState)(null);
    const [selectedFaction, setSelectedFaction] = (0, react_1.useState)(null);
    const domainSystem = (0, react_1.useMemo)(() => {
        if (domainState) {
            return new DomainSystem_1.DomainSystem(domainState);
        }
        return null;
    }, [domainState]);
    const resourceIncome = (0, react_1.useMemo)(() => {
        return domainSystem ? domainSystem.calculateResourceGeneration() : {
            gold: 0,
            food: 0,
            spirit_ore: 0,
            spirit_stone: 0,
            influencePoint: 0
        };
    }, [domainSystem]);
    const territories = Object.values(domainState?.territories || {});
    const factions = Object.values(domainState?.factions || {});
    const recruitTerritoryGarrison = (0, useGameStore_1.useGameStore)(s => s.recruitTerritoryGarrison);
    const handleTerritoryAction = (territoryId, action) => {
        try {
            if (action === 'recruit') {
                // simple default: hire 10 troops of quality 1.0 — this is intentionally conservative
                const ok = recruitTerritoryGarrison?.(territoryId, 10, 1.0);
                addEventLog?.(ok ? `Recruited 10 troops to ${territoryId}.` : `Recruit failed for ${territoryId}.`);
                return;
            }
            // Placeholder for other territory actions
            addEventLog?.(`Territory ${territoryId}: ${action} (coming soon)`);
        }
        catch (e) {
            void e;
        }
    };
    const handleFactionAction = (factionId, action) => {
        // Placeholder actions: log intent so players get feedback
        try {
            addEventLog?.(`Faction ${factionId}: ${action} (coming soon)`);
        }
        catch (e) {
            void e;
        }
    };
    // intentionally reference addDomainBonus alias to silence unused-var warning
    void _addDomainBonus;
    const getTerritoryStatus = (territory) => {
        if (territory.contestedSince) {
            return 'contested';
        }
        if (territory.ownerFactionId) {
            return 'controlled';
        }
        return 'neutral';
    };
    const getFactionRelationship = (faction) => {
        // Use faction.contribution as proxy for relationship for now
        const influence = faction.contribution || 0;
        if (influence > 50)
            return 'allied';
        if (influence > 0)
            return 'friendly';
        if (influence > -25)
            return 'neutral';
        if (influence > -50)
            return 'unfriendly';
        return 'hostile';
    };
    if (!domainState) {
        return ((0, jsx_runtime_1.jsxs)("div", { className: "domain-panel", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Domain Management" }), (0, jsx_runtime_1.jsx)("p", { children: "Domain system not initialized." })] }));
    }
    return ((0, jsx_runtime_1.jsxs)("div", { className: "domain-panel", children: [(0, jsx_runtime_1.jsx)("h3", { children: "Domain Management" }), (0, jsx_runtime_1.jsxs)("div", { className: "domain-overview", children: [(0, jsx_runtime_1.jsxs)("div", { className: "domain-header", children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Domain Level ", domainState.level] }), (0, jsx_runtime_1.jsxs)("div", { className: "domain-xp", children: [(0, jsx_runtime_1.jsxs)("span", { children: ["XP: ", domainState.xp] }), (0, jsx_runtime_1.jsx)("div", { className: "xp-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "xp-fill", style: {
                                                width: `${(domainState.xp % 100)}%`
                                            } }) })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "domain-resources", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Resources" }), (0, jsx_runtime_1.jsxs)("div", { className: "resource-grid", children: [(0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Gold • income: +${resourceIncome.gold}/tick`, children: (0, jsx_runtime_1.jsxs)("div", { className: "resource-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "resource-label", children: "Gold" }), (0, jsx_runtime_1.jsxs)("div", { className: "resource-value", children: [resourceIncome.gold, "/tick"] })] }) }, "gold"), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Food • income: +${resourceIncome.food}/tick`, children: (0, jsx_runtime_1.jsxs)("div", { className: "resource-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "resource-label", children: "Food" }), (0, jsx_runtime_1.jsxs)("div", { className: "resource-value", children: [resourceIncome.food, "/tick"] })] }) }, "food"), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Spirit Ore • income: +${resourceIncome.spirit_ore}/tick`, children: (0, jsx_runtime_1.jsxs)("div", { className: "resource-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "resource-label", children: "Spirit Ore" }), (0, jsx_runtime_1.jsxs)("div", { className: "resource-value", children: [resourceIncome.spirit_ore, "/tick"] })] }) }, "spirit_ore"), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Spirit Stone • income: +${resourceIncome.spirit_stone}/tick`, children: (0, jsx_runtime_1.jsxs)("div", { className: "resource-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "resource-label", children: "Spirit Stone" }), (0, jsx_runtime_1.jsxs)("div", { className: "resource-value", children: [resourceIncome.spirit_stone, "/tick"] })] }) }, "spirit_stone"), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Influence • income: +${resourceIncome.influencePoint}/tick`, children: (0, jsx_runtime_1.jsxs)("div", { className: "resource-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "resource-label", children: "Influence" }), (0, jsx_runtime_1.jsxs)("div", { className: "resource-value", children: [resourceIncome.influencePoint, "/tick"] })] }) }, "influence")] })] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "territories-section", style: {
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
                    gap: 16,
                    alignItems: 'start'
                }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 0 }, children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Territories (", territories.length, ")"] }), territories.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "empty-state", children: "No territories controlled. Expand your domain to gain resources and influence." })) : ((0, jsx_runtime_1.jsx)("div", { className: "territories-grid", children: territories.map(territory => ((0, jsx_runtime_1.jsxs)("div", { className: `territory-card ${getTerritoryStatus(territory)} ${selectedTerritory === territory.id ? 'selected' : ''}`, onClick: () => setSelectedTerritory(selectedTerritory === territory.id ? null : territory.id), children: [(0, jsx_runtime_1.jsxs)("div", { className: "territory-header", children: [(0, jsx_runtime_1.jsx)("h5", { children: territory.nodeType.charAt(0).toUpperCase() + territory.nodeType.slice(1) }), (0, jsx_runtime_1.jsx)("span", { className: `rarity-badge rarity-${territory.rarity}`, children: (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: territory.rarity }) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "territory-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { children: "Owner:" }), (0, jsx_runtime_1.jsx)("span", { children: territory.ownerFactionId || 'Neutral' })] }), territory.garrison && ((0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { children: "Garrison:" }), (0, jsx_runtime_1.jsxs)("span", { children: [territory.garrison.troops, " troops"] })] })), (0, jsx_runtime_1.jsx)("div", { className: "influence-breakdown", children: Object.entries(territory.influence).map(([factionId, influence]) => ((0, jsx_runtime_1.jsxs)("div", { className: "influence-item", children: [(0, jsx_runtime_1.jsxs)("span", { children: [factionId, ":"] }), (0, jsx_runtime_1.jsxs)("span", { className: influence > 0 ? 'positive' : 'negative', children: [influence > 0 ? '+' : '', influence] })] }, factionId))) })] }), selectedTerritory === territory.id && ((0, jsx_runtime_1.jsxs)("div", { className: "territory-actions", children: [(0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Recruit garrison to bolster defense", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleTerritoryAction(territory.id, 'recruit'), children: "Recruit Garrison" }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Construct a structure to boost yields or defense", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleTerritoryAction(territory.id, 'build'), children: "Build Structure" }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Invest resources to harden defenses", children: (0, jsx_runtime_1.jsx)("button", { type: "button", onClick: () => handleTerritoryAction(territory.id, 'fortify'), children: "Fortify" }) })] }))] }, territory.id))) }))] }), (0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 0 }, children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Factions (", factions.length, ")"] }), factions.length === 0 ? ((0, jsx_runtime_1.jsx)("p", { className: "empty-state", children: "No factions present in your domain." })) : ((0, jsx_runtime_1.jsx)("div", { className: "factions-grid", children: factions.map(faction => ((0, jsx_runtime_1.jsxs)("div", { className: `faction-card ${getFactionRelationship(faction)} ${selectedFaction === faction.id ? 'selected' : ''}`, onClick: () => setSelectedFaction(selectedFaction === faction.id ? null : faction.id), children: [(0, jsx_runtime_1.jsx)("div", { style: { marginBottom: 8 }, children: (0, jsx_runtime_1.jsx)(RandomizedCharacters_1.default, { strength: faction.contribution || 0, size: 4, seed: faction.id }) }), (0, jsx_runtime_1.jsxs)("div", { className: "faction-header", children: [(0, jsx_runtime_1.jsx)("h5", { children: faction.name }), (0, jsx_runtime_1.jsx)("span", { className: `relationship-badge relationship-${getFactionRelationship(faction)}`, children: getFactionRelationship(faction) })] }), (0, jsx_runtime_1.jsxs)("div", { className: "faction-info", children: [(0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { children: "Type:" }), (0, jsx_runtime_1.jsx)("span", { children: faction.relationToPlayer || 'neutral' })] }), (0, jsx_runtime_1.jsxs)("div", { className: "info-item", children: [(0, jsx_runtime_1.jsx)("span", { children: "Power:" }), (0, jsx_runtime_1.jsx)("span", { children: faction.contribution || 0 })] }), (0, jsx_runtime_1.jsxs)("div", { className: "influence-summary", children: [(0, jsx_runtime_1.jsx)("span", { children: "Total Influence:" }), (0, jsx_runtime_1.jsx)("span", { children: faction.influenceGlobal || 0 })] })] }), selectedFaction === faction.id && ((0, jsx_runtime_1.jsxs)("div", { className: "faction-actions", children: [(0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Open diplomatic talks to shift relations", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleFactionAction(faction.id, 'diplomacy'), children: "Diplomacy" }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Propose a trade agreement", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleFactionAction(faction.id, 'trade'), children: "Trade Agreement" }) }), (0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: "Seek a formal alliance", children: (0, jsx_runtime_1.jsx)("button", { onClick: () => handleFactionAction(faction.id, 'alliance'), children: "Form Alliance" }) })] }))] }, faction.id))) }))] })] }), (0, jsx_runtime_1.jsxs)("div", { className: "formation-section", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Formation Management" }), (0, jsx_runtime_1.jsx)(FormationSelector_1.default, { onFormationSelect: (formationId) => logger_1.logger.debug(`Selected formation: ${formationId}`), unitIds: [] }), void _addDomainBonus] }), (0, jsx_runtime_1.jsxs)("div", { className: "domain-actions", children: [(0, jsx_runtime_1.jsx)("h4", { children: "Domain Actions" }), (0, jsx_runtime_1.jsxs)("div", { className: "action-buttons", children: [(0, jsx_runtime_1.jsx)("button", { onClick: () => gainDomainXP(10), children: "Gain XP (Test)" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => addDomainResource('gold', 100), children: "Add Gold (Test)" }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setDomainUnlock('advanced_buildings', true), children: "Unlock Advanced Buildings (Test)" })] })] })] }));
};
exports.default = DomainPanel;
