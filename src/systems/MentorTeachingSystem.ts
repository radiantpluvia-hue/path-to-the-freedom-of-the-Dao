import { MentorTeaching, ChallengeResult, Prerequisites } from '../types/MentorTeaching';
import { GameState, TeachingProgress, MentorTeachingProgress as PlayerMentorProgress } from '../types';

const TEACHING_COOLDOWN_TICKS = 2000; // cooldown after any teaching attempt/success

export class MentorTeachingSystem {
  private allTeachings: Map<string, MentorTeaching> = new Map();
  private teachingsByMentor: Map<string, MentorTeaching[]> = new Map();
  private teachingToMentorId: Map<string, string> = new Map();
  // Player-specific progress is now managed in the GameState.
  
  constructor() {
    // Teachings should be loaded externally, e.g., from JSON files
  }

  public loadMentorTeachings(mentorId: string, teachings: MentorTeaching[]): void {
    this.teachingsByMentor.set(mentorId, teachings);
    teachings.forEach(teaching => {
      this.allTeachings.set(teaching.id, teaching);
      this.teachingToMentorId.set(teaching.id, mentorId);
    });
  }

  public isOnMentorCooldown(mentorId: string, gameState: GameState): boolean {
    const mp = gameState.player.mentorProgress?.[mentorId] as PlayerMentorProgress | undefined;
    const lastTick = mp?.lastTaughtTick ?? -Infinity;
    return (gameState.world.tick - lastTick) < TEACHING_COOLDOWN_TICKS;
  }

  public getMentorCooldownRemaining(mentorId: string, gameState: GameState): number {
    const mp = gameState.player.mentorProgress?.[mentorId] as PlayerMentorProgress | undefined;
    const lastTick = mp?.lastTaughtTick ?? -Infinity;
    const remaining = TEACHING_COOLDOWN_TICKS - (gameState.world.tick - lastTick);
    return Math.max(0, remaining);
  }

  getAvailableTeachings(mentorId: string, gameState: GameState): MentorTeaching[] {
    const mentorTeachings = this.teachingsByMentor.get(mentorId) || [];
    // Block during mentor cooldown
    if (this.isOnMentorCooldown(mentorId, gameState)) return [];

    return mentorTeachings.filter(teaching => {
      const progress = this.getTeachingProgress(teaching.id, gameState);
      return !progress.completed && this.checkPrerequisites(teaching, gameState);
    });
  }
  
  attemptTeaching(teachingId: string, gameState: GameState): { result: ChallengeResult, updatedProgress?: TeachingProgress, updatedMentorProgress?: { mentorId: string; progress: PlayerMentorProgress } } {
    // This would trigger the actual challenge mini-game
    // For now, simulate based on player skills and teaching difficulty
    
    const teaching = this.getTeachingById(teachingId);
    if (!teaching) {
      return {
        result: {
          success: false,
          score: 0,
          timeTaken: 0,
          penaltyConsequences: { qi: -10, insight: -5 }
        }
      };
    }

    const mentorId = this.teachingToMentorId.get(teachingId) || '';
    // Respect cooldown: do not allow attempt if on cooldown
    if (mentorId && this.isOnMentorCooldown(mentorId, gameState)) {
      return {
        result: {
          success: false,
          score: 0,
          timeTaken: 0,
          penaltyConsequences: { cooldownRemaining: this.getMentorCooldownRemaining(mentorId, gameState) }
        }
      };
    }

    const difficultyMultiplier = this.getDifficultyMultiplier(teaching.challenge.difficulty);
    const playerSkill = this.calculatePlayerSkill(gameState.player, teaching.challenge.type);
    
    const successChance = Math.min(0.95, playerSkill * difficultyMultiplier);
    const success = Math.random() < successChance;
    
    const score = success ? Math.floor(Math.random() * 20 + 80) : Math.floor(Math.random() * 60);
    const timeTaken = Math.floor(Math.random() * (teaching.challenge.timeLimit || 60) * 0.5);

    const result: ChallengeResult = {
      success,
      score,
      timeTaken,
      accuracy: success ? (score / 100) * 100 : Math.floor(Math.random() * 50),
      efficiency: success ? (timeTaken / (teaching.challenge.timeLimit || 60)) * 100 : 0,
      bonusRewards: success ? this.calculateBonusRewards(score, teaching) : undefined,
      penaltyConsequences: !success ? teaching.failureConsequence : undefined
    };

    const updatedProgress = success ? this.getUpdatedTeachingProgress(teaching.id, result, gameState) : undefined;

    // Build mentor progress patch (cooldown starts after any attempt)
    if (mentorId) {
      const mp = (gameState.player.mentorProgress?.[mentorId] as PlayerMentorProgress | undefined) || {
        teachingsReceived: 0,
        lastTaughtTimestamp: 0,
        lastTaughtTick: undefined,
        learnedTeachings: []
      };
      const newMp: PlayerMentorProgress = {
        ...mp,
        teachingsReceived: (mp.teachingsReceived || 0) + 1,
        lastTaughtTimestamp: Date.now(), // keep legacy field updated
        lastTaughtTick: gameState.world.tick,
        learnedTeachings: success && !mp.learnedTeachings.includes(teachingId)
          ? [...mp.learnedTeachings, teachingId]
          : mp.learnedTeachings
      };

      return { result, updatedProgress, updatedMentorProgress: { mentorId, progress: newMp } };
    }

    return { result, updatedProgress };
  }

  public recordChallengeResult(teachingId: string, result: ChallengeResult, gameState: GameState): TeachingProgress {
    return this.getUpdatedTeachingProgress(teachingId, result, gameState);
  }

  private getTeachingById(teachingId: string): MentorTeaching | undefined {
    return this.allTeachings.get(teachingId);
  }

  private getDifficultyMultiplier(difficulty: string): number {
    const multipliers: Record<string, number> = {
      easy: 1.2,
      medium: 1.0,
      hard: 0.8,
      extreme: 0.6,
      legendary: 0.4,
      mythical: 0.2,
      transcendent: 0.1,
      impossible: 0.05
    };
    return multipliers[difficulty] || 1.0;
  }

  private calculatePlayerSkill(playerState: GameState['player'], challengeType: string): number {
    // Calculate player skill based on relevant stats for the challenge type
    let baseSkill = 0.5; // Base 50% chance
    
    if (challengeType.includes('meditation') || challengeType.includes('qi')) {
      baseSkill += (playerState.skills?.qiControl?.level || 0) * 0.1;
      baseSkill += playerState.insight * 0.01;
    } else if (challengeType.includes('combat')) {
      baseSkill += (playerState.skills?.combatSkills?.level || 0) * 0.1;
      baseSkill += playerState.combatPower * 0.0001;
    } else if (challengeType.includes('puzzle') || challengeType.includes('memory')) {
      baseSkill += (playerState.skills?.mentalFortitude?.level || 0) * 0.1;
      baseSkill += playerState.insight * 0.01;
    }
    
    return Math.min(0.95, baseSkill);
  }

  private calculateBonusRewards(score: number, teaching: MentorTeaching): Record<string, any> {
    const bonus: Record<string, any> = {};
    const bonusMultiplier = score / 100;
    
    Object.entries(teaching.reward || {}).forEach(([key, value]) => {
      if (typeof value === 'number') {
        bonus[key] = Math.floor(value * bonusMultiplier * 0.5); // 50% of base reward as bonus
      }
    });
    
    return bonus;
  }

  checkPrerequisites(teaching: MentorTeaching, gameState: GameState): boolean {
    return this.checkPrerequisitesForRequirements(teaching.prerequisites || {}, gameState);
  }

  private checkPrerequisitesForRequirements(prerequisites: Prerequisites, gameState: GameState): boolean {
    if (!prerequisites) return true;
    const { player, world } = gameState;

    for (const key in prerequisites) {
        const reqValue = prerequisites[key as keyof Prerequisites];
        if (reqValue === undefined) continue;

        switch (key) {
            case 'minLevel':
                if ((player.level || 0) < (reqValue as number)) return false;
                break;
            case 'karma': // Assuming karma is a max value, e.g., for evil teachings
                if ((player.karma || 0) > (reqValue as number)) return false;
                break;
            case 'cunning':
                if ((player.cunning || 0) < (reqValue as number)) return false;
                break;
            case 'rebelliousness':
                if ((player as any).rebelliousness !== undefined && (player as any).rebelliousness < (reqValue as number)) return false;
                break;
            case 'phoenixBlood':
                if ((player as any).phoenixBlood !== undefined && (player as any).phoenixBlood !== (reqValue as boolean)) return false;
                break;
            case 'mentorAffinity':
                for (const [mentorId, requiredAffinity] of Object.entries(reqValue as Record<string, number>)) {
                    if ((player.mentorAffinity?.[mentorId] || 0) < requiredAffinity) return false;
                }
                break;
            case 'requiredSkills':
                for (const [skill, level] of Object.entries(reqValue as Record<string, number>)) {
                    if ((player.skills?.[skill]?.level || 0) < level) return false;
                }
                break;
            // This check needs access to the world state
            case 'eventFlags':
                 for (const [flag, value] of Object.entries(reqValue as Record<string, boolean>)) {
                    if (world.flags?.[flag] !== value) return false;
                 }
                 break;
            // Handle logical operators
            case 'and':
                if (!(reqValue as Prerequisites[]).every(p => this.checkPrerequisitesForRequirements(p, gameState))) return false;
                break;
            case 'or':
                if (!(reqValue as Prerequisites[]).some(p => this.checkPrerequisitesForRequirements(p, gameState))) return false;
                break;
            case 'not':
                if (this.checkPrerequisitesForRequirements(reqValue as Prerequisites, gameState)) return false;
                break;
            case 'requiredTeachings':
                for (const tid of reqValue as string[]) {
                    const tp = gameState.player.teachingProgress?.[tid];
                    if (!tp?.completed) return false;
                }
                break;
            // TODO: Implement other checks from Prerequisites interface as needed
        }
    }
    
    return true;
  }

  // This method now returns a new progress object instead of mutating state
  private getUpdatedTeachingProgress(teachingId: string, result: ChallengeResult, gameState: GameState): TeachingProgress {
    const progress = this.getTeachingProgress(teachingId, gameState);
    const newProgress = { ...progress, attempts: progress.attempts + 1, lastAttempt: Date.now() };
    
    if (result.success) {
      newProgress.completed = true;
      newProgress.bestScore = Math.max(newProgress.bestScore, result.score);
      newProgress.completionTime = result.timeTaken;
    }
    
    return newProgress;
  }

  // New method to get teaching progress
  private getTeachingProgress(teachingId: string, gameState: GameState): TeachingProgress {
    return gameState.player.teachingProgress?.[teachingId] || {
      attempts: 0, 
      completed: false, 
      bestScore: 0,
      currentStage: 0,
      masteryLevel: 0,
      masteryPoints: 0
    };
  }

  // Get mastery level for a teaching
  public getTeachingMastery(teachingId: string, gameState: GameState): { level: number; points: number; nextLevelPoints: number } {
    const progress = this.getTeachingProgress(teachingId, gameState);
    const masteryLevel = progress.masteryLevel || 0;
    const masteryPoints = progress.masteryPoints || 0;
    const nextLevelPoints = (masteryLevel + 1) * 100; // 100 points per level
    
    return {
      level: masteryLevel,
      points: masteryPoints,
      nextLevelPoints
    };
  }

  // Award mastery points for successful teaching completion
  public awardMasteryPoints(teachingId: string, points: number, gameState: GameState): TeachingProgress {
    const progress = this.getTeachingProgress(teachingId, gameState);
    const newMasteryPoints = (progress.masteryPoints || 0) + points;
    const currentLevel = progress.masteryLevel || 0;
    const pointsForNextLevel = (currentLevel + 1) * 100;
    
    let newMasteryLevel = currentLevel;
    let remainingPoints = newMasteryPoints;
    
    // Check for level ups
    while (remainingPoints >= pointsForNextLevel && newMasteryLevel < 10) { // Max level 10
      remainingPoints -= pointsForNextLevel;
      newMasteryLevel++;
    }
    
    return {
      ...progress,
      masteryLevel: newMasteryLevel,
      masteryPoints: remainingPoints
    };
  }

  // Get all completed teachings for a mentor with mastery info
  public getMentorMasteryProgress(mentorId: string, gameState: GameState): Array<{
    teachingId: string;
    title: string;
    masteryLevel: number;
    masteryPoints: number;
  }> {
    const mentorTeachings = this.teachingsByMentor.get(mentorId) || [];
    return mentorTeachings
      .filter(teaching => {
        const progress = this.getTeachingProgress(teaching.id, gameState);
        return progress.completed;
      })
      .map(teaching => {
        const mastery = this.getTeachingMastery(teaching.id, gameState);
        return {
          teachingId: teaching.id,
          title: teaching.title,
          masteryLevel: mastery.level,
          masteryPoints: mastery.points
        };
      });
  }
}
