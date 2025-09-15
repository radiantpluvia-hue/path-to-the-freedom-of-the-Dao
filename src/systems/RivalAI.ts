// Minimal Rival AI stub for early integration and testing
export type RivalPersonality = 'aggressive' | 'cunning' | 'defensive' | 'neutral';

export interface RivalMemory {
  encounterId: string;
  timestamp: number;
  outcome: 'win' | 'loss' | 'draw';
}

export interface RivalProfile {
  id: string;
  name: string;
  personality: RivalPersonality;
}

export class RivalAI {
  profile: RivalProfile;
  memories: RivalMemory[] = [];

  constructor(profile: RivalProfile) {
    this.profile = profile;
  }

  decideAction(): string {
    // Very simple stub: choose action based on personality
    switch (this.profile.personality) {
      case 'aggressive':
        return 'attack';
      case 'cunning':
        return 'feint';
      case 'defensive':
        return 'defend';
      default:
        return 'wait';
    }
  }

  remember(memory: RivalMemory) {
    this.memories.push(memory);
    // keep last 50
    if (this.memories.length > 50) this.memories.shift();
  }
}
