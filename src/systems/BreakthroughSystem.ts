import { CULTIVATION_REALMS } from '../data/cultivationRealms';

export interface MinorStage {
  stage: number;
  maxStage: number;
  qiRequired: number;
  stabilityRequired: number;
  breakthroughAttempts: number;
}

export interface BreakthroughChallenge {
  id: string;
  type: 'mental' | 'physical' | 'spiritual' | 'elemental' | 'karmic';
  name: string;
  description: string;
  difficulty: number;
  requirements: {
    minStats?: Record<string, number>;
    skills?: Record<string, number>;
    items?: string[];
    karma?: number;
  };
  rewards: {
    stats?: Record<string, number>;
    skills?: Record<string, number>;
    insights?: string[];
  };
  risks: string[];
}

export interface BreakthroughResult {
  success: boolean;
  newRealm?: string;
  newStage?: number;
  insights?: string[];
  penalties?: Record<string, number>;
  message: string;
}

export class BreakthroughSystem {
  private challenges: Map<string, BreakthroughChallenge[]> = new Map();

  constructor() {
    this.initializeChallenges();
  }

  private initializeChallenges(): void {
    // Initialize breakthrough challenges for each realm
    Object.keys(CULTIVATION_REALMS).forEach(realmId => {
      this.challenges.set(realmId, this.generateChallengesForRealm(realmId));
    });
  }

  private generateChallengesForRealm(realmId: string): BreakthroughChallenge[] {
    const realm = CULTIVATION_REALMS[realmId];
    if (!realm) return [];

    const challenges: BreakthroughChallenge[] = [];
    const baseDifficulty = realm.breakthroughDifficulty;

    // Mental challenges
    challenges.push({
      id: `${realmId}_mental`,
      type: 'mental',
      name: 'Dao Heart Refinement',
      description: 'Strengthen your Dao heart to withstand higher cultivation pressures',
      difficulty: baseDifficulty,
      requirements: {
        skills: { mentalFortitude: Math.floor(baseDifficulty * 0.8) }
      },
      rewards: {
        stats: { daoHeart: Math.floor(baseDifficulty * 0.5) },
        insights: ['dao_heart_stability']
      },
      risks: ['dao_heart_damage', 'mental_backlash']
    });

    // Physical challenges
    challenges.push({
      id: `${realmId}_physical`,
      type: 'physical',
      name: 'Body Tempering Trial',
      description: 'Temper your physical form to handle increased spiritual energy',
      difficulty: baseDifficulty,
      requirements: {
        skills: { bodyTempering: Math.floor(baseDifficulty * 0.7) }
      },
      rewards: {
        stats: { hp: Math.floor(baseDifficulty * 2), def: Math.floor(baseDifficulty * 0.3) },
        insights: ['body_qi_harmony']
      },
      risks: ['physical_injury', 'qi_deviation']
    });

    // Spiritual challenges
    challenges.push({
      id: `${realmId}_spiritual`,
      type: 'spiritual',
      name: 'Spiritual Root Expansion',
      description: 'Expand your spiritual roots to accommodate higher realm energy',
      difficulty: baseDifficulty,
      requirements: {
        skills: { cultivation: Math.floor(baseDifficulty * 0.9) }
      },
      rewards: {
        stats: { qi: Math.floor(baseDifficulty * 3), cultivationSpeed: Math.floor(baseDifficulty * 0.2) },
        insights: ['spiritual_expansion']
      },
      risks: ['spiritual_root_damage', 'cultivation_regression']
    });

    // Elemental challenges (for higher realms)
    if (baseDifficulty >= 20) {
      challenges.push({
        id: `${realmId}_elemental`,
        type: 'elemental',
        name: 'Elemental Tribulation',
        description: 'Face the elemental tribulation of heaven and earth',
        difficulty: baseDifficulty * 1.2,
        requirements: {
          skills: { elementalControl: Math.floor(baseDifficulty * 0.6) }
        },
        rewards: {
          stats: { elementalResistance: Math.floor(baseDifficulty * 0.4) },
          insights: ['elemental_mastery', 'tribulation_resistance']
        },
        risks: ['elemental_backlash', 'heavenly_punishment']
      });
    }

    // Karmic challenges (for highest realms)
    if (baseDifficulty >= 100) {
      challenges.push({
        id: `${realmId}_karmic`,
        type: 'karmic',
        name: 'Karmic Resolution',
        description: 'Resolve accumulated karma to achieve breakthrough',
        difficulty: baseDifficulty * 1.5,
        requirements: {
          karma: 0 // Must have neutral or positive karma
        },
        rewards: {
          stats: { karmaResistance: Math.floor(baseDifficulty * 0.3) },
          insights: ['karma_transcendence', 'cause_effect_mastery']
        },
        risks: ['karmic_backlash', 'past_life_interference']
      });
    }

    return challenges;
  }

  public getMinorStageInfo(realm: string, currentStage: number): MinorStage {
    const realmData = CULTIVATION_REALMS[realm];
    if (!realmData) {
      throw new Error(`Unknown realm: ${realm}`);
    }

    const maxStage = realmData.minorStages;
    const baseQi = realmData.qiRequirement;
    const stageQi = Math.floor(baseQi / maxStage);

    return {
      stage: currentStage,
      maxStage,
      qiRequired: stageQi * currentStage,
      stabilityRequired: Math.floor(currentStage * 10),
      breakthroughAttempts: 0
    };
  }

  public canAttemptMinorBreakthrough(
    realm: string, 
    currentStage: number, 
    playerQi: number, 
    stability: number
  ): { canAttempt: boolean; reason?: string } {
    const stageInfo = this.getMinorStageInfo(realm, currentStage + 1);
    
    if (currentStage >= stageInfo.maxStage) {
      return { canAttempt: false, reason: 'Already at maximum stage for this realm' };
    }

    if (playerQi < stageInfo.qiRequired) {
      return { canAttempt: false, reason: `Insufficient Qi: ${playerQi}/${stageInfo.qiRequired}` };
    }

    if (stability < stageInfo.stabilityRequired) {
      return { canAttempt: false, reason: `Insufficient stability: ${stability}/${stageInfo.stabilityRequired}` };
    }

    return { canAttempt: true };
  }

  public attemptMinorBreakthrough(
    realm: string,
    currentStage: number,
    playerStats: Record<string, number>,
    playerSkills: Record<string, number>
  ): BreakthroughResult {
    const realmData = CULTIVATION_REALMS[realm];
    if (!realmData) {
      return { success: false, message: 'Invalid realm' };
    }

    const difficulty = Math.floor(realmData.breakthroughDifficulty * (currentStage / realmData.minorStages));
    const successChance = this.calculateMinorBreakthroughChance(difficulty, playerStats, playerSkills);
    
    const success = Math.random() < successChance;
    
    if (success) {
      const newStage = currentStage + 1;
      const insights = this.generateMinorBreakthroughInsights(realm, newStage);
      
      return {
        success: true,
        newStage,
        insights,
        message: `Successfully advanced to ${realm} stage ${newStage}!`
      };
    } else {
      const penalties = this.calculateBreakthroughPenalties(difficulty);
      return {
        success: false,
        penalties,
        message: 'Breakthrough failed. Cultivation foundation damaged.'
      };
    }
  }

  public canAttemptRealmBreakthrough(
    currentRealm: string,
    currentStage: number,
    playerStats: Record<string, number>,
    playerSkills: Record<string, number>
  ): { canAttempt: boolean; reason?: string; challenges?: BreakthroughChallenge[] } {
    const realmData = CULTIVATION_REALMS[currentRealm];
    if (!realmData) {
      return { canAttempt: false, reason: 'Invalid realm' };
    }

    if (currentStage < realmData.minorStages) {
      return { 
        canAttempt: false, 
        reason: `Must complete all minor stages (${currentStage}/${realmData.minorStages})` 
      };
    }

    if (!realmData.nextRealm) {
      return { canAttempt: false, reason: 'Already at the highest realm' };
    }

    const challenges = this.challenges.get(currentRealm) || [];
    const availableChallenges = challenges.filter(challenge => 
      this.meetsRequirements(challenge.requirements, playerStats, playerSkills)
    );

    if (availableChallenges.length === 0) {
      return { 
        canAttempt: false, 
        reason: 'No breakthrough challenges available. Improve your cultivation foundation.',
        challenges: challenges
      };
    }

    return { canAttempt: true, challenges: availableChallenges };
  }

  public attemptRealmBreakthrough(
    currentRealm: string,
    challengeId: string,
    playerStats: Record<string, number>,
    playerSkills: Record<string, number>
  ): BreakthroughResult {
    const challenges = this.challenges.get(currentRealm) || [];
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge) {
      return { success: false, message: 'Invalid challenge selected' };
    }

    if (!this.meetsRequirements(challenge.requirements, playerStats, playerSkills)) {
      return { success: false, message: 'Requirements not met for this challenge' };
    }

    const successChance = this.calculateRealmBreakthroughChance(challenge, playerStats, playerSkills);
    const success = Math.random() < successChance;

    const realmData = CULTIVATION_REALMS[currentRealm];
    const nextRealm = realmData?.nextRealm;

    if (success && nextRealm) {
      return {
        success: true,
        newRealm: nextRealm,
        newStage: 1,
        insights: challenge.rewards.insights || [],
        message: `Successfully broke through to ${CULTIVATION_REALMS[nextRealm]?.name || nextRealm}!`
      };
    } else {
      const penalties = this.calculateChallengeFailurePenalties(challenge);
      return {
        success: false,
        penalties,
        message: `Breakthrough failed. ${challenge.risks[Math.floor(Math.random() * challenge.risks.length)]}`
      };
    }
  }

  private calculateMinorBreakthroughChance(
    difficulty: number,
    playerStats: Record<string, number>,
    playerSkills: Record<string, number>
  ): number {
    const baseChance = 0.7;
    const statBonus = (playerStats.daoHeart || 0) * 0.001;
    const skillBonus = (playerSkills.cultivation || 0) * 0.002;
    const difficultyPenalty = difficulty * 0.01;

    return Math.max(0.1, Math.min(0.95, baseChance + statBonus + skillBonus - difficultyPenalty));
  }

  private calculateRealmBreakthroughChance(
    challenge: BreakthroughChallenge,
    playerStats: Record<string, number>,
    playerSkills: Record<string, number>
  ): number {
    const baseChance = 0.5;
    const difficultyPenalty = challenge.difficulty * 0.005;
    
    let bonusChance = 0;
    
    // Calculate bonuses based on exceeding requirements
    if (challenge.requirements.skills) {
      Object.entries(challenge.requirements.skills).forEach(([skill, required]) => {
        const playerSkill = playerSkills[skill] || 0;
        if (playerSkill > required) {
          bonusChance += (playerSkill - required) * 0.002;
        }
      });
    }

    return Math.max(0.05, Math.min(0.9, baseChance + bonusChance - difficultyPenalty));
  }

  private meetsRequirements(
    requirements: BreakthroughChallenge['requirements'],
    playerStats: Record<string, number>,
    playerSkills: Record<string, number>
  ): boolean {
    if (requirements.skills) {
      for (const [skill, required] of Object.entries(requirements.skills)) {
        if ((playerSkills[skill] || 0) < required) {
          return false;
        }
      }
    }

    if (requirements.minStats) {
      for (const [stat, required] of Object.entries(requirements.minStats)) {
        if ((playerStats[stat] || 0) < required) {
          return false;
        }
      }
    }

    if (requirements.karma !== undefined) {
      if ((playerStats.karma || 0) < requirements.karma) {
        return false;
      }
    }

    return true;
  }

  private calculateBreakthroughPenalties(difficulty: number): Record<string, number> {
    const basePenalty = Math.floor(difficulty * 0.1);
    return {
      qi: -basePenalty * 2,
      daoHeart: -basePenalty,
      stability: -basePenalty * 3
    };
  }

  private calculateChallengeFailurePenalties(challenge: BreakthroughChallenge): Record<string, number> {
    const basePenalty = Math.floor(challenge.difficulty * 0.15);
    const penalties: Record<string, number> = {};

    challenge.risks.forEach(risk => {
      switch (risk) {
        case 'dao_heart_damage':
          penalties.daoHeart = -basePenalty * 2;
          break;
        case 'physical_injury':
          penalties.hp = -basePenalty * 3;
          break;
        case 'qi_deviation':
          penalties.qi = -basePenalty * 2;
          penalties.stability = -basePenalty * 4;
          break;
        case 'cultivation_regression':
          penalties.cultivationPower = -basePenalty * 5;
          break;
        case 'karmic_backlash':
          penalties.karma = -basePenalty;
          break;
      }
    });

    return penalties;
  }

  private generateMinorBreakthroughInsights(realm: string, stage: number): string[] {
    const insights = [
      `Understanding of ${realm} deepened`,
      'Qi circulation improved',
      'Spiritual foundation strengthened'
    ];

    if (stage >= 5) {
      insights.push('Breakthrough patterns recognized');
    }

    if (stage >= 8) {
      insights.push('Realm mastery approaching');
    }

    return insights;
  }

  public getAvailableChallenges(realm: string): BreakthroughChallenge[] {
    return this.challenges.get(realm) || [];
  }

  public getChallengeById(realm: string, challengeId: string): BreakthroughChallenge | null {
    const challenges = this.challenges.get(realm) || [];
    return challenges.find(c => c.id === challengeId) || null;
  }
}