"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SCHOOL_SKILLS = void 0;
// School techniques taught in academies and martial halls
exports.SCHOOL_SKILLS = [];
const schools = ['Southern Academy', 'Sword Hall', 'Poison Conservatory', 'Monastic Temple', 'Storm Armoury'];
const modalities = ['Form', 'Barrage', 'Seal', 'Cleansing', 'Counter'];
for (let s = 0; s < schools.length; s++) {
    for (let i = 0; i < 16; i++) { // expand skills per school to 16
        exports.SCHOOL_SKILLS.push({
            id: `${schools[s].toLowerCase().replace(/\s+/g, '_')}_skill_${i}`,
            name: `${schools[s]} ${modalities[i % modalities.length]} ${i + 1}`,
            tier: 1 + (i % 5),
            power: 12 + (s * 2) + (i * 3),
            cooldown: 1 + (i % 4),
            cost: { ap: 0 + Math.floor(i / 3), qi: Math.max(0, 3 + (i % 7)) },
            type: 'training',
            apCost: 0 + Math.floor(i / 3),
            qiCost: Math.max(0, 3 + (i % 7)),
            effects: [{ type: 'buff', target: 'self', stat: 'focus', value: 5 + (i % 6), duration: 2 }],
            description: `A training technique from the ${schools[s]} used in examinations and sparring.`,
        });
    }
}
exports.default = exports.SCHOOL_SKILLS;
