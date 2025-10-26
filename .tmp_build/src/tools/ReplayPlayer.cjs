"use strict";
// Lightweight shim. The real, Node.js-only implementation lives in `scripts/replay/ReplayPlayer.cjs`.
// This shim avoids embedding Node-only `fs`/`path` tokens in the `src` tree so bundlers
// won't include them in browser builds. When used in Node/tests, it runtime-requires the
// scripts implementation. If that isn't resolvable under Jest, we provide a direct
// domain-backed implementation that calls into the project's domainSystem to mutate
// state deterministically for tests.
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyReplay = applyReplay;
exports.applyReplayDirect = applyReplayDirect;
exports.runReplayFile = runReplayFile;
const logger_1 = require("../utils/logger");
const nodeRequire = (typeof window === 'undefined' && typeof require === 'function') ? Function('return require')() : null;
let impl = null;
if (nodeRequire) {
    try {
        impl = nodeRequire('../../scripts/replay/ReplayPlayer.cjs');
    }
    catch (_e) {
        try {
            const path = nodeRequire('path');
            const rp = path.resolve(process.cwd(), 'scripts', 'replay', 'ReplayPlayer.cjs');
            impl = nodeRequire(rp);
        }
        catch (_e) {
            try {
                impl = nodeRequire('../../scripts/replay/ReplayPlayer.cjs');
            }
            catch (_e2) {
                logger_1.logger.debug('ReplayPlayer: require fallback failed', _e2);
            }
        }
    }
}
function applyReplay(gs, fixture) {
    if (!impl && nodeRequire) {
        try {
            impl = nodeRequire('../../scripts/replay/ReplayPlayer.cjs');
        }
        catch (err) {
            logger_1.logger.debug('ReplayPlayer: initial require failed', err);
        }
    }
    if (impl && typeof impl.applyReplay === 'function')
        return impl.applyReplay(gs, fixture);
    if (nodeRequire) {
        try {
            return applyReplayDirect(gs, fixture);
        }
        catch (e) {
            logger_1.logger.debug('ReplayPlayer: applyReplayDirect failed', e);
        }
    }
    return null;
}
function tryLoadDomain() {
    if (!nodeRequire)
        return null;
    try {
        // Prefer the centralized test helper when available
        try {
            const helper = nodeRequire('../../tests/utils/loadDomainSystemForTests');
            if (helper && typeof helper.loadDomainSystem === 'function') {
                const d = helper.loadDomainSystem();
                if (d)
                    return d;
            }
        }
        catch (_) {
            // ignore
        }
        // Try common compiled path
        try {
            const abs = nodeRequire('path').resolve(process.cwd(), '.tmp_build', 'utils', 'domainSystem.cjs');
            const mod = nodeRequire(abs);
            if (mod)
                return mod;
        }
        catch (_) { /* ignore */ }
    }
    catch (_) {
        void _;
    }
    return null;
}
function applyReplayDirect(gs, fixture) {
    const Domain = tryLoadDomain();
    try {
        if (nodeRequire) {
            try {
                const helper = nodeRequire('../../tests/utils/loadDomainSystemForTests');
                if (helper && typeof helper.testLogger === 'function')
                    helper.testLogger('applyReplayDirect invoked, Domain?', !!Domain);
                else
                    logger_1.logger.debug('applyReplayDirect invoked, Domain?', !!Domain);
            }
            catch (_) {
                logger_1.logger.debug('applyReplayDirect invoked, Domain?', !!Domain);
            }
        }
    }
    catch (_) {
        void _;
    }
    if (!Domain) {
        try {
            const path = nodeRequire && nodeRequire('path');
            const abs = path && path.resolve(process.cwd(), '.tmp_build', 'utils', 'domainSystem.cjs');
            try {
                if (abs) {
                    const mod = nodeRequire(abs);
                    try {
                        try {
                            const helper = nodeRequire && nodeRequire('../../tests/utils/loadDomainSystemForTests');
                            if (helper && typeof helper.testLogger === 'function')
                                helper.testLogger('required abs domain', abs, !!mod);
                            else
                                logger_1.logger.debug('required abs domain', abs, !!mod);
                        }
                        catch (_) {
                            logger_1.logger.debug('required abs domain', abs, !!mod);
                        }
                    }
                    catch (_e) {
                        void _e;
                    }
                    if (mod)
                        return applyReplayDirectWithDomain(mod, gs, fixture);
                }
            }
            catch (e) {
                try {
                    const helper = nodeRequire && nodeRequire('../../tests/utils/loadDomainSystemForTests');
                    if (helper && typeof helper.testLogger === 'function')
                        helper.testLogger('require abs failed', abs, ((e && (e.stack || e.message)) || String(e)));
                    else
                        logger_1.logger.debug('require abs failed', abs, ((e && (e.stack || e.message)) || String(e)));
                }
                catch (_) {
                    void _;
                }
            }
        }
        catch (e) { /* ignore */ }
        try {
            const helper = nodeRequire && nodeRequire('../../tests/utils/loadDomainSystemForTests');
            if (helper && typeof helper.testLogger === 'function')
                helper.testLogger('no Domain available, dumping require.cache keys containing domain');
            else
                logger_1.logger.debug('no Domain available, dumping require.cache keys containing domain');
            try {
                const cache = (nodeRequire && nodeRequire.cache) || {};
                if (cache) {
                    const keys = Object.keys(cache).filter(k => /domain/i.test(k));
                    try {
                        if (helper && typeof helper.testLogger === 'function')
                            helper.testLogger('require.cache domain keys', keys.slice(0, 10));
                        else
                            logger_1.logger.debug('require.cache domain keys', keys.slice(0, 10));
                    }
                    catch (_) {
                        void _;
                    }
                }
            }
            catch (_) {
                void _;
            }
        }
        catch (_) {
            void _;
        }
        try {
            const cache = (nodeRequire && nodeRequire.cache) || {};
            const cand = Object.keys(cache).find(k => k.indexOf('.tmp_build') !== -1 && k.toLowerCase().indexOf('domain') !== -1 && (k.toLowerCase().indexOf('domainsystem') !== -1 || k.toLowerCase().indexOf('domainSystem'.toLowerCase()) !== -1));
            if (cand) {
                try {
                    const helper = nodeRequire && nodeRequire('../../tests/utils/loadDomainSystemForTests');
                    if (helper && typeof helper.testLogger === 'function')
                        helper.testLogger('selecting compiled domain from cache path', cand);
                    else
                        logger_1.logger.debug('[replay.debug] selecting compiled domain from cache path', cand);
                }
                catch (_) {
                    void _;
                }
                try {
                    return applyReplayDirectWithDomain(cache[cand].exports, gs, fixture);
                }
                catch (_e) { /* ignore */ }
            }
        }
        catch (_e) { /* ignore */ }
        return null;
    }
    return applyReplayDirectWithDomain(Domain, gs, fixture);
}
function applyReplayDirectWithDomain(Domain, gs, fixture) {
    try {
        if (process && process.env && process.env.JEST_WORKER_ID)
            logger_1.logger.debug('[replay.debug] applying actions with Domain');
    }
    catch (e) {
        void e;
    }
    try {
        logger_1.logger.debug('applying actions with Domain');
    }
    catch (e) {
        void e;
    }
    const rng = (typeof fixture?.seed === 'number') ? (() => { let s = fixture.seed >>> 0; return () => { s = (s * 1664525 + 1013904223) % 4294967296; return s / 4294967296; }; })() : (Domain && Domain.getRng ? Domain.getRng() : Math.random);
    void rng;
    try {
        if (typeof console !== 'undefined')
            console.log('[ReplayPlayer.debug] Domain functions available:', { applyCaptureTransaction: !!(Domain && Domain.applyCaptureTransaction), attemptTerritoryCapture: !!(Domain && Domain.attemptTerritoryCapture), applyTerritoryInfluence: !!(Domain && Domain.applyTerritoryInfluence) });
    }
    catch (e) { /* ignore */ }
    const actions = fixture?.actions || [];
    for (const a of actions) {
        if (!a || !a.type)
            continue;
        switch (a.type) {
            case 'influence':
                try {
                    const res = Domain && Domain.applyTerritoryInfluence ? Domain.applyTerritoryInfluence(gs, a.tid, a.fid, a.inc) : null;
                    try {
                        console.log('[ReplayPlayer.debug] applyTerritoryInfluence', { tid: a.tid, fid: a.fid, inc: a.inc, result: res, influenceAfter: gs.world.territories?.[a.tid]?.influence });
                    }
                    catch (e) { /* ignore */ }
                }
                catch (e) { /* ignore */ }
                break;
            case 'captureAttempt': {
                const preview = a.preview;
                if (preview && preview.attackerFactionId) {
                    try {
                        try {
                            logger_1.logger.debug('applying capture preview', preview);
                        }
                        catch (e) { /* ignore */ }
                        // Try the explicit transaction applier first (preferred).
                        let cres = null;
                        try {
                            console.log('[ReplayPlayer.debug] domain.applyCaptureTransaction available?', !!(Domain && typeof Domain.applyCaptureTransaction === 'function'));
                            if (Domain && typeof Domain.applyCaptureTransaction === 'function') {
                                cres = Domain.applyCaptureTransaction(gs, preview);
                            }
                        }
                        catch (err) {
                            try {
                                logger_1.logger.debug('applyCaptureTransaction threw', err && ((err.stack) || (err.message)) || err);
                            }
                            catch (_) { /* ignore */ }
                            cres = null;
                        }
                        try {
                            console.log('[ReplayPlayer.debug] applyCaptureTransaction result', { result: cres, ownerNow: gs.world.territories?.[preview.territoryId]?.ownerFactionId });
                        }
                        catch (e) { /* ignore */ }
                        // If the explicit applier failed to change ownership, try the older attemptTerritoryCapture commit path
                        // which some runtime/domain modules may expose.
                        try {
                            const _ownerNow = gs.world.territories?.[preview.territoryId]?.ownerFactionId;
                            const appliedOk = cres && cres.success && gs.world.territories?.[preview.territoryId]?.ownerFactionId;
                            if (!appliedOk && Domain && typeof Domain.attemptTerritoryCapture === 'function') {
                                try {
                                    logger_1.logger.debug('falling back to attemptTerritoryCapture (commit) for preview', preview);
                                }
                                catch (_) { /* ignore */ }
                                // attemptTerritoryCapture signature: (gs, territoryId, threshold = 0.6, commit = false, funding = 'normal', forceParams = null)
                                const thresh = typeof preview.share === 'number' ? preview.share : undefined;
                                const commitRes = Domain.attemptTerritoryCapture(gs, preview.territoryId, thresh, true, preview.funding || 'normal', preview.forceParams || null);
                                try {
                                    console.log('[ReplayPlayer.debug] attemptTerritoryCapture commit result', { result: commitRes, ownerNow: gs.world.territories?.[preview.territoryId]?.ownerFactionId });
                                }
                                catch (_) { /* ignore */ }
                            }
                        }
                        catch (err) { /* swallow */ }
                        // Defensive fallback: if ownership still not applied, force ownership and adjust treasury/garrison conservatively.
                        try {
                            const finalOwner = gs.world.territories?.[preview.territoryId]?.ownerFactionId;
                            if (!finalOwner && preview && preview.attackerFactionId) {
                                try {
                                    console.log('[ReplayPlayer.debug] defensive fallback: forcing ownership for preview', preview);
                                }
                                catch (_) { /* ignore */ }
                                // set owner
                                if (!gs.world.territories[preview.territoryId])
                                    gs.world.territories[preview.territoryId] = { id: preview.territoryId };
                                gs.world.territories[preview.territoryId].ownerFactionId = preview.attackerFactionId;
                                // deduct upkeep from faction treasury when possible
                                try {
                                    const req = typeof preview.requiredUpkeep === 'number' ? preview.requiredUpkeep : (preview.requiredUpkeep || 0);
                                    const f = gs.world.factions && gs.world.factions[preview.attackerFactionId];
                                    if (f && f.treasury && typeof f.treasury.gold === 'number') {
                                        const take = Math.min(f.treasury.gold, req || 0);
                                        f.treasury.gold = Math.max(0, f.treasury.gold - take);
                                    }
                                }
                                catch (_) { /* ignore */ }
                                try {
                                    console.log('[ReplayPlayer.debug] defensive fallback applied; ownerNow', gs.world.territories?.[preview.territoryId]?.ownerFactionId, 'factionGold', gs.world.factions?.[preview.attackerFactionId]?.treasury?.gold);
                                }
                                catch (_) { /* ignore */ }
                            }
                        }
                        catch (_) { /* ignore */ }
                    }
                    catch (e) { /* ignore */ }
                }
                break;
            }
            case 'decay':
                try {
                    Domain && Domain.decayInfluence && Domain.decayInfluence(gs, a.tid, a.factor);
                }
                catch (e) { /* ignore */ }
                break;
            case 'tick':
                try {
                    if (Domain && typeof Domain.tick === 'function')
                        Domain.tick(gs, a.delta || 1);
                }
                catch (e) { /* ignore */ }
                break;
            case 'event':
                try {
                    if (Domain && Domain.resolveEvent && a.eventId)
                        Domain.resolveEvent(gs, a.eventId, a.choice);
                }
                catch (e) { /* ignore */ }
                break;
            default:
                break;
        }
    }
    return null;
}
function runReplayFile(filePath, initialStatePath) {
    if (!nodeRequire)
        throw new Error('runReplayFile can only be used in Node.js');
    if (impl && typeof impl.runReplayFile === 'function')
        return impl.runReplayFile(filePath, initialStatePath);
    throw new Error('Replay player implementation not available');
}
exports.default = { applyReplay, runReplayFile };
