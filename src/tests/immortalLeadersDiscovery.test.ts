import allMentors from '@/data/mentors_runtime';
import { ALL_SKILLS } from '@/data/skills';

describe('Immortal leaders discovery and unlocks mapping', () => {
  test('all immortal leaders are present in runtime mentors and their unlocks reference real skills', () => {
    // List of expected immortal leader ids added earlier
    const expectedLeaderIds = [
      'mentor_shaolin_abbot','mentor_wudang_master','mentor_emei_matron','mentor_kunlun_eldest',
      'mentor_beggars_chief','mentor_huashan_master','mentor_xingyun_prophet','mentor_ming_patron',
      'mentor_wanshou_guardian','mentor_qingcheng_lama','mentor_celestial_demon_overlord','mentor_shu_sword_sage',
      'mentor_heavenly_dao_chancellor','mentor_lingxiao_matron'
    ];

    const mentorIds = allMentors.map((m: any) => m.id);
    expectedLeaderIds.forEach(id => {
      expect(mentorIds).toContain(id);
      const mentor = allMentors.find((m: any) => m.id === id);
      expect(mentor).toBeDefined();

      // If teachingProgression exists, ensure unlocks map to skill ids in ALL_SKILLS
      const progression = (mentor as any).teachingProgression;
      if (progression && progression.tiers) {
        progression.tiers.forEach((tier: any) => {
          if (tier.unlocks && Array.isArray(tier.unlocks)) {
            tier.unlocks.forEach((u: string) => {
              const found = ALL_SKILLS.find(s => s.id === u);
              if (!found) throw new Error(`Unlock ${u} for ${id} should exist in ALL_SKILLS`);
              expect(found).toBeDefined();
            });
          }
        });
      }
    });
  });
});
