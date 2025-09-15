import { MentorTeaching, TeachingChallengeType, TeachingTree, TeachingNode } from '../types/MentorTeaching';
import { scaleTeachingReward } from './scalingSystem';

// Import all mentor teaching data
import fangYuanTeachings from './mentor_teachings/fang_yuan_teachings.json';
import fuYaoTeachings from './mentor_teachings/fu_yao_teachings.json';
import hanJueTeachings from './mentor_teachings/han_jue_teachings.json';
import hanLiTeachings from './mentor_teachings/han_li_teachings.json';
import lanWangjiTeachings from './mentor_teachings/lan_wangji_teachings.json';
import mengHaoTeachings from './mentor_teachings/meng_hao_teachings.json';
import suMingTeachings from './mentor_teachings/su_ming_teachings.json';
import xiaoYanTeachings from './mentor_teachings/xiao_yan_teachings.json';

interface RawTeaching {
  id: string;
  title: string;
  description: string;
  prerequisites: any;
  challenge: any;
  reward: any;
  failureConsequence: any;
}

export class MentorTeachingsLoader {
  private teachings: Map<string, MentorTeaching> = new Map();
  private teachingTrees: TeachingTree[] = [];

  constructor() {
    this.loadAllTeachings();
    this.buildTeachingTrees();
  }

  private loadAllTeachings(): void {
    // Load Fang Yuan teachings
    (fangYuanTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });

    // Load Fu Yao teachings
    (fuYaoTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });

    // Load other mentors...
    (hanJueTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });

    (hanLiTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });

    (lanWangjiTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });

    (mengHaoTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });

    (suMingTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });

    (xiaoYanTeachings as RawTeaching[]).forEach(teaching => {
      const migrated = this.migrateLegacyKeys(teaching as any);
      this.teachings.set(teaching.id, this.convertToMentorTeaching(migrated));
    });
  }

  /**
   * Migrate legacy keys present in JSON data to their current equivalents.
   * Currently maps:
   * - `hermitCurse` -> `seclusionCurse`
   * This is intentionally conservative and only touches a few known locations
   * (top-level, prerequisites, reward, failureConsequence) to avoid altering
   * lore fields or other nested structures unintentionally.
   */
  private migrateLegacyKeys(raw: any): RawTeaching {
    const copy: any = { ...raw };

    // Top-level key migration
    if (copy.hermitCurse !== undefined && copy.seclusionCurse === undefined) {
      copy.seclusionCurse = copy.hermitCurse;
      delete copy.hermitCurse;
    }

    // Nested migrations for common containers
    ['prerequisites', 'reward', 'failureConsequence'].forEach(container => {
      if (copy[container] && typeof copy[container] === 'object') {
        if (copy[container].hermitCurse !== undefined && copy[container].seclusionCurse === undefined) {
          copy[container].seclusionCurse = copy[container].hermitCurse;
          delete copy[container].hermitCurse;
        }
      }
    });

    return copy as RawTeaching;
  }

  private convertToMentorTeaching(rawTeaching: RawTeaching): MentorTeaching {
    const teachingNumber = parseInt(rawTeaching.id.split('_').pop() || '1');
    
    return {
      id: rawTeaching.id,
      title: rawTeaching.title,
      description: rawTeaching.description,
      challenge: {
        type: this.mapChallengeType(rawTeaching.challenge?.type),
        difficulty: this.mapDifficulty(rawTeaching.challenge?.difficulty, teachingNumber),
        requirements: rawTeaching.challenge?.requirements || "Complete the challenge",
        restriction: rawTeaching.challenge?.restriction || "No restrictions",
        timeLimit: this.calculateTimeLimit(rawTeaching.challenge?.difficulty, teachingNumber),
        successThreshold: this.calculateSuccessThreshold(rawTeaching.challenge?.difficulty, teachingNumber)
      },
      reward: rawTeaching.reward || {},
      failureConsequence: rawTeaching.failureConsequence || {},
      prerequisites: rawTeaching.prerequisites || {}
    };
  }

  private mapChallengeType(rawType: string): TeachingChallengeType {
    const typeMappings: Record<string, TeachingChallengeType> = {
      'moral_choice': 'puzzle_solving',
      'betrayal_quest': 'resource_management',
      'complex_scheme': 'puzzle_solving',
      'manipulation_mastery': 'resource_management',
      'prophecy_mastery': 'memory_test',
      'isolation_trial': 'meditation_challenge',
      'efficiency_mastery': 'qi_control_test',
      'delayed_gratification': 'resource_management',
      'enemy_harvesting': 'resource_management',
      'ultimate_betrayal': 'puzzle_solving',
      'rebellion_mastery': 'rebellion_mastery',
      'transformation_trial': 'transformation_trial'
    };

    return typeMappings[rawType] || 'qi_control_test';
  }

  private mapDifficulty(rawDifficulty: string, teachingNumber: number): "easy" | "medium" | "hard" | "extreme" | "legendary" | "mythical" | "transcendent" | "impossible" {
    if (rawDifficulty) {
      return rawDifficulty as "easy" | "medium" | "hard" | "extreme" | "legendary" | "mythical" | "transcendent" | "impossible";
    }
    
    const difficulties = ['easy', 'medium', 'hard', 'extreme', 'legendary', 'mythical', 'transcendent'] as const;
    return difficulties[Math.min(teachingNumber - 1, difficulties.length - 1)];
  }

  private calculateTimeLimit(difficulty: string, teachingNumber: number): number {
    const baseTimes: Record<string, number> = {
      easy: 300,
      medium: 240,
      hard: 180,
      extreme: 120,
      legendary: 90,
      mythical: 60,
      transcendent: 45,
      impossible: 30
    };

    return baseTimes[difficulty] || (300 - (teachingNumber * 30));
  }

  private calculateSuccessThreshold(difficulty: string, teachingNumber: number): number {
    const baseThresholds: Record<string, number> = {
      easy: 60,
      medium: 70,
      hard: 75,
      extreme: 80,
      legendary: 85,
      mythical: 90,
      transcendent: 95,
      impossible: 100
    };

    return baseThresholds[difficulty] || (60 + (teachingNumber * 5));
  }

  private buildTeachingTrees(): void {
    const mentors = ['fang_yuan', 'fu_yao', 'lan_wangji', 'su_ming', 'han_li', 'xiao_yan', 'meng_hao', 'han_jue'];
    
    mentors.forEach(mentorId => {
      const mentorTeachings = Array.from(this.teachings.values())
        .filter(teaching => teaching.id.startsWith(mentorId))
        .sort((a, b) => {
          const aNum = parseInt(a.id.split('_').pop() || '0');
          const bNum = parseInt(b.id.split('_').pop() || '0');
          return aNum - bNum;
        });

      const nodes: TeachingNode[] = mentorTeachings.map((teaching, index) => ({
        teachingId: teaching.id,
        position: { x: index * 120, y: 0 },
        // Prefer explicit dependencies when present; otherwise fall back to linear connection
        connections: (teaching.prerequisites?.requiredTeachings && teaching.prerequisites.requiredTeachings.length > 0)
          ? teaching.prerequisites.requiredTeachings
          : (index < mentorTeachings.length - 1 ? [mentorTeachings[index + 1].id] : []),
        unlockRequirements: teaching.prerequisites || {}
      }));

      this.teachingTrees.push({
        id: `${mentorId}_tree`,
        mentorId,
        teachings: nodes,
        prerequisites: { mentorAffinity: { [mentorId]: 5 } }
      });
    });
  }

  getTeachingById(teachingId: string): MentorTeaching | undefined {
    return this.teachings.get(teachingId);
  }

  // Realm-scaled accessors
  getTeachingByIdScaled(teachingId: string, realm: string): MentorTeaching | undefined {
    const t = this.teachings.get(teachingId);
    if (!t) return undefined;
    return {
      ...t,
      reward: scaleTeachingReward(t.reward || {}, realm)
    };
  }

  getTeachingsForMentor(mentorId: string): MentorTeaching[] {
    return Array.from(this.teachings.values())
      .filter(teaching => teaching.id.startsWith(mentorId));
  }

  getTeachingsForMentorScaled(mentorId: string, realm: string): MentorTeaching[] {
    return this.getTeachingsForMentor(mentorId).map(t => ({
      ...t,
      reward: scaleTeachingReward(t.reward || {}, realm)
    }));
  }

  getTeachingTree(mentorId: string): TeachingTree | undefined {
    return this.teachingTrees.find(tree => tree.mentorId === mentorId);
  }

  getAllTeachingTrees(): TeachingTree[] {
    return this.teachingTrees;
  }
}

export const mentorTeachingsLoader = new MentorTeachingsLoader();
