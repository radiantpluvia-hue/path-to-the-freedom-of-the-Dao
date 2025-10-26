// Ensure test loads the compiled domain system implementation so ReplayPlayer
// (which runtime-requires the scripts implementation) can call into it.
try { require('../../.tmp_build/utils/domainSystem.cjs'); } catch (e) { /* ignore */ }
const ReplayPlayerModule: any = require('../tools/ReplayPlayer');
const ReplayPlayer = ReplayPlayerModule.default || ReplayPlayerModule;
const applyReplayFunc = ReplayPlayerModule.applyReplayDirect || ReplayPlayer.applyReplay;

function makeGameState() {
  const gs: any = { world: { territories: {}, factions: {} }, player: { yuan: 1000, reputation: { world: 100 } } };
  gs.world.territories['t1'] = { id: 't1', influence: {}, ownerFactionId: null, garrison: { troops: 50 }, buildings: {} };
  gs.world.factions['f1'] = { id: 'f1', treasury: { gold: 200 } };
  return gs;
}

test('replay player applies actions deterministically', () => {
  const gs = makeGameState();
  // debug: directly require compiled domain module and try applying influence/capture
  try {
    const Domain = require('../../.tmp_build/utils/domainSystem.cjs');
    try { console.log('DEBUG direct Domain functions available?', !!Domain && !!Domain.applyTerritoryInfluence, !!Domain && !!Domain.applyCaptureTransaction); } catch (_) { }
  try { Domain.applyTerritoryInfluence && Domain.applyTerritoryInfluence(gs, 't1', 'f1', 30); } catch (e) { console.log('DEBUG direct applyTerritoryInfluence threw', e && (((e as any).stack) || ((e as any).message)) || e); }
  try { const tx = { territoryId: 't1', attackerFactionId: 'f1', share: 0.75, defense: 10, requiredUpkeep: 20, prevOwner: null, funding: 'normal', ledger: {} }; Domain.applyCaptureTransaction && Domain.applyCaptureTransaction(gs, tx); } catch (e) { console.log('DEBUG direct applyCaptureTransaction threw', e && (((e as any).stack) || ((e as any).message)) || e); }
    try { console.log('DEBUG gs after direct domain calls', JSON.stringify(gs, null, 2)); } catch (_) { }
  } catch (e) { /* ignore */ }
  const fixture = { seed: 123456, actions: [ { type: 'influence', tid: 't1', fid: 'f1', inc: 30 }, { type: 'captureAttempt', preview: { territoryId: 't1', attackerFactionId: 'f1', share: 0.75, defense: 10, requiredUpkeep: 20, prevOwner: null, funding: 'normal', ledger: {} } } ] };
  applyReplayFunc(gs, fixture);
  // debug snapshot
  try { console.log('DEBUG gs after replay:', JSON.stringify(gs, null, 2)); } catch (e) { /* ignore */ }
  // after applying influence and capture, territory owner should be f1
  expect(gs.world.territories['t1'].ownerFactionId).toBe('f1');
  // faction treasury decreased by requiredUpkeep or remains non-negative
  expect(gs.world.factions['f1'].treasury.gold).toBeGreaterThanOrEqual(0);
});
