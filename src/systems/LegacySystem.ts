import { LegacyRemnant, PastLife, NarrativeEngine } from '../types';

export class LegacySystem {
  private engine: NarrativeEngine;

  constructor(engine: NarrativeEngine) {
    this.engine = engine;
  }

  public addRemnant(remnant: LegacyRemnant) {
    this.engine.legacyRemnants.push(remnant);
  }

  public getActiveRemnants() {
  return this.engine.legacyRemnants.filter((r: any) => r.active);
  }

  public inheritRemnantsForNewLife(): LegacyRemnant[] {
    // Return a shallow copy of active remnants to be applied to a new reincarnation
  return this.getActiveRemnants().map((r: any) => ({ ...r }));
  }

  public recordPastLifeSummary(life: PastLife) {
    this.engine.pastLives.push(life);
  }
}

export default LegacySystem;
