"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActiveBuffsDisplay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const RichTooltip_1 = __importDefault(require("@/components/ui/RichTooltip"));
const useGameStore_1 = require("@/store/useGameStore");
const getBuffEffectText = (buff) => {
    // Handle stat buffs
    if (buff.appliedEffects?.stats) {
        const effectStrings = Object.entries(buff.appliedEffects.stats).map(([stat, value]) => {
            if (value === 0)
                return '';
            const numericValue = typeof value === 'number' ? value : value.base || 0;
            const sign = numericValue > 0 ? '+' : '';
            const originalEffect = buff.effects?.stats?.[stat];
            if (typeof originalEffect === 'object' && originalEffect.percent) {
                return `${sign}${((originalEffect.percent) * 100).toFixed(0)}% ${stat.toUpperCase()}`;
            }
            return `${sign}${numericValue} ${stat.toUpperCase()}`;
        });
        return effectStrings.filter(s => s).join(', ');
    }
    // Handle triggered effects
    const reflectEffect = buff.effects?.triggered?.on_take_damage;
    if (reflectEffect?.type === 'reflect_damage' && reflectEffect.percent) {
        return `Reflects ${reflectEffect.percent * 100}% of damage taken.`;
    }
    return buff.description;
};
const ActiveBuffsDisplay = () => {
    const { player } = (0, useGameStore_1.useGameStore)();
    if (!player.activeBuffs || player.activeBuffs.length === 0) {
        return null;
    }
    return ((0, jsx_runtime_1.jsx)("div", { style: {
            position: 'fixed',
            bottom: '20px',
            left: '20px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            zIndex: 1000
        }, children: player.activeBuffs.map(buff => ((0, jsx_runtime_1.jsx)(RichTooltip_1.default, { content: `${buff.name}: ${buff.description}`, children: (0, jsx_runtime_1.jsxs)("div", { style: {
                    padding: '8px 12px',
                    background: 'rgba(34, 197, 94, 0.2)',
                    border: '1px solid var(--success)',
                    borderRadius: '6px',
                    color: 'var(--text-primary)',
                    fontSize: '0.85rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                    cursor: 'help'
                }, children: [(0, jsx_runtime_1.jsx)("strong", { children: buff.name }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--success-dark)', fontWeight: 'bold' }, children: getBuffEffectText(buff) }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)', fontSize: '0.8rem', marginTop: '4px' }, children: buff.durationType === 'ticks' ? `Time Left: ${buff.duration}` : `Uses Left: ${buff.duration}` })] }, buff.id) }, buff.id))) }));
};
exports.ActiveBuffsDisplay = ActiveBuffsDisplay;
