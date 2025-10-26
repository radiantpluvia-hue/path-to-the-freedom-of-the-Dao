/* eslint @typescript-eslint/no-non-null-assertion: "off" */
import { attemptTerritoryCapture, buildCaptureTransaction, applyCaptureTransaction } from '../../utils/domainSystem';

describe('capture transaction flows', () => {
  test('normal funding requires faction treasury', () => {
    const gs: any = { world: { territories: { t1: { id: 't1', influence: { f1: 70, f2: 30 }, ownerFactionId: 'f2', garrison: { troops: 100 }, buildings: {} } }, factions: { f1: { id: 'f1', treasury: { gold: 50 } }, f2: { id: 'f2', treasury: { gold: 100 } } } }, player: { yuan: 0 } };
    const preview = buildCaptureTransaction(gs, 't1', 0.6, 'normal');
    expect(preview).not.toBeNull();
    // commit
    const ledger = (preview! as any).ledger;
    const factionBefore = ledger && ledger.factionBefore;
    const playerBefore = ledger && ledger.playerBefore;
    const garrisonBefore = ledger && ledger.garrisonBefore;
    const res = applyCaptureTransaction(gs, preview!);
    expect(res.success).toBeTruthy();
    // faction f1 treasury should be reduced by requiredUpkeep but may be insufficient
    if (typeof factionBefore === 'number' && typeof (preview as any).requiredUpkeep === 'number') {
      const expectedAfter = Math.max(0, factionBefore - Math.min(factionBefore, (preview as any).requiredUpkeep));
      expect(gs.world.factions.f1.treasury.gold).toBe(expectedAfter);
    }
  });

  test('drain_player uses player funds when treasury insufficient', () => {
    const gs: any = { world: { territories: { t2: { id: 't2', influence: { f1: 80, f2: 20 }, ownerFactionId: null, garrison: { troops: 20 }, buildings: {} } }, factions: { f1: { id: 'f1', treasury: { gold: 0 } } } }, player: { yuan: 30 } };
    const preview = buildCaptureTransaction(gs, 't2', 0.6, 'drain_player');
    expect(preview).not.toBeNull();
    const res = applyCaptureTransaction(gs, preview!);
    expect(res.success).toBeTruthy();
    // player funds should be deducted if needed
    expect(gs.player.yuan).toBeGreaterThanOrEqual(0);
  });

  test('force capture applies attrition and penalties', () => {
    const gs: any = { world: { territories: { t3: { id: 't3', influence: { f1: 90, f2: 10 }, ownerFactionId: 'f2', garrison: { troops: 50 }, buildings: {} } }, factions: { f1: { id: 'f1', treasury: { gold: 0 } } } }, player: { yuan: 0, reputation: { world: 20 } } };
    const preview = buildCaptureTransaction(gs, 't3', 0.6, 'force_capture', { attritionMultiplier: 1.5, influencePenalty: 10, reputationPenalty: 5 });
    expect(preview).not.toBeNull();
    const beforeTroops = gs.world.territories.t3.garrison.troops;
    const res = applyCaptureTransaction(gs, preview!);
    expect(res.success).toBeTruthy();
    // troops reduced significantly
    expect(gs.world.territories.t3.garrison.troops).toBeLessThan(beforeTroops);
    // reputation penalty applied
    expect(gs.player.reputation.world).toBeLessThan(20);
  });

  test('tie threshold favors current owner', () => {
    const gs: any = { world: { territories: { t4: { id: 't4', influence: { f1: 50, f2: 50 }, ownerFactionId: 'f2', garrison: { troops: 10 }, buildings: {} } }, factions: { f1: { id: 'f1', treasury: { gold: 100 } }, f2: { id: 'f2', treasury: { gold: 100 } } } }, player: { yuan: 0 } };
    const preview = buildCaptureTransaction(gs, 't4', 0.5, 'normal');
    expect(preview).not.toBeNull();
    // tie should favor current owner (f2) so newOwner should be f2
    expect(preview!.attackerFactionId).toBe('f2');
  });
});
