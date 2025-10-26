import { Rarity } from '@/types';



export interface CultivationTechnique {
  id: string;
  name: string;
  description: string;
  rarity: Rarity;
  unlockCondition: string;
  daoType: 'Sword Dao' | 'Body Refinement' | 'Heavenly Domain' | 'Movement Art' | 'Soul Technique' | 'Fate Law' | 'Elemental Art' | 'Transformation' | 'Heavenly Resonance';
  effects: {
    might: number;
    cooldown: number;
    xianxiaEffects?: string[];
  };
}

// Cultivation techniques as unique abilities (inspired by xianxia novels)

export const CULTIVATION_TECHNIQUES: CultivationTechnique[] = [
  // ...existing techniques...
  {
    id: 'sword_ruptures_heaven',
    name: 'Sword That Ruptures Heaven',
    description: 'A supreme Sword Dao technique that splits the heavens and sunders fate itself.',
    rarity: "B",
    unlockCondition: 'Comprehend Sword Dao at the peak of a tribulation.',
    daoType: 'Sword Dao',
    effects: { might: 9999, cooldown: 10, xianxiaEffects: ['heaven_split', 'fate_sunder'] }
  },
  {
    id: 'undying_immortal_body',
    name: 'Undying Immortal Body',
    description: 'A body refinement art that grants endless regeneration and immunity to mortal wounds.',
    rarity: 'mythical',
    unlockCondition: 'Survive a Heavenly Tribulation and gain enlightenment.',
    daoType: 'Body Refinement',
    effects: { might: 8000, cooldown: 30, xianxiaEffects: ['endless_regeneration', 'mortal_immunity'] }
  },
  {
    id: 'domain_of_providence',
    name: 'Domain of Providence',
    description: 'A Heavenly Domain that manipulates fate and luck, shielding the cultivator from calamity.',
    rarity: "D",
    unlockCondition: 'Unlock after a series of fortuitous encounters and lucky escapes.',
    daoType: 'Heavenly Domain',
    effects: { might: 7000, cooldown: 20, xianxiaEffects: ['fate_manipulation', 'luck_shield'] }
  },
  {
    id: 'void_walking_steps',
    name: 'Void Walking Steps',
    description: 'A movement art that allows the cultivator to traverse the void and evade all attacks.',
    rarity: 'mythical',
    unlockCondition: 'Find the Void Scripture in a rare event.',
    daoType: 'Movement Art',
    effects: { might: 6000, cooldown: 5, xianxiaEffects: ['void_traverse', 'attack_evasion'] }
  },
  {
    id: 'heavenly_pulse_resonance',
    name: 'Heavenly Pulse Resonance',
    description: 'A support technique that unleashes a burst of heavenly resonance, greatly increasing all attributes for a short time.',
    rarity: "D",
    unlockCondition: 'Complete the first major story arc.',
    daoType: 'Heavenly Resonance',
    effects: { might: 5000, cooldown: 15, xianxiaEffects: ['attribute_boost', 'divine_resistance'] }
  },
  // --- Expansion: 45+ more techniques ---
  {
    id: 'starforged_sword_domain',
    name: 'Starforged Sword Domain',
    description: 'Unleashes a domain of sword energy forged from the stars, overwhelming all foes.',
    rarity: "B",
    unlockCondition: 'Master the Starforged Sword Manual.',
    daoType: 'Sword Dao',
    effects: { might: 9500, cooldown: 12, xianxiaEffects: ['star_sword_domain', 'overwhelm'] }
  },
  {
    id: 'phoenix_rebirth_flame',
    name: 'Phoenix Rebirth Flame',
    description: 'Summons the flames of rebirth, healing wounds and burning enemies.',
    rarity: 'mythical',
    unlockCondition: 'Obtain the Phoenix Rebirth Art.',
    daoType: 'Elemental Art',
    effects: { might: 8200, cooldown: 18, xianxiaEffects: ['rebirth_flame', 'phoenix_heal'] }
  },
  {
    id: 'chaos_origin_strike',
    name: 'Chaos Origin Strike',
    description: 'A primordial chaos attack that distorts reality and devastates the battlefield.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Primordial Chaos.',
    daoType: 'Fate Law',
    effects: { might: 10000, cooldown: 20, xianxiaEffects: ['chaos_distortion', 'reality_break'] }
  },
  {
    id: 'moonshadow_concealment',
    name: 'Moonshadow Concealment',
    description: 'Allows the cultivator to vanish under moonlight, evading detection and attacks.',
    rarity: "D",
    unlockCondition: 'Master the Moonshadow Concealment Technique.',
    daoType: 'Movement Art',
    effects: { might: 6000, cooldown: 8, xianxiaEffects: ['moonlight_vanish', 'stealth'] }
  },
  {
    id: 'samsara_cycle',
    name: 'Samsara Cycle',
    description: 'Manipulates the cycle of reincarnation, restoring life or banishing souls.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Samsara.',
    daoType: 'Soul Technique',
    effects: { might: 9800, cooldown: 25, xianxiaEffects: ['reincarnation', 'soul_banish'] }
  },
  {
    id: 'heavenly_law_comprehension',
    name: 'Heavenly Law Comprehension',
    description: 'Grants insight into the laws of heaven, boosting all cultivation.',
    rarity: "D",
    unlockCondition: 'Complete the Heavenly Law Comprehension Manual.',
    daoType: 'Fate Law',
    effects: { might: 7000, cooldown: 10, xianxiaEffects: ['law_insight', 'cultivation_boost'] }
  },
  {
    id: 'spirit_beast_taming',
    name: 'Spirit Beast Taming',
    description: 'Allows the cultivator to tame and command spirit beasts.',
    rarity: "E",
    unlockCondition: 'Obtain the Spirit Beast Taming Art.',
    daoType: 'Transformation',
    effects: { might: 5000, cooldown: 20, xianxiaEffects: ['beast_taming', 'command'] }
  },
  {
    id: 'fate_weaving_hand',
    name: 'Fate Weaving Hand',
    description: 'Manipulates the threads of fate, altering destiny for self or others.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Fate.',
    daoType: 'Fate Law',
    effects: { might: 9900, cooldown: 22, xianxiaEffects: ['fate_weave', 'destiny_alter'] }
  },
  {
    id: 'eternal_nightshade',
    name: 'Eternal Nightshade',
    description: 'Summons the power of eternal night, shrouding the battlefield in darkness.',
    rarity: 'mythical',
    unlockCondition: 'Master the Eternal Nightshade Scripture.',
    daoType: 'Elemental Art',
    effects: { might: 8000, cooldown: 16, xianxiaEffects: ['night_shroud', 'darkness_domain'] }
  },
  {
    id: 'heavenly_star_chart',
    name: 'Heavenly Star Chart',
    description: 'Unleashes the power of the stars, boosting all Dao comprehension.',
    rarity: "D",
    unlockCondition: 'Complete the Heavenly Star Chart Manual.',
    daoType: 'Heavenly Resonance',
    effects: { might: 6500, cooldown: 14, xianxiaEffects: ['star_power', 'dao_boost'] }
  },
  {
    id: 'primordial_chaos_body',
    name: 'Primordial Chaos Body',
    description: 'Transforms the cultivator’s body into primordial chaos, granting immense power.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Primordial Chaos.',
    daoType: 'Transformation',
    effects: { might: 10000, cooldown: 30, xianxiaEffects: ['chaos_body', 'power_surge'] }
  },
  {
    id: 'lotus_heart_meditation',
    name: 'Lotus Heart Meditation',
    description: 'Calms the mind and purifies the soul, boosting spiritual defenses.',
    rarity: "E",
    unlockCondition: 'Master the Lotus Heart Meditation.',
    daoType: 'Soul Technique',
    effects: { might: 4800, cooldown: 12, xianxiaEffects: ['soul_purification', 'spirit_defense'] }
  },
  {
    id: 'thunder_emperor_wrath',
    name: 'Thunder Emperor’s Wrath',
    description: 'Summons a storm of thunder, devastating all enemies.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Thunder.',
    daoType: 'Elemental Art',
    effects: { might: 9800, cooldown: 18, xianxiaEffects: ['thunder_storm', 'devastation'] }
  },
  {
    id: 'frostjade_immortal_domain',
    name: 'Frostjade Immortal Domain',
    description: 'Creates a domain of absolute frost, freezing all within.',
    rarity: 'mythical',
    unlockCondition: 'Master the Frostjade Immortal Scripture.',
    daoType: 'Heavenly Domain',
    effects: { might: 8200, cooldown: 20, xianxiaEffects: ['absolute_frost', 'domain_freeze'] }
  },
  {
    id: 'spirit_sealing_array',
    name: 'Spirit Sealing Array',
    description: 'Seals the spirits of enemies, preventing their escape or resurrection.',
    rarity: "D",
    unlockCondition: 'Complete the Spirit Sealing Technique.',
    daoType: 'Fate Law',
    effects: { might: 7000, cooldown: 15, xianxiaEffects: ['spirit_seal', 'resurrection_block'] }
  },
  {
    id: 'heavenly_tribulation_survival',
    name: 'Heavenly Tribulation Survival',
    description: 'Grants the ability to survive even the deadliest heavenly tribulations.',
    rarity: "B",
    unlockCondition: 'Survive a Heavenly Tribulation.',
    daoType: 'Body Refinement',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['tribulation_survival', 'body_fortification'] }
  },
  {
    id: 'dao_of_luck',
    name: 'Dao of Luck',
    description: 'Manipulates luck to favor the cultivator in all endeavors.',
    rarity: "D",
    unlockCondition: 'Comprehend the Dao of Luck.',
    daoType: 'Fate Law',
    effects: { might: 7000, cooldown: 10, xianxiaEffects: ['luck_manipulation', 'fortune_boost'] }
  },
  {
    id: 'heavenly_opportunity_grasp',
    name: 'Heavenly Opportunity Grasp',
    description: 'Allows the cultivator to seize rare opportunities and fortuitous encounters.',
    rarity: "D",
    unlockCondition: 'Unlock after a series of lucky events.',
    daoType: 'Heavenly Resonance',
    effects: { might: 6500, cooldown: 12, xianxiaEffects: ['opportunity_grasp', 'luck_enhance'] }
  },
  {
    id: 'dao_of_destiny',
    name: 'Dao of Destiny',
    description: 'Grants mastery over destiny, allowing the cultivator to rewrite fate.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Destiny.',
    daoType: 'Fate Law',
    effects: { might: 10000, cooldown: 25, xianxiaEffects: ['destiny_rewrite', 'fate_control'] }
  },
  {
    id: 'heavenly_will_manifestation',
    name: 'Heavenly Will Manifestation',
    description: 'Manifests the will of heaven, empowering all actions.',
    rarity: "B",
    unlockCondition: 'Comprehend the Will of Heaven.',
    daoType: 'Heavenly Resonance',
    effects: { might: 10000, cooldown: 20, xianxiaEffects: ['will_manifest', 'action_empower'] }
  },
  {
    id: 'dao_of_karma',
    name: 'Dao of Karma',
    description: 'Manipulates karma, bringing retribution or reward.',
    rarity: "D",
    unlockCondition: 'Comprehend the Dao of Karma.',
    daoType: 'Fate Law',
    effects: { might: 7000, cooldown: 15, xianxiaEffects: ['karma_manipulation', 'retribution'] }
  },
  {
    id: 'heavenly_blessing',
    name: 'Heavenly Blessing',
    description: 'Bestows a blessing from the heavens, greatly increasing luck and protection.',
    rarity: "D",
    unlockCondition: 'Receive a heavenly blessing in a rare event.',
    daoType: 'Heavenly Resonance',
    effects: { might: 6500, cooldown: 10, xianxiaEffects: ['blessing', 'luck_protection'] }
  },
  {
    id: 'dao_of_fortune',
    name: 'Dao of Fortune',
    description: 'Grants mastery over fortune, attracting wealth and opportunity.',
    rarity: "D",
    unlockCondition: 'Comprehend the Dao of Fortune.',
    daoType: 'Fate Law',
    effects: { might: 7000, cooldown: 10, xianxiaEffects: ['fortune_attraction', 'wealth_boost'] }
  },
  {
    id: 'heavenly_star_chart',
    name: 'Heavenly Star Chart',
    description: 'Unleashes the power of the stars, boosting all Dao comprehension.',
    rarity: "D",
    unlockCondition: 'Complete the Heavenly Star Chart Manual.',
    daoType: 'Heavenly Resonance',
    effects: { might: 6500, cooldown: 14, xianxiaEffects: ['star_power', 'dao_boost'] }
  },
  {
    id: 'dao_of_space_time',
    name: 'Dao of Space-Time',
    description: 'Manipulates space and time, allowing for teleportation and time dilation.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Space-Time.',
    daoType: 'Fate Law',
    effects: { might: 10000, cooldown: 30, xianxiaEffects: ['space_manipulation', 'time_dilation'] }
  },
  {
    id: 'heavenly_dreamwalking',
    name: 'Heavenly Dreamwalking',
    description: 'Allows the cultivator to enter and manipulate dreams.',
    rarity: 'mythical',
    unlockCondition: 'Master the Heavenly Dreamwalking Art.',
    daoType: 'Soul Technique',
    effects: { might: 8000, cooldown: 18, xianxiaEffects: ['dream_entry', 'dream_manipulation'] }
  },
  {
    id: 'dao_of_illusion',
    name: 'Dao of Illusion',
    description: 'Creates powerful illusions to deceive and control enemies.',
    rarity: "D",
    unlockCondition: 'Comprehend the Dao of Illusion.',
    daoType: 'Soul Technique',
    effects: { might: 7000, cooldown: 12, xianxiaEffects: ['illusion_creation', 'mind_control'] }
  },
  {
    id: 'heavenly_memory_recall',
    name: 'Heavenly Memory Recall',
    description: 'Recalls ancient memories, granting insight and wisdom.',
    rarity: "E",
    unlockCondition: 'Master the Heavenly Memory Recall Manual.',
    daoType: 'Soul Technique',
    effects: { might: 5000, cooldown: 10, xianxiaEffects: ['memory_recall', 'wisdom_boost'] }
  },
  {
    id: 'dao_of_progenitors',
    name: 'Dao of Progenitors',
    description: 'Grants the power of ancient progenitors, boosting all stats.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Progenitors.',
    daoType: 'Transformation',
    effects: { might: 10000, cooldown: 30, xianxiaEffects: ['progenitor_power', 'stat_boost'] }
  },
  {
    id: 'heavenly_fate_weaving',
    name: 'Heavenly Fate Weaving',
    description: 'Weaves the threads of fate, altering destiny for all.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Fate.',
    daoType: 'Fate Law',
    effects: { might: 10000, cooldown: 25, xianxiaEffects: ['fate_weaving', 'destiny_alter'] }
  },
  {
    id: 'dao_of_unity',
    name: 'Dao of Unity',
    description: 'Unites all Daos, granting harmony and immense power.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Unity.',
    daoType: 'Heavenly Resonance',
    effects: { might: 10000, cooldown: 30, xianxiaEffects: ['dao_unity', 'harmony'] }
  },
  {
    id: 'heavenly_harmony',
    name: 'Heavenly Harmony',
    description: 'Grants perfect harmony with the heavens, boosting all cultivation.',
    rarity: "D",
    unlockCondition: 'Achieve harmony with the heavens.',
    daoType: 'Heavenly Resonance',
    effects: { might: 7000, cooldown: 12, xianxiaEffects: ['harmony', 'cultivation_boost'] }
  },
  {
    id: 'dao_of_creation',
    name: 'Dao of Creation',
    description: 'Grants the power to create worlds and life.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Creation.',
    daoType: 'Transformation',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['world_creation', 'life_creation'] }
  },
  {
    id: 'heavenly_unity',
    name: 'Heavenly Unity',
    description: 'Unites the cultivator with the heavens, granting immense power.',
    rarity: "B",
    unlockCondition: 'Achieve unity with the heavens.',
    daoType: 'Heavenly Resonance',
    effects: { might: 10000, cooldown: 30, xianxiaEffects: ['heaven_unity', 'power_surge'] }
  },
  {
    id: 'dao_of_destruction',
    name: 'Dao of Destruction',
    description: 'Grants the power to destroy worlds and Daos.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Destruction.',
    daoType: 'Transformation',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['world_destruction', 'dao_destruction'] }
  },
  {
    id: 'heavenly_destruction',
    name: 'Heavenly Destruction',
    description: 'Unleashes the destructive power of the heavens.',
    rarity: "B",
    unlockCondition: 'Achieve destruction with the heavens.',
    daoType: 'Heavenly Resonance',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['heaven_destruction', 'power_surge'] }
  },
  {
    id: 'dao_of_rebirth',
    name: 'Dao of Rebirth',
    description: 'Grants the power to be reborn and start anew.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Rebirth.',
    daoType: 'Transformation',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['rebirth', 'new_beginning'] }
  },
  {
    id: 'heavenly_rebirth',
    name: 'Heavenly Rebirth',
    description: 'Unleashes the power of heavenly rebirth.',
    rarity: "B",
    unlockCondition: 'Achieve rebirth with the heavens.',
    daoType: 'Heavenly Resonance',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['heaven_rebirth', 'new_beginning'] }
  },
  {
    id: 'dao_of_eternity',
    name: 'Dao of Eternity',
    description: 'Grants the power of eternal existence.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Eternity.',
    daoType: 'Transformation',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['eternity', 'immortality'] }
  },
  {
    id: 'heavenly_eternity',
    name: 'Heavenly Eternity',
    description: 'Unleashes the power of heavenly eternity.',
    rarity: "B",
    unlockCondition: 'Achieve eternity with the heavens.',
    daoType: 'Heavenly Resonance',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['heaven_eternity', 'immortality'] }
  },
  {
    id: 'dao_of_primordial_chaos',
    name: 'Dao of Primordial Chaos',
    description: 'Grants the power of primordial chaos.',
    rarity: "B",
    unlockCondition: 'Comprehend the Dao of Primordial Chaos.',
    daoType: 'Transformation',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['primordial_chaos', 'chaos_power'] }
  },
  {
    id: 'heavenly_chaos',
    name: 'Heavenly Chaos',
    description: 'Unleashes the power of heavenly chaos.',
    rarity: "B",
    unlockCondition: 'Achieve chaos with the heavens.',
    daoType: 'Heavenly Resonance',
    effects: { might: 10000, cooldown: 40, xianxiaEffects: ['heaven_chaos', 'chaos_power'] }
  }
];
