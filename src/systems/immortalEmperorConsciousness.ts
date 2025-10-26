export type ConsciousnessState = 'dormant' | 'awakening' | 'active' | 'rebellious';

export interface IConsciousnessPayload {
  emperorName: string;
  originalEra: string;
  personality: Record<string, number>;
  consciousnessLevel: number; // 0.0 - 1.0
  memoriesUnlocked: string[];
  techniquesAvailable: string[];
  willpowerStrength: number;
}

export class ImmortalEmperorConsciousness {
  public emperorName: string;
  public originalEra: string;
  public personality: Record<string, number>;
  public consciousnessLevel: number;
  public memoriesUnlocked: string[];
  public techniquesAvailable: string[];
  public willpowerStrength: number;
  public state: ConsciousnessState;
  // mentalWorldTrial: runs a trial of the emperor's mind against the user
  // implemented as an actual method to avoid instance shadowing issues

  constructor(payload: Partial<IConsciousnessPayload> & { emperorName: string; originalEra: string; personality: Record<string, number> }) {
    this.emperorName = payload.emperorName;
    this.originalEra = payload.originalEra;
    this.personality = payload.personality || {};
    this.consciousnessLevel = payload.consciousnessLevel ?? 0.1;
    this.memoriesUnlocked = payload.memoriesUnlocked ?? [];
    this.techniquesAvailable = payload.techniquesAvailable ?? [];
    this.willpowerStrength = payload.willpowerStrength ?? 100;
    this.state = 'dormant';
  }

  // Quick eligibility check: returns whether the item will even attempt to engage
  public isCompatible(userCultivation: number, userTalent: number): boolean {
    // Basic rule: require a non-trivial cultivation or talent to awaken
    return userCultivation >= 50 || userTalent >= 50;
  }

  // Attempt to awaken the consciousness. Returns feedback text and boolean success
  public attemptAwaken(userCultivation: number, userTalent: number, respectLevel = 0): { success: boolean; message: string } {
    if (!this.isCompatible(userCultivation, userTalent)) {
      return { success: false, message: `${this.emperorName} scoffs at your weakness.` };
    }

    // Respect increases chance; personality.proud increases required respect
    const pride = this.personality.proud ?? 0.5;
    const threshold = 0.2 + (pride * 0.5);

    const power = Math.min(1, (userCultivation / 1000) + (userTalent / 1000) + respectLevel);

    if (power >= threshold) {
      this.state = 'awakening';
      // small growth
      this.consciousnessLevel = Math.min(1, this.consciousnessLevel + 0.1 + (power * 0.2));
      // grant a small technique if available
      if (this.techniquesAvailable.length && !this.techniquesAvailable[0]) {
        // noop
      }
      return { success: true, message: `${this.emperorName} studies you and begins to awaken.` };
    }

    // failure causes mockery or dormancy
    return { success: false, message: `${this.emperorName} remains indifferent.` };
  }

  // Conditional grant of power during a situation
  public grantConditionalPower(userAction: string, context: Record<string, any> = {}): { granted: boolean; description?: string } {
    // Simple rule: grant power on defensive acts or when user shows humility
    if (userAction === 'defend' || context.humble) {
      // small temporary boost proportional to consciousnessLevel
      const strength = Math.round(this.willpowerStrength * (0.1 + this.consciousnessLevel * 0.4));
      return { granted: true, description: `A surge of ${strength} will manifests from ${this.emperorName}.` };
    }
    return { granted: false };
  }

  // When the user visits an important location, memory fragments may unlock
  public reactToLocation(locationTag: string): string | null {
    if (this.memoriesUnlocked.includes(locationTag)) return null;
    if (locationTag === this.originalEra || locationTag.includes(this.originalEra.split(' ')[0])) {
      this.memoriesUnlocked.push(locationTag);
      this.consciousnessLevel = Math.min(1, this.consciousnessLevel + 0.05);
      return `${this.emperorName} shares a memory of ${locationTag}.`;
    }
    return null;
  }

  // Mental-world trial: user attempts mental trials against emperor will
  public mentalWorldTrial(userMentalStrength: number): { passed: boolean; description: string; memory?: string; backlash?: number } {
    const difficulty = 50 + Math.round(this.consciousnessLevel * 100);
    const passed = userMentalStrength >= difficulty;
    if (passed) {
      this.consciousnessLevel = Math.min(1, this.consciousnessLevel + 0.1);
      const mem = `trial_${Date.now()}`;
      this.memoriesUnlocked.push(mem);
      return { passed: true, description: `You pass the emperor's trial and unlock memory ${mem}.`, memory: mem };
    }
    const backlash = Math.max(0, 10 + Math.round((difficulty - userMentalStrength) / 2));
    return { passed: false, description: `You fail and suffer mental backlash of ${backlash}.`, backlash };
  }
}

// Lightweight exported helpers to keep codebase centered
export function createSampleConsciousnessFor(emperorName: string, era: string) {
  return new ImmortalEmperorConsciousness({ emperorName, originalEra: era, personality: { proud: 0.8, demanding: 0.6 } });
}

// (mentalWorldTrial implemented as class method)
