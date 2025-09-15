"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsx_runtime_1 = require("react/jsx-runtime");
const useGameStore_1 = require("@/store/useGameStore");
const SkillEvolutionTest = () => {
    const { player, gainSkillExp, evolveSkill, addEventLog } = (0, useGameStore_1.useGameStore)();
    const testSkillEvolution = () => {
        // Test weaponMastery evolution
        const weaponMastery = player.skills.weaponMastery;
        if (weaponMastery && weaponMastery.level >= 5) {
            // Try to evolve to Sword Qi
            evolveSkill('weaponMastery', 'Sword Qi');
        }
        else if (weaponMastery) {
            // Add enough exp to reach level 5
            const expNeeded = weaponMastery.expToNext * 5 - weaponMastery.exp;
            gainSkillExp('weaponMastery', expNeeded);
            addEventLog(`Added ${expNeeded} exp to weaponMastery to test evolution!`);
        }
    };
    const testInvalidEvolution = () => {
        // Test invalid evolution path
        evolveSkill('weaponMastery', 'Invalid Path');
    };
    return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: '20px', border: '1px solid #ccc', margin: '10px' }, children: [(0, jsx_runtime_1.jsx)("h3", { children: "Skill Evolution Test" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Weapon Mastery:" }), " Level ", player.skills.weaponMastery?.level || 'N/A', ", EXP: ", player.skills.weaponMastery?.exp || 0, "/", player.skills.weaponMastery?.expToNext || 0] }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("strong", { children: "Sword Qi:" }), " ", player.skills.sword_qi ? `Level ${player.skills.sword_qi.level}` : 'Not evolved yet'] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: '10px' }, children: [(0, jsx_runtime_1.jsx)("button", { onClick: testSkillEvolution, style: { marginRight: '10px' }, children: "Test Evolution" }), (0, jsx_runtime_1.jsx)("button", { onClick: testInvalidEvolution, style: { backgroundColor: '#ff6b6b' }, children: "Test Invalid Evolution" })] }), (0, jsx_runtime_1.jsx)("div", { style: { marginTop: '10px', fontSize: '12px', color: '#666' }, children: "Note: Evolution becomes available at level 5, 10, 15, 20, 25, or 30" })] }));
};
exports.default = SkillEvolutionTest;
