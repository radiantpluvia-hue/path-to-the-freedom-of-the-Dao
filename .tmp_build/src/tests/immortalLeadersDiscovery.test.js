"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mentors_runtime_1 = __importDefault(require("@/data/mentors_runtime"));
const skills_1 = require("@/data/skills");
describe('Immortal leaders discovery and unlocks mapping', () => {
    test('all immortal leaders are present in runtime mentors and their unlocks reference real skills', () => {
        // List of expected immortal leader ids added earlier
        const expectedLeaderIds = [
            'mentor_shaolin_abbot', 'mentor_wudang_master', 'mentor_emei_matron', 'mentor_kunlun_eldest',
            'mentor_beggars_chief', 'mentor_huashan_master', 'mentor_xingyun_prophet', 'mentor_ming_patron',
            'mentor_wanshou_guardian', 'mentor_qingcheng_lama', 'mentor_celestial_demon_overlord', 'mentor_shu_sword_sage',
            'mentor_heavenly_dao_chancellor', 'mentor_lingxiao_matron'
        ];
        const mentorIds = mentors_runtime_1.default.map((m) => m.id);
        expectedLeaderIds.forEach(id => {
            expect(mentorIds).toContain(id);
            const mentor = mentors_runtime_1.default.find((m) => m.id === id);
            expect(mentor).toBeDefined();
            // If teachingProgression exists, ensure unlocks map to skill ids in ALL_SKILLS
            const progression = mentor.teachingProgression;
            if (progression && progression.tiers) {
                progression.tiers.forEach((tier) => {
                    if (tier.unlocks && Array.isArray(tier.unlocks)) {
                        tier.unlocks.forEach((u) => {
                            const found = skills_1.ALL_SKILLS.find(s => s.id === u);
                            if (!found)
                                throw new Error(`Unlock ${u} for ${id} should exist in ALL_SKILLS`);
                            expect(found).toBeDefined();
                        });
                    }
                });
            }
        });
    });
});
