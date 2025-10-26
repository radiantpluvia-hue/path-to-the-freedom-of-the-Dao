"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NodeMapSystem = void 0;
class NodeMapSystem {
    constructor() {
        this.mapWidth = 10;
        this.mapHeight = 10;
        void 0;
    }
    static getInstance() {
        if (!NodeMapSystem.instance) {
            NodeMapSystem.instance = new NodeMapSystem();
        }
        return NodeMapSystem.instance;
    }
    /**
     * Creates a formation layout with positioned nodes
     */
    createFormationLayout(formation, centerX = 5, centerY = 5) {
        const nodes = [];
        // Defensive: formation.positions may be missing in some fixtures; fall back to a single-center position
        const positions = formation.positions && formation.positions.length ? formation.positions : [{ x: 0, y: 0, bonuses: {} }];
        // Create nodes based on formation positions
        positions.forEach((pos, _index) => {
            const node = {
                x: centerX + pos.x,
                y: centerY + pos.y,
                occupied: false,
                positionBonus: pos.bonuses
            };
            nodes.push(node);
        });
        return {
            formation,
            nodes,
            centerX,
            centerY
        };
    }
    /**
     * Assigns units to formation positions
     */
    assignUnitsToFormation(layout, unitIds) {
        const updatedLayout = { ...layout };
        updatedLayout.nodes = layout.nodes.map((node, index) => ({
            ...node,
            occupied: index < unitIds.length,
            unitId: index < unitIds.length ? unitIds[index] : undefined
        }));
        return updatedLayout;
    }
    /**
     * Calculates positional bonuses for a unit at a specific position
     */
    calculatePositionalBonuses(layout, unitId) {
        const node = layout.nodes.find(n => n.unitId === unitId);
        if (!node || !node.positionBonus) {
            return { atk: 0, def: 0, speed: 0, flankingBonus: 0, backAttackBonus: 0 };
        }
        return {
            atk: node.positionBonus.atk || 0,
            def: node.positionBonus.def || 0,
            speed: node.positionBonus.speed || 0,
            flankingBonus: node.positionBonus.flankingBonus || 0,
            backAttackBonus: node.positionBonus.backAttackBonus || 0
        };
    }
    /**
     * Checks if a position allows flanking attacks
     */
    canFlank(layout, attackerUnitId, targetUnitId) {
        const attackerNode = layout.nodes.find(n => n.unitId === attackerUnitId);
        const targetNode = layout.nodes.find(n => n.unitId === targetUnitId);
        if (!attackerNode || !targetNode)
            return false;
        // Check if attacker is positioned to flank (side or back of target)
        const dx = attackerNode.x - targetNode.x;
        const dy = attackerNode.y - targetNode.y;
        // Simple flanking check: attacker is not directly in front
        return Math.abs(dx) > 0 || dy > 0;
    }
    /**
     * Checks if an attack is from behind
     */
    isBackAttack(layout, attackerUnitId, targetUnitId) {
        const attackerNode = layout.nodes.find(n => n.unitId === attackerUnitId);
        const targetNode = layout.nodes.find(n => n.unitId === targetUnitId);
        if (!attackerNode || !targetNode)
            return false;
        // Back attack if attacker is behind target (higher y coordinate assuming forward is lower y)
        return attackerNode.y > targetNode.y;
    }
    /**
     * Gets formation-wide bonuses
     */
    getGlobalBonuses(layout) {
        const globalBonuses = layout.formation.globalBonuses || {};
        return {
            flankingEfficiency: globalBonuses.flankingEfficiency || 1.0,
            backAttackEfficiency: globalBonuses.backAttackEfficiency || 1.0,
            coordinationBonus: globalBonuses.coordinationBonus || 0
        };
    }
    /**
     * Calculates coordination bonus based on how well units are positioned
     */
    calculateCoordinationBonus(layout) {
        const occupiedNodes = layout.nodes.filter(n => n.occupied);
        const totalPositions = (layout.formation.positions && layout.formation.positions.length) ? layout.formation.positions.length : layout.nodes.length;
        const occupiedCount = occupiedNodes.length;
        if (occupiedCount === 0)
            return 0;
        // Bonus increases with more units in formation
        const fillRatio = occupiedCount / totalPositions;
        const baseBonus = layout.formation.globalBonuses?.coordinationBonus || 0;
        return Math.floor(baseBonus * fillRatio);
    }
    /**
     * Validates if a formation can be deployed at given coordinates
     */
    canDeployFormation(formation, centerX, centerY) {
        const positions = formation.positions && formation.positions.length ? formation.positions : [{ x: 0, y: 0 }];
        return positions.every((pos) => {
            const x = centerX + pos.x;
            const y = centerY + pos.y;
            return x >= 0 && x < this.mapWidth && y >= 0 && y < this.mapHeight;
        });
    }
    /**
     * Gets all valid deployment positions for a formation
     */
    getValidDeploymentPositions(formation) {
        const positions = [];
        for (let x = 0; x < this.mapWidth; x++) {
            for (let y = 0; y < this.mapHeight; y++) {
                if (this.canDeployFormation(formation, x, y)) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    }
    /**
     * Rotates a formation layout (for tactical repositioning)
     */
    rotateFormation(layout, clockwise = true) {
        const rotatedNodes = layout.nodes.map(node => {
            const dx = node.x - layout.centerX;
            const dy = node.y - layout.centerY;
            const newDx = clockwise ? dy : -dy;
            const newDy = clockwise ? -dx : dx;
            return {
                ...node,
                x: layout.centerX + newDx,
                y: layout.centerY + newDy
            };
        });
        return {
            ...layout,
            nodes: rotatedNodes
        };
    }
    /**
     * Gets formation effectiveness rating based on current positioning
     */
    getFormationEffectiveness(layout) {
        const occupiedCount = layout.nodes.filter(n => n.occupied).length;
        const totalPositions = (layout.formation.positions || []).length;
        if (occupiedCount === 0)
            return 0;
        const fillRatio = occupiedCount / totalPositions;
        const coordinationBonus = this.calculateCoordinationBonus(layout);
        // Base effectiveness from unit positioning
        let effectiveness = fillRatio * 100;
        // Add coordination bonus
        effectiveness += coordinationBonus;
        // Add formation-specific bonuses
        const globalBonuses = this.getGlobalBonuses(layout);
        effectiveness *= (globalBonuses.flankingEfficiency + globalBonuses.backAttackEfficiency) / 2;
        return Math.min(100, Math.max(0, effectiveness));
    }
}
exports.NodeMapSystem = NodeMapSystem;
exports.default = NodeMapSystem;
