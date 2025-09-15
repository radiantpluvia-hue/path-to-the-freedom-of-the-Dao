import { Rival, RivalEncounter, FactionBattle } from '../types';
import { MAJOR_SECTS, MAJOR_FACTIONS, Sect } from './SectSystem';
import type { CombatParticipant } from './CombatSystem';
import { RIVAL_ARCHETYPES, getRandomArchetype, getArchetypeById, type RivalArchetype } from '../data/rivalArchetypes';
import { RivalAISystem } from './RivalAISystem';
import { runtimeRng } from '@/utils/seededRng';

export interface RivalGenerationOptions {
  minLevel?: number;
  maxLevel?: number;
  faction?: string;
  sect?: string;
  // If true, suppress console warnings and use quiet fallbacks (useful for tests)
  silent?: boolean;
  personality?: Rival['personality'];
}

export class RivalSystem {
  private rivals: Rival[] = [];
  private encounters: RivalEncounter[] = [];
  private factionBattles: FactionBattle[] = [];
  private aiSystem: RivalAISystem | null = null;
  private externalRng?: () => number;
  constructor(rng?: () => number) {
    this.externalRng = rng;
    this.initializeDefaultRivals();
    this.aiSystem = new RivalAISystem();
  }

  private rng(): number {
    try {
  return (this.externalRng && typeof this.externalRng === 'function') ? this.externalRng() : runtimeRng();
    } catch (e) {
      /* intentionally ignored */
      return runtimeRng();
    }
  }

  // Expose RNG function for other systems to use when available
  public getRng(): () => number {
  return (this.externalRng && typeof this.externalRng === 'function') ? this.externalRng : runtimeRng;
  }

  private initializeDefaultRivals(): void {
    // Default rivals from major sects
    this.rivals = [
      {
        id: 'azure_disciple_li',
        name: 'Li Feng',
        title: 'Azure Cloud Disciple',
        description: 'A talented disciple from Azure Cloud Sect, always seeking to prove his superiority.',
        faction: 'immortal_court',
        sect: 'azure_cloud_sect',
        realm: 'qi_condensation',
        level: 15,
        stats: { hp: 250, qi: 200, atk: 35, def: 25, speed: 30 },
        techniques: ['azure_sword_art', 'cloud_step', 'qi_blast'],
        personality: 'aggressive',
        relationship: -30,
        lastEncounter: 0,
        encounterCount: 0,
        defeated: false,
        specialAbilities: ['cloud_evasion', 'sword_dao_insight'],
        loot: [
          { name: 'Azure Sword Manual', description: 'Basic sword techniques of Azure Cloud Sect', value: 150 },
          { name: 'Spirit Stones', description: 'Medium grade spirit stones', value: 50 }
        ]
      },
      {
        id: 'blood_moon_cultist',
        name: 'Xue Mei',
        title: 'Blood Moon Cultist',
        description: 'A dangerous cultivator from the Blood Moon Sect, known for her ruthless techniques.',
        faction: 'shadow_thieves_guild',
        sect: 'blood_moon_sect',
        realm: 'foundation_establishment',
        level: 25,
        stats: { hp: 300, qi: 250, atk: 45, def: 20, speed: 35 },
        techniques: ['blood_sacrifice', 'crimson_claw', 'soul_devouring_art'],
        personality: 'treacherous',
        relationship: -60,
        lastEncounter: 0,
        encounterCount: 0,
        defeated: false,
        specialAbilities: ['blood_empowerment', 'shadow_movement'],
        loot: [
          { name: 'Forbidden Blood Manual', description: 'Dark cultivation techniques', value: 200 },
          { name: 'Blood Essence', description: 'Concentrated life force', value: 75 }
        ]
      },
      {
        id: 'eternal_scholar_wang',
        name: 'Wang Jun',
        title: 'Eternal Dao Scholar',
        description: 'A knowledgeable scholar from Eternal Dao Academy, values intellectual superiority.',
        faction: 'dao_research_institute',
        sect: 'eternal_dao_academy',
        realm: 'core_formation',
        level: 35,
        stats: { hp: 280, qi: 350, atk: 30, def: 35, speed: 25 },
        techniques: ['dao_comprehension', 'reality_analysis', 'defensive_stance'],
        personality: 'honorable',
        relationship: -10,
        lastEncounter: 0,
        encounterCount: 0,
        defeated: false,
        specialAbilities: ['knowledge_absorption', 'reality_perception'],
        loot: [
          { name: 'Ancient Dao Text', description: 'Rare philosophical text', value: 300 },
          { name: 'Research Notes', description: 'Valuable cultivation insights', value: 100 }
        ]
      }
    ];
  }

  public generateRival(options: RivalGenerationOptions = {}): Rival {
    const {
      minLevel = 5,
      maxLevel = 50,
      faction,
      sect,
      personality
    } = options;

    // Select archetype based on options with null safety
    const factionBias = faction ? [faction] : undefined;
    const sectBias = sect ? [sect] : undefined;
    const archetype = getRandomArchetype(factionBias, sectBias);

    // Fallback if archetype generation fails
    if (!archetype) {
      if (!options.silent) console.warn('Failed to generate archetype, using fallback');
      const fallbackRival = this.generateFallbackRival(options);
      this.addRival(fallbackRival);
      return fallbackRival;
    }

    // Override personality if specified
    const selectedPersonality = personality || archetype.personality;

    // Generate level with some variance
  const baseLevel = Math.floor(this.rng() * (maxLevel - minLevel + 1)) + minLevel;
  const level = Math.max(minLevel, Math.min(maxLevel, baseLevel + Math.floor(this.rng() * 6) - 3)); // ±3 level variance

    // Select sect and faction based on archetype preferences with null safety
    const availableSects = (archetype.sectBias && archetype.sectBias.length > 0)
      ? MAJOR_SECTS.filter(s => archetype.sectBias.includes(s.type))
      : MAJOR_SECTS;
    const availableFactions = (archetype.factionBias && archetype.factionBias.length > 0)
      ? MAJOR_FACTIONS.filter(f => archetype.factionBias.includes(f.type))
      : MAJOR_FACTIONS;

    // Ensure we have valid selections with additional validation
    if (availableSects.length === 0 || availableFactions.length === 0) {
      if (!options.silent) console.warn('No valid sects or factions available, using fallback');
      const fallbackRival = this.generateFallbackRival(options);
      this.addRival(fallbackRival);
      return fallbackRival;
    }

    // Additional validation for array integrity
    if (!Array.isArray(MAJOR_SECTS) || MAJOR_SECTS.length === 0) {
      if (!options.silent) console.error('MAJOR_SECTS array is invalid or empty');
      const fallbackRival = this.generateFallbackRival(options);
      this.addRival(fallbackRival);
      return fallbackRival;
    }

    if (!Array.isArray(MAJOR_FACTIONS) || MAJOR_FACTIONS.length === 0) {
      if (!options.silent) console.error('MAJOR_FACTIONS array is invalid or empty');
      const fallbackRival = this.generateFallbackRival(options);
      this.addRival(fallbackRival);
      return fallbackRival;
    }

  const randomSect = availableSects[Math.floor(this.rng() * availableSects.length)];
  const randomFaction = availableFactions[Math.floor(this.rng() * availableFactions.length)];

    // Calculate stats using archetype template and level scaling
    const stats = this.calculateArchetypeStats(archetype, level);

    // Generate techniques combining archetype and sect-specific
    const techniques = this.generateArchetypeTechniques(archetype, randomSect, level);

    // Generate special abilities
    const specialAbilities = this.generateArchetypeAbilities(archetype, randomSect, level);

    // Generate loot based on archetype
    const loot = this.generateArchetypeLoot(archetype, randomSect, level);

    // Generate title based on archetype and sect
    const title = this.generateArchetypeTitle(archetype, randomSect, level);

    // Generate description
    const description = this.generateArchetypeDescription(archetype, randomSect, selectedPersonality);

    const rival: Rival = {
  id: `rival_${Date.now()}_${Math.floor(this.rng() * 1e9).toString(36)}`,
      name: this.generateRivalName(),
      title,
      description,
      faction: randomFaction.id,
      sect: randomSect.id,
      realm: this.getRealmForLevel(level),
      level,
      stats,
      techniques,
      personality: selectedPersonality,
      relationship: this.getInitialRelationship(selectedPersonality),
      lastEncounter: 0,
      encounterCount: 0,
      defeated: false,
      specialAbilities,
      loot,
      archetype: archetype.id,
      growthStage: 1,
      lastGrowth: Date.now(),
      teachingAffinity: this.calculateTeachingAffinity(archetype, selectedPersonality),
      storyProgression: {}
    };

    // Add the rival to the system
    this.addRival(rival);

    return rival;
  }

  private generateFallbackRival(options: RivalGenerationOptions = {}): Rival {
    const {
      minLevel = 5,
      maxLevel = 50,
      faction,
      sect,
      personality = 'neutral'
    } = options;

    // Generate basic level
  const level = Math.floor(this.rng() * (maxLevel - minLevel + 1)) + minLevel;

    // Use first available sect and faction as fallback
    const fallbackSect = MAJOR_SECTS[0] || { id: 'unknown_sect', name: 'Unknown Sect', type: 'neutral' as const };
    const fallbackFaction = MAJOR_FACTIONS[0] || { id: 'unknown_faction', name: 'Unknown Faction', type: 'political' as const };

    // Basic stats calculation
    const stats = {
      hp: 100 + (level * 10),
      qi: 80 + (level * 8),
      atk: 15 + (level * 1.5),
      def: 12 + (level * 1.2),
      speed: 10 + (level * 1)
    };

    return {
  id: `fallback_rival_${Date.now()}_${Math.floor(this.rng() * 1e9).toString(36)}`,
      name: this.generateRivalName(),
      title: 'Cultivator',
      description: 'A wandering cultivator seeking enlightenment.',
      faction: faction || fallbackFaction.id,
      sect: sect || fallbackSect.id,
      realm: this.getRealmForLevel(level),
      level,
      stats,
      techniques: ['basic_attack', 'qi_blast'],
      personality,
      relationship: this.getInitialRelationship(personality),
      lastEncounter: 0,
      encounterCount: 0,
      defeated: false,
      specialAbilities: ['basic_cultivation'],
      loot: [
        { name: 'Spirit Stones', description: 'Basic cultivation resource', value: level * 2 }
      ],
      archetype: 'fallback',
      growthStage: 1,
      lastGrowth: Date.now(),
      teachingAffinity: 30,
      storyProgression: {}
    };
  }

  private generateRivalName(): string {
    const familyNames = ['Li', 'Wang', 'Zhang', 'Liu', 'Chen', 'Yang', 'Zhao', 'Huang', 'Zhou', 'Wu'];
    const givenNames = ['Feng', 'Wei', 'Ming', 'Jie', 'Tao', 'Xin', 'Yun', 'Long', 'Hu', 'Bao'];
  return `${familyNames[Math.floor(this.rng() * familyNames.length)]} ${givenNames[Math.floor(this.rng() * givenNames.length)]}`;
  }

  private getRealmForLevel(level: number): string {
    if (level < 10) return 'mortal';
    if (level < 20) return 'qi_condensation';
    if (level < 30) return 'foundation_establishment';
    if (level < 40) return 'core_formation';
    if (level < 50) return 'nascent_soul';
    return 'spirit_transformation';
  }

  // AI plumbing
  public attachAISystem(ai: any) {
    this.aiSystem = ai;
  }
  public getAISystem() {
    return this.aiSystem;
  }

  private generateRivalTechniques(sect: Sect, level: number): string[] {
    const techniques: string[] = ['basic_attack'];

    if (level >= 10) techniques.push('qi_blast');
    if (level >= 15) techniques.push('defensive_stance');

    // Add sect-specific techniques
    if (sect.benefits.techniques && sect.benefits.techniques.length > 0) {
      const availableSectTechs = sect.benefits.techniques.filter((_, index) =>
        index < Math.min(2, Math.floor(level / 10))
      );
      techniques.push(...availableSectTechs);
    }

    return techniques;
  }

  private generateSpecialAbilities(sect: Sect, level: number): string[] {
    const abilities: string[] = [];

    if (level >= 20) abilities.push('enhanced_cultivation');
    if (level >= 30) abilities.push('battle_instinct');

    // Sect-specific abilities based on sect type
    switch (sect.type) {
      case 'righteous':
        abilities.push('righteous_aura');
        break;
      case 'demonic':
        abilities.push('demonic_empowerment');
        break;
      case 'ancient':
        abilities.push('ancient_wisdom');
        break;
      case 'hidden':
        abilities.push('hidden_technique');
        break;
    }

    return abilities;
  }

  private generateLoot(sect: Sect, level: number): any[] {
    const loot = [
      { name: 'Spirit Stones', description: 'Basic cultivation resource', value: level * 2 }
    ];

  if (this.rng() < 0.3) {
      loot.push({
        name: `${sect.name} Manual Fragment`,
        description: 'Partial cultivation manual',
        value: level * 5
      });
    }

    return loot;
  }

  private getInitialRelationship(personality: Rival['personality']): number {
    switch (personality) {
      case 'aggressive': return -40;
      case 'treacherous': return -60;
      case 'cunning': return -20;
      case 'honorable': return -10;
      case 'neutral': return 0;
      default: return -20;
    }
  }

  public addRival(rival: Rival): void {
    this.rivals.push(rival);
  }

  public getRival(id: string): Rival | null {
    return this.rivals.find(r => r.id === id) || null;
  }

  public getAllRivals(): Rival[] {
    return [...this.rivals];
  }

  public getRivalsByFaction(factionId: string): Rival[] {
    return this.rivals.filter(r => r.faction === factionId);
  }

  public getRivalsBySect(sectId: string): Rival[] {
    return this.rivals.filter(r => r.sect === sectId);
  }

  // Map a Rival into a CombatParticipant for CombatSystem
  public updateRivalRelationship(rivalId: string, change: number, currentDay?: number): void {
    const rival = this.getRival(rivalId);
    if (rival) {
      rival.relationship = Math.max(-100, Math.min(100, rival.relationship + change));
      rival.lastEncounter = currentDay ?? Date.now();
      rival.encounterCount++;
    }
  }

  public recordCombatOutcome(rivalId: string, outcome: 'victory' | 'defeat' | 'flee', rounds: number = 0) {
    const ai = this.getAISystem?.() || null;
    const rival = this.getRival(rivalId) || this.getRival(rivalId.replace(/^rival_/, ''));
    if (!ai || !rival) return;
    try {
      if (outcome === 'victory' || outcome === 'defeat') {
        ai.recordCombatOutcome(rival.id, outcome === 'victory' ? 'defeat' : 'victory', rounds);
      }
      // We could track flee as a neutral outcome later
    } catch (e) {
      /* intentionally ignored */
    }
  }

  public addRivalEncounter(encounter: Omit<RivalEncounter, 'id' | 'timestamp'>): string {
  const id = `encounter_${Date.now()}_${Math.floor(this.rng() * 1e9).toString(36)}`;
    const newEncounter: RivalEncounter = {
      ...encounter,
      id,
      timestamp: Date.now()
    };
    this.encounters.push(newEncounter);
    return id;
  }

  public getRivalEncounters(rivalId?: string): RivalEncounter[] {
    if (rivalId) {
      return this.encounters.filter(e => e.rivalId === rivalId);
    }
    return [...this.encounters];
  }

  public markRivalDefeated(rivalId: string): void {
    const rival = this.getRival(rivalId);
    if (rival) {
      rival.defeated = true;
      rival.relationship = Math.max(-100, rival.relationship - 20); // Significant relationship penalty
      rival.lastEncounter = Date.now();
      rival.encounterCount++;
    }
  }

  public startFactionBattle(battle: Omit<FactionBattle, 'id' | 'outcome'>): string {
    const id = `battle_${Date.now()}`;
    this.factionBattles.push({ ...battle, id, outcome: 'ongoing' });
    return id;
  }

  public resolveFactionBattle(battleId: string, outcome: FactionBattle['outcome']): void {
    const battle = this.factionBattles.find(b => b.id === battleId);
    if (battle) {
      battle.outcome = outcome;
    }
  }

  public getFactionBattles(factionId?: string): FactionBattle[] {
    if (factionId) {
      return this.factionBattles.filter(b => b.factions.includes(factionId));
    }
    return [...this.factionBattles];
  }

  public canEncounterRival(rivalId: string, currentDay: number): boolean {
    const rival = this.getRival(rivalId);
    if (!rival) return false;

    // Minimum cooldown between encounters
    const daysSinceLastEncounter = currentDay - rival.lastEncounter;
    return daysSinceLastEncounter >= this.getEncounterCooldown(rival);
  }

  public getEncounterCooldown(rival: Rival): number {
    switch (rival.personality) {
      case 'aggressive': return 3;
      case 'treacherous': return 5;
      case 'cunning': return 7;
      case 'honorable': return 10;
      case 'neutral': return 15;
      default: return 10;
    }
  }

  public getEncounterCooldownById(rivalId: string): number {
    const rival = this.getRival(rivalId);
    return rival ? this.getEncounterCooldown(rival) : 10;
  }



  public getRivalAsCombatParticipant(rivalId: string): CombatParticipant | null {
    const rival = this.getRival(rivalId);
    if (!rival) return null;

    // Ensure the participant id follows the 'rival_' prefix convention used by CombatSystem
    const participantId = rival.id.startsWith('rival_') ? rival.id : `rival_${rival.id}`;

    return {
      id: participantId,
      name: rival.name,
      hp: rival.stats.hp,
      maxHp: rival.stats.hp,
      qi: rival.stats.qi,
      maxQi: rival.stats.qi,
      ap: 5, // Default action points
      maxAp: 5,
      stats: {
        atk: rival.stats.atk,
        def: rival.stats.def,
        speed: rival.stats.speed
      },
      techniques: this.mapRivalTechniques(rival.techniques),
      buffs: [],
      debuffs: []
    };
  }

  private mapRivalTechniques(techniqueIds: string[]): any[] {
    // This would map technique IDs to actual technique objects
    // For now, return basic technique templates
    return techniqueIds.map(id => ({
      id,
      name: id.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      description: `${id} technique`,
      apCost: 1,
      qiCost: 10,
      type: 'attack' as const,
      effects: [{ type: 'damage' as const, target: 'enemy' as const, value: 15 }]
    }));
  }

  // Archetype-based generation methods
  private calculateArchetypeStats(archetype: RivalArchetype, level: number): Rival['stats'] {
    const baseStats = archetype.statTemplate.baseStats;
    const growthStats = archetype.statTemplate.statGrowth;

    return {
      hp: Math.floor(baseStats.hp + (growthStats.hp * (level - 1))),
      qi: Math.floor(baseStats.qi + (growthStats.qi * (level - 1))),
      atk: Math.floor(baseStats.atk + (growthStats.atk * (level - 1))),
      def: Math.floor(baseStats.def + (growthStats.def * (level - 1))),
      speed: Math.floor(baseStats.speed + (growthStats.speed * (level - 1)))
    };
  }

  private generateArchetypeTechniques(archetype: RivalArchetype, sect: Sect, level: number): string[] {
    const techniques = [...archetype.techniques];

    // Add sect-specific techniques based on level
    if (sect.benefits.techniques && sect.benefits.techniques.length > 0) {
      const availableSectTechs = sect.benefits.techniques.filter((_, index) =>
        index < Math.min(2, Math.floor(level / 10))
      );
      techniques.push(...availableSectTechs);
    }

    // Add level-based techniques
    if (level >= 10) techniques.push('qi_blast');
    if (level >= 15) techniques.push('defensive_stance');
    if (level >= 25) techniques.push('advanced_strike');

    return [...new Set(techniques)]; // Remove duplicates
  }

  private generateArchetypeAbilities(archetype: RivalArchetype, sect: Sect, level: number): string[] {
    const abilities = [...archetype.specialAbilities];

    // Add level-based abilities
    if (level >= 20) abilities.push('enhanced_cultivation');
    if (level >= 30) abilities.push('battle_instinct');
    if (level >= 40) abilities.push('combat_mastery');

    // Add sect-specific abilities
    switch (sect.type) {
      case 'righteous':
        abilities.push('righteous_aura');
        break;
      case 'demonic':
        abilities.push('demonic_empowerment');
        break;
      case 'ancient':
        abilities.push('ancient_wisdom');
        break;
      case 'hidden':
        abilities.push('hidden_technique');
        break;
    }

    return [...new Set(abilities)]; // Remove duplicates
  }

  private generateArchetypeLoot(archetype: RivalArchetype, sect: Sect, level: number): any[] {
    const loot = [];

    // Add archetype-specific loot with null safety
    const lootTable = archetype.lootTable;
    if (lootTable) {
  const rarityRoll = this.rng();

      if (rarityRoll < 0.6 && lootTable.common) {
        // Common loot
        loot.push(...lootTable.common);
      } else if (rarityRoll < 0.85 && lootTable.uncommon) {
        // Uncommon loot
        loot.push(...lootTable.uncommon);
      } else if (lootTable.rare) {
        // Rare loot
        loot.push(...lootTable.rare);
      }
    }

    // Add sect-specific loot
  if (this.rng() < 0.3) {
      loot.push({
        name: `${sect.name} Manual Fragment`,
        description: 'Partial cultivation manual',
        value: level * 5
      });
    }

    // Fallback loot if no archetype loot was generated
    if (loot.length === 0) {
      loot.push({
        name: 'Spirit Stones',
        description: 'Basic cultivation resource',
        value: level * 2
      });
    }

    return loot;
  }

  private generateArchetypeTitle(archetype: RivalArchetype, sect: Sect, level: number): string {
    const titles = {
      young_prodigy: ['Young Talent', 'Rising Star', 'Prodigy Disciple'],
      battle_hardened_warrior: ['Battle Veteran', 'War Warrior', 'Combat Master'],
      cunning_manipulator: ['Shadow Operative', 'Scheming Cultivator', 'Master Manipulator'],
      righteous_judge: ['Justice Enforcer', 'Righteous Guardian', 'Divine Judge'],
      demonic_cultivator: ['Dark Cultivator', 'Demonic Adept', 'Forbidden Practitioner'],
      scholarly_recluse: ['Dao Scholar', 'Knowledge Seeker', 'Wisdom Keeper']
    };

    const archetypeTitles = titles[archetype.id as keyof typeof titles] || ['Cultivator'];
    const titleIndex = Math.min(Math.floor(level / 10), archetypeTitles.length - 1);

    return `${archetypeTitles[titleIndex]} of ${sect.name}`;
  }

  private generateArchetypeDescription(archetype: RivalArchetype, sect: Sect, personality: Rival['personality']): string {
    const personalityDesc = {
      aggressive: 'known for their aggressive and competitive nature',
      cunning: 'renowned for their clever and manipulative tactics',
      honorable: 'respected for their honorable and principled conduct',
      treacherous: 'feared for their treacherous and ruthless methods',
      neutral: 'maintaining a balanced and impartial approach'
    };

    return `${archetype.description} This ${sect.name} member is ${personalityDesc[personality]}.`;
  }

  private calculateTeachingAffinity(archetype: RivalArchetype, personality: Rival['personality']): number {
    // Base affinity from archetype
    let affinity = 50;

    // Personality modifiers
    switch (personality) {
      case 'honorable':
        affinity += 20;
        break;
      case 'neutral':
        affinity += 10;
        break;
      case 'cunning':
        affinity += 5;
        break;
      case 'aggressive':
        affinity -= 10;
        break;
      case 'treacherous':
        affinity -= 20;
        break;
    }

    // Archetype modifiers
    switch (archetype.id) {
      case 'scholarly_recluse':
        affinity += 30;
        break;
      case 'righteous_judge':
        affinity += 15;
        break;
      case 'young_prodigy':
        affinity += 10;
        break;
      case 'demonic_cultivator':
        affinity -= 15;
        break;
      case 'cunning_manipulator':
        affinity -= 10;
        break;
    }

    return Math.max(0, Math.min(100, affinity));
  }

  // Rival progression and growth methods
  public processRivalGrowth(rivalId: string, currentDay: number): void {
    const rival = this.getRival(rivalId);
    if (!rival || !rival.archetype) return;

    const archetype = getArchetypeById(rival.archetype);
    if (!archetype) return;

    const daysSinceLastGrowth = currentDay - (rival.lastGrowth || 0);
    const growthThreshold = this.getGrowthThreshold(rival);

    if (daysSinceLastGrowth >= growthThreshold) {
      this.performRivalGrowth(rival, archetype, currentDay);
    }
  }

  private getGrowthThreshold(rival: Rival): number {
    // Growth becomes slower at higher levels
    const baseThreshold = 30; // 30 days base
    const levelModifier = Math.max(1, rival.level / 10);
    return Math.floor(baseThreshold * levelModifier);
  }

  private performRivalGrowth(rival: Rival, archetype: RivalArchetype, currentDay: number): void {
    const oldLevel = rival.level;
  const growthRoll = this.rng();

    // Breakthrough chance based on archetype
    if (growthRoll < archetype.growthPotential.breakthroughChance) {
      rival.level += 1;
      rival.growthStage = (rival.growthStage || 1) + 1;
      rival.lastGrowth = currentDay;

      // Update stats based on growth
      this.updateRivalStatsForGrowth(rival, archetype);

      // Check for evolution
      this.checkRivalEvolution(rival, archetype);

      // Log growth event
      console.log(`${rival.name} has grown from level ${oldLevel} to ${rival.level}!`);
    }
  }

  private updateRivalStatsForGrowth(rival: Rival, archetype: RivalArchetype): void {
    const growthStats = archetype.statTemplate.statGrowth;

    rival.stats.hp += growthStats.hp;
    rival.stats.qi += growthStats.qi;
    rival.stats.atk += growthStats.atk;
    rival.stats.def += growthStats.def;
    rival.stats.speed += growthStats.speed;
  }

  private checkRivalEvolution(rival: Rival, archetype: RivalArchetype): void {
    if (rival.level >= archetype.growthPotential.maxLevel) {
  const evolutionRoll = this.rng();
      if (evolutionRoll < 0.3) { // 30% chance to evolve at max level
        this.performRivalEvolution(rival, archetype);
      }
    }
  }

  private performRivalEvolution(rival: Rival, archetype: RivalArchetype): void {
    const evolutionPaths = archetype.growthPotential.evolutionPaths;
    if (evolutionPaths.length > 0) {
  const newArchetypeId = evolutionPaths[Math.floor(this.rng() * evolutionPaths.length)];
      const newArchetype = getArchetypeById(newArchetypeId);

      if (newArchetype) {
        rival.archetype = newArchetypeId;
        rival.evolutionPath = newArchetypeId;
        rival.title = this.generateArchetypeTitle(newArchetype, { name: 'Unknown Sect', type: 'neutral' } as any, rival.level);
        rival.description = this.generateArchetypeDescription(newArchetype, { name: 'Unknown Sect', type: 'neutral' } as any, rival.personality);

        // Boost stats on evolution
        rival.stats.hp += 50;
        rival.stats.qi += 50;
        rival.stats.atk += 10;
        rival.stats.def += 10;
        rival.stats.speed += 5;

        console.log(`${rival.name} has evolved into a ${newArchetype.name}!`);
      }
    }
  }

  public getRivalTeachingOptions(rivalId: string): any[] {
    const rival = this.getRival(rivalId);
    if (!rival || !rival.archetype) return [];

    const archetype = getArchetypeById(rival.archetype);
    if (!archetype) return [];

    const teachingAffinity = rival.teachingAffinity || 50;

    // Return teaching options based on archetype and affinity
    const options = [];

    if (teachingAffinity > 70) {
      options.push({
        type: 'technique',
        name: 'Advanced Technique Teaching',
        description: 'Learn a powerful technique from this rival',
        successRate: teachingAffinity / 100,
        requirements: { relationship: 50, level: rival.level - 5 }
      });
    }

    if (teachingAffinity > 50) {
      options.push({
        type: 'insight',
        name: 'Cultivation Insight',
        description: 'Gain valuable cultivation insights',
        successRate: teachingAffinity / 100,
        requirements: { relationship: 30, level: rival.level - 10 }
      });
    }

    if (archetype.id === 'scholarly_recluse') {
      options.push({
        type: 'knowledge',
        name: 'Ancient Knowledge',
        description: 'Learn forbidden or ancient knowledge',
        successRate: teachingAffinity / 100,
        requirements: { relationship: 70, level: rival.level }
      });
    }

    return options;
  }

  public attemptRivalTeaching(rivalId: string, teachingType: string, playerLevel: number, playerRelationship: number): boolean {
    const rival = this.getRival(rivalId);
    if (!rival) return false;

    const teachingOptions = this.getRivalTeachingOptions(rivalId);
    const option = teachingOptions.find(opt => opt.type === teachingType);

    if (!option) return false;

    // Check requirements
    if (playerLevel < option.requirements.level || playerRelationship < option.requirements.relationship) {
      return false;
    }

    // Roll for success
  const successRoll = this.rng();
    return successRoll < option.successRate;
  }

  public getRivalsByArchetype(archetypeId: string): Rival[] {
    return this.rivals.filter(r => r.archetype === archetypeId);
  }

  public getRivalGrowthInfo(rivalId: string): any {
    const rival = this.getRival(rivalId);
    if (!rival || !rival.archetype) return null;

    const archetype = getArchetypeById(rival.archetype);
    if (!archetype) return null;

    return {
      currentLevel: rival.level,
      maxLevel: archetype.growthPotential.maxLevel,
      growthStage: rival.growthStage || 1,
      breakthroughChance: archetype.growthPotential.breakthroughChance,
      evolutionPaths: archetype.growthPotential.evolutionPaths,
      nextGrowthDays: this.getGrowthThreshold(rival),
      teachingAffinity: rival.teachingAffinity || 50
    };
  }

  public getAllArchetypes(): string[] {
    return Object.keys(RIVAL_ARCHETYPES);
  }

  public getArchetypeInfo(archetypeId: string): RivalArchetype | null {
    return getArchetypeById(archetypeId);
  }

  // Enhanced methods for SectSystem integration
  public updateRelationship(rivalId: string, change: number): void {
    const rival = this.getRival(rivalId);
    if (rival) {
      rival.relationship = Math.max(-100, Math.min(100, rival.relationship + change));
    }
  }

  public handleSectMissionOutcome(rivalId: string, missionSuccess: boolean, missionType: string): void {
    const rival = this.getRival(rivalId);
    if (!rival) return;

  let relationshipChange = 0;
  let reputationImpact = 0;

    // Base changes based on mission outcome
    if (missionSuccess) {
      relationshipChange = 5;
      reputationImpact = 10;
    } else {
      relationshipChange = -3;
      reputationImpact = -5;
    }

    // Personality modifiers for sect missions
    switch (rival.personality) {
      case 'honorable':
        // Honorable rivals appreciate sect dedication
        relationshipChange *= 1.2;
        reputationImpact *= 1.1;
        break;
      case 'treacherous':
        // Treacherous rivals may see sect missions as weakness
        relationshipChange *= 0.8;
        reputationImpact *= 0.9;
        break;
      case 'aggressive':
        // Aggressive rivals respect strength shown in missions
        if (missionType === 'combat' || missionType === 'defense') {
          relationshipChange *= 1.3;
          reputationImpact *= 1.2;
        }
        break;
      case 'cunning':
        // Cunning rivals appreciate strategic missions
        if (missionType === 'espionage' || missionType === 'negotiation') {
          relationshipChange *= 1.3;
          reputationImpact *= 1.2;
        }
        break;
    }

    this.updateRelationship(rivalId, Math.floor(relationshipChange));
    // apply reputation impact to rival if the property exists (safe noop otherwise)
    const targetRival = this.getRival(rivalId) as any;
    if (targetRival) {
      targetRival.reputation = (targetRival.reputation || 0) + reputationImpact;
    }
    
    // Record the sect mission interaction
    this.recordSectInteraction(rivalId, missionType, missionSuccess);
  }

  public handleSectReputationChange(sectId: string, reputationChange: number): void {
    // Update relationships with all rivals from the affected sect
    this.rivals.forEach(rival => {
      if (rival.sect === sectId) {
        let relationshipChange = 0;
        
        // Positive sect reputation generally improves rival relationships
        if (reputationChange > 0) {
          relationshipChange = Math.floor(reputationChange * 0.3);
        } else {
          relationshipChange = Math.floor(reputationChange * 0.2);
        }
        
        // Personality modifiers
        switch (rival.personality) {
          case 'honorable':
            relationshipChange *= 1.2;
            break;
          case 'treacherous':
            relationshipChange *= 0.7;
            break;
          case 'aggressive':
            relationshipChange *= 1.1;
            break;
          case 'cunning':
            relationshipChange *= 0.9;
            break;
        }
        
        this.updateRelationship(rival.id, Math.floor(relationshipChange));
      }
    });
  }

  public getFactionStandingImpact(rivalId: string): { faction: string; impact: number } | null {
    const rival = this.getRival(rivalId);
    if (!rival || !rival.faction) return null;

    // Calculate faction standing impact based on rival relationship
    let impact = 0;
    const relationship = rival.relationship;

    if (relationship >= 60) {
      impact = 15; // Strong positive relationship boosts faction standing
    } else if (relationship >= 20) {
      impact = 8;
    } else if (relationship >= -20) {
      impact = 0;
    } else if (relationship >= -60) {
      impact = -8;
    } else {
      impact = -15; // Strong negative relationship hurts faction standing
    }

    return { faction: rival.faction, impact };
  }

  public triggerRivalEvent(rivalId: string, eventType: string, context: any = {}): void {
    const rival = this.getRival(rivalId);
    if (!rival) return;

    // Trigger personality-specific responses
    this.handleRivalEventResponse(rival, eventType, context);
  }

  private recordSectInteraction(rivalId: string, missionType: string, success: boolean): void {
    // This could be expanded to track sect mission interactions
    // for more sophisticated AI behavior
    console.log(`Recorded sect interaction: ${rivalId} - ${missionType} - ${success ? 'success' : 'failure'}`);
  }

  private handleRivalEventResponse(rival: any, eventType: string, context: any): void {
    // This method can be expanded to trigger specific rival responses
    // based on their personality and the event type
    
    switch (eventType) {
      case 'sect_promotion':
        if (rival.personality === 'honorable') {
          this.updateRelationship(rival.id, 5);
        } else if (rival.personality === 'treacherous') {
          this.updateRelationship(rival.id, -3);
        }
        break;
      case 'sect_betrayal':
        if (rival.personality === 'honorable') {
          this.updateRelationship(rival.id, -15);
        } else if (rival.personality === 'treacherous') {
          this.updateRelationship(rival.id, 5);
        }
        break;
      case 'faction_war':
        if (rival.faction === context.enemyFaction) {
          this.updateRelationship(rival.id, -20);
        } else if (rival.faction === context.allyFaction) {
          this.updateRelationship(rival.id, 10);
        }
        break;
    }
  }

}
