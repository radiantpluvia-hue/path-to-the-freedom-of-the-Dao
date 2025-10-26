import { Registry } from '../data/registry';
// ensure registry data (pathways etc.) is registered when this module loads
import '../bootstrap/registryBootstrap';

class CultivationSystemClass {
  selectPathway(player: any, pathwayId: string) {
    const data = Registry.get('pathways') || {};
    const list = data.pathways || [];
    const p = list.find((x: any) => x.id === pathwayId) || null;
    if (!p) return false;
    player.cultivation = player.cultivation || {};
    player.cultivation.pathway = p.id;
    player.cultivation.bonuses = p.bonuses || {};
    // Emit persistent Buff objects for pathway bonuses so other systems process them uniformly
    player.activeBuffs = player.activeBuffs || [];
    const now = Date.now();
    const tick = (player as any).currentTick || 0;
    const newBuffs: any[] = [];
    const bonuses = p.bonuses || {};
    for (const key of Object.keys(bonuses)) {
      const val = (bonuses as any)[key];
      const buffId = `pathway_${p.id}_${key}`;
      const buff: any = {
        id: buffId,
        name: `${p.name}: ${key}`,
        description: `Pathway bonus ${key}`,
        duration: -1,
        durationType: 'ticks',
        effects: { [key]: val },
        source: 'pathway',
        sourceId: p.id,
        stackable: false,
        appliedAt: now,
        appliedTick: tick,
        category: 'cultivation',
        isPermanent: true,
      };
      // Replace any existing buff with same id
      player.activeBuffs = player.activeBuffs.filter((b: any) => b.id !== buffId);
      player.activeBuffs.push(buff);
      newBuffs.push(buffId);
    }
    player.cultivation.buffIds = newBuffs;
    return true;
  }

  // Apply pathway bonuses to a simple stat object (returns modified copy)
  applyPathwayBonuses(player: any, stats: any) {
    const pathway = player.cultivation && player.cultivation.pathway ? player.cultivation.pathway : null;
    if (!pathway) return { ...stats };
    const data = Registry.get('pathways') || {};
    const list = data.pathways || [];
    const p = list.find((x: any) => x.id === pathway) || null;
    if (!p) return { ...stats };
    const s = { ...stats };
    const b = p.bonuses || {};
    for (const k of Object.keys(b)) {
      const val = (b as any)[k];
      if (typeof val === 'number') s[k] = (s[k] || 0) + val;
      else s[k] = val;
    }
    return s;
  }
}

export default new CultivationSystemClass();
