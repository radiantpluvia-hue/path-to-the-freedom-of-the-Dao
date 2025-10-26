"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const TierBadge_1 = __importDefault(require("@/components/ui/TierBadge"));
const formations_1 = require("../data/formations");
const NodeMapSystem_1 = __importDefault(require("../systems/NodeMapSystem"));
const FormationSelector = ({ selectedFormation, onFormationSelect, unitIds, className = '' }) => {
    const [previewFormation, setPreviewFormation] = (0, react_1.useState)(null);
    const [layout, setLayout] = (0, react_1.useState)(null);
    const nodeMapSystem = (0, react_1.useMemo)(() => NodeMapSystem_1.default.getInstance(), []);
    const handleFormationPreview = (formation) => {
        setPreviewFormation(formation);
        const newLayout = nodeMapSystem.createFormationLayout(formation, 5, 5);
        const assignedLayout = nodeMapSystem.assignUnitsToFormation(newLayout, unitIds);
        setLayout(assignedLayout);
    };
    const handleFormationSelect = (formationId) => {
        onFormationSelect(formationId);
        setPreviewFormation(null);
        setLayout(null);
    };
    const renderFormationGrid = () => {
        if (!layout)
            return null;
        const gridSize = 11; // 11x11 grid to show positions around center
        const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(null));
        // Mark formation positions on grid
        layout.nodes.forEach(node => {
            const gridX = node.x;
            const gridY = node.y;
            if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
                grid[gridY][gridX] = node;
            }
        });
        return ((0, jsx_runtime_1.jsx)("div", { className: "formation-grid", children: grid.map((row, y) => ((0, jsx_runtime_1.jsx)("div", { className: "formation-row", children: row.map((node, x) => ((0, jsx_runtime_1.jsx)("div", { className: `formation-cell ${node ? 'occupied' : 'empty'}`, children: node ? ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `Position: ${node.positionBonus ? Object.entries(node.positionBonus).map(([key, value]) => `${key}: ${value}`).join(', ') : 'No bonuses'}`, children: (0, jsx_runtime_1.jsxs)("div", { children: [node.occupied && ((0, jsx_runtime_1.jsx)("div", { className: `unit-marker role-${node.positionBonus ? 'front' : 'back'}`, children: node.unitId ? '⚔️' : '👤' })), (0, jsx_runtime_1.jsx)("div", { className: "position-role", children: node.positionBonus ? 'front' : 'back' })] }) })) : null }, `${x}-${y}`))) }, y))) }));
    };
    const getFormationEffectiveness = (_formation) => {
        if (!layout)
            return 0;
        return nodeMapSystem.getFormationEffectiveness(layout);
    };
    return ((0, jsx_runtime_1.jsxs)("div", { className: `formation-selector ${className}`, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Formation Selection" }), (0, jsx_runtime_1.jsx)("div", { className: "formation-list", children: formations_1.FORMATIONS.map(_formation => ((0, jsx_runtime_1.jsxs)("div", { className: `formation-card ${selectedFormation === _formation.id ? 'selected' : ''}`, onClick: () => handleFormationPreview(_formation), children: [(0, jsx_runtime_1.jsxs)("div", { className: "formation-header", children: [(0, jsx_runtime_1.jsx)("h4", { children: _formation.name }), (0, jsx_runtime_1.jsx)("div", { style: { marginLeft: 8 }, children: (0, jsx_runtime_1.jsx)(TierBadge_1.default, { tier: _formation.tier, small: true }) })] }), (0, jsx_runtime_1.jsx)("p", { className: "formation-description", children: _formation.description }), (0, jsx_runtime_1.jsxs)("div", { className: "formation-stats", children: [(0, jsx_runtime_1.jsxs)("div", { className: "stat-group", children: [(0, jsx_runtime_1.jsx)("span", { className: "stat-label", children: "Positions:" }), (0, jsx_runtime_1.jsx)("span", { className: "stat-value", children: (_formation.positions || []).length })] }), _formation.globalBonuses && ((0, jsx_runtime_1.jsxs)("div", { className: "bonus-group", children: [_formation.globalBonuses.flankingEfficiency !== undefined && _formation.globalBonuses.flankingEfficiency !== 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "bonus-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "bonus-label", children: "Flanking:" }), (0, jsx_runtime_1.jsxs)("span", { className: `bonus-value ${_formation.globalBonuses.flankingEfficiency > 1 ? 'positive' : 'negative'}`, children: [((_formation.globalBonuses.flankingEfficiency - 1) * 100).toFixed(0), "%"] })] })), _formation.globalBonuses.backAttackEfficiency !== undefined && _formation.globalBonuses.backAttackEfficiency !== 1 && ((0, jsx_runtime_1.jsxs)("div", { className: "bonus-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "bonus-label", children: "Back Attack:" }), (0, jsx_runtime_1.jsxs)("span", { className: `bonus-value ${_formation.globalBonuses.backAttackEfficiency > 1 ? 'positive' : 'negative'}`, children: [((_formation.globalBonuses.backAttackEfficiency - 1) * 100).toFixed(0), "%"] })] })), _formation.globalBonuses.coordinationBonus !== undefined && _formation.globalBonuses.coordinationBonus > 0 && ((0, jsx_runtime_1.jsxs)("div", { className: "bonus-item", children: [(0, jsx_runtime_1.jsx)("span", { className: "bonus-label", children: "Coordination:" }), (0, jsx_runtime_1.jsxs)("span", { className: "bonus-value positive", children: ["+", _formation.globalBonuses.coordinationBonus] })] }))] }))] }), (0, jsx_runtime_1.jsx)("button", { type: "button", className: "select-formation-btn", onClick: (e) => {
                                e.stopPropagation();
                                handleFormationSelect(_formation.id);
                            }, disabled: selectedFormation === _formation.id, children: selectedFormation === _formation.id ? 'Selected' : 'Select Formation' })] }, _formation.id))) }), previewFormation && layout && ((0, jsx_runtime_1.jsxs)("div", { className: "formation-preview", children: [(0, jsx_runtime_1.jsxs)("h4", { children: ["Formation Preview: ", previewFormation.name] }), (0, jsx_runtime_1.jsx)("div", { className: "preview-stats", children: (0, jsx_runtime_1.jsxs)("div", { className: "effectiveness-meter", children: [(0, jsx_runtime_1.jsx)("span", { className: "effectiveness-label", children: "Effectiveness:" }), (0, jsx_runtime_1.jsx)("div", { className: "effectiveness-bar", children: (0, jsx_runtime_1.jsx)("div", { className: "effectiveness-fill", style: { width: `${getFormationEffectiveness(previewFormation)}%` } }) }), (0, jsx_runtime_1.jsxs)("span", { className: "effectiveness-value", children: [getFormationEffectiveness(previewFormation).toFixed(1), "%"] })] }) }), (0, jsx_runtime_1.jsx)("div", { className: "formation-visualization", children: renderFormationGrid() }), (0, jsx_runtime_1.jsxs)("div", { className: "position-legend", children: [(0, jsx_runtime_1.jsxs)("div", { className: "legend-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "legend-color front" }), (0, jsx_runtime_1.jsx)("span", { children: "Front Line" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "legend-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "legend-color back" }), (0, jsx_runtime_1.jsx)("span", { children: "Back Line" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "legend-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "legend-color flank" }), (0, jsx_runtime_1.jsx)("span", { children: "Flank" })] }), (0, jsx_runtime_1.jsxs)("div", { className: "legend-item", children: [(0, jsx_runtime_1.jsx)("div", { className: "legend-color center" }), (0, jsx_runtime_1.jsx)("span", { children: "Center" })] })] })] }))] }));
};
exports.default = FormationSelector;
