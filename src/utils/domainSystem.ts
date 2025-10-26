// Shim wrappers for the project-root `utils/domainSystem.ts` implementation.
// We provide explicit exported symbols so the TS server can resolve names
// (and fall back gracefully at runtime if the root module isn't loadable).
import type * as DS from '../types/domainSystem';
import { runtimeRng } from './seededRng';

let _impl: any = null;
try {
	// Try to resolve a runtime domainSystem implementation if present.
	// Use a Function-based require to avoid ESLint's no-var-requires complaints while
	// allowing synchronous resolution under Node/Jest.
	try {
		const nodeRequire = (typeof Function === 'function') ? Function('return require')() : null;
		if (nodeRequire) {
			const maybe = nodeRequire('../../utils/domainSystem');
			_impl = (maybe && (maybe.default || maybe)) || null;
		}
	} catch (eSync) {
		// ignore sync require failures and attempt dynamic import below
	}
	if (!_impl) {
		import('../../utils/domainSystem').then(m => { _impl = (m as any) || null; }).catch(() => { _impl = null; });
	}
} catch (e) {
	_impl = null;
}

export function attemptTerritoryCapture(gs: DS.AnyGameState, territoryId: string, threshold?: number, commit?: boolean, funding?: DS.CaptureFundingOption, forceParams?: any): DS.CapturePreview | null {
	if (_impl && typeof _impl.attemptTerritoryCapture === 'function') return _impl.attemptTerritoryCapture(gs, territoryId, threshold, commit, funding, forceParams);
	// Fallback deterministic implementation for tests
	const preview = buildCaptureTransaction(gs, territoryId, threshold, funding, forceParams);
	if (!preview) return null;
	if (commit) {
		return applyCaptureTransaction(gs, preview as any) as any;
	}
	return preview as any;
}

export function buildCaptureTransaction(gs: DS.AnyGameState, territoryId: string, threshold?: number, funding?: DS.CaptureFundingOption, forceParams?: any): DS.CaptureTransaction | null {
	if (_impl && typeof _impl.buildCaptureTransaction === 'function') return _impl.buildCaptureTransaction(gs, territoryId, threshold, funding, forceParams);
	// Fallback deterministic builder used by tests
	try {
		const territories = (gs && gs.world && gs.world.territories) || {};
		const territory = territories[territoryId];
		if (!territory) return null;
		const influence = territory.influence || {};
		const entries = Object.entries(influence).map(([k, v]) => [k, Number(v || 0)] as [string, number]);
		if (entries.length === 0) return null;
		let total = entries.reduce((s, e) => s + e[1], 0);
		if (total <= 0) total = 1;
		// pick attacker as highest share; tie -> favor current owner
		entries.sort((a, b) => b[1] - a[1]);
		let attacker = entries[0][0];
		if (entries.length > 1 && Math.abs(entries[0][1] - entries[1][1]) < 1e-9) {
			// tie -> favor owner if present
			if (typeof territory.ownerFactionId === 'string' && territory.ownerFactionId) attacker = territory.ownerFactionId;
		}
	const foundEntry = entries.find(e => e[0] === attacker);
	const attackerVal = foundEntry ? foundEntry[1] : (entries[0] ? entries[0][1] : 0);
	const share = attackerVal / total;
		const defense = territory.garrison && typeof territory.garrison.troops === 'number' ? territory.garrison.troops : 0;
		const requiredUpkeep = Math.max(0, Math.ceil(defense * 0.1));
		const ledger: any = {
			factionBefore: (gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury && typeof gs.world.factions[attacker].treasury.gold === 'number') ? gs.world.factions[attacker].treasury.gold : 0,
			playerBefore: (gs.player && typeof gs.player.yuan === 'number') ? gs.player.yuan : 0,
			garrisonBefore: defense
		};
		const tx: any = {
			territoryId,
			attackerFactionId: attacker,
			prevOwner: territory.ownerFactionId || null,
			share,
			defense,
			requiredUpkeep,
			funding: funding || 'normal',
			ledger
		};
		return tx as DS.CaptureTransaction;
	} catch (e) {
		return null;
	}
}

export function applyCaptureTransaction(gs: DS.AnyGameState, tx: DS.CaptureTransaction) {
	if (_impl && typeof _impl.applyCaptureTransaction === 'function') return _impl.applyCaptureTransaction(gs, tx);
	// Fallback deterministic applier used by tests
	try {
		if (!tx || !tx.territoryId) return { success: false, reason: 'invalid_tx' };
		const territories = (gs && gs.world && gs.world.territories) || {};
		const territory = territories[tx.territoryId];
		if (!territory) return { success: false, reason: 'territory_missing' };
	const attacker = (tx as any).attackerFactionId || (tx as any).attacker || null;
		// Handle funding
		const required = typeof (tx as any).requiredUpkeep === 'number' ? (tx as any).requiredUpkeep : 0;
		if (tx.funding === 'normal' || !tx.funding) {
			if (attacker && gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury) {
				const f = gs.world.factions[attacker];
				const avail = typeof f.treasury.gold === 'number' ? f.treasury.gold : 0;
				const paid = Math.min(avail, required);
				f.treasury.gold = Math.max(0, avail - paid);
			}
		} else if (tx.funding === 'drain_player') {
			if (attacker && gs.world && gs.world.factions && gs.world.factions[attacker] && gs.world.factions[attacker].treasury) {
				const f = gs.world.factions[attacker];
				const paid = Math.min(typeof f.treasury.gold === 'number' ? f.treasury.gold : 0, required);
				f.treasury.gold = Math.max(0, (f.treasury.gold || 0) - paid);
				const remaining = required - paid;
				if (remaining > 0 && gs.player && typeof gs.player.yuan === 'number') {
					const take = Math.min(gs.player.yuan, remaining);
					gs.player.yuan = Math.max(0, gs.player.yuan - take);
				}
			} else if (gs.player && typeof gs.player.yuan === 'number') {
				const take = Math.min(gs.player.yuan, required);
				gs.player.yuan = Math.max(0, gs.player.yuan - take);
			}
		} else if (tx.funding === 'force_capture') {
			// apply attrition
			const mult = (tx.forceParams && typeof tx.forceParams.attritionMultiplier === 'number') ? tx.forceParams.attritionMultiplier : 1.0;
			if (territory.garrison && typeof territory.garrison.troops === 'number') {
				const before = territory.garrison.troops;
				const loss = Math.max(1, Math.floor(before * 0.3 * mult));
				territory.garrison.troops = Math.max(0, before - loss);
			}
			// reputation penalty
			if (gs.player && gs.player.reputation && typeof gs.player.reputation.world === 'number' && tx.forceParams && typeof tx.forceParams.reputationPenalty === 'number') {
				gs.player.reputation.world = Math.max(0, gs.player.reputation.world - tx.forceParams.reputationPenalty);
			}
		}
		// Change ownership
		territory.ownerFactionId = attacker;
		return { success: true };
	} catch (e) {
		return { success: false, reason: 'exception', error: String(e) };
	}
}

export function applyTerritoryInfluence(gs: DS.AnyGameState, territoryId: string, factionId: string, amount: number): boolean {
	if (_impl && typeof _impl.applyTerritoryInfluence === 'function') return _impl.applyTerritoryInfluence(gs, territoryId, factionId, amount);
	return false;
}

export function decayInfluence(gs: DS.AnyGameState, territoryId: string, decayFactor?: number): boolean {
	if (_impl && typeof _impl.decayInfluence === 'function') return _impl.decayInfluence(gs, territoryId, decayFactor);
	return false;
}

export function createDomain(gs: DS.AnyGameState, opts?: any): any {
	if (_impl && typeof _impl.createDomain === 'function') return _impl.createDomain(gs, opts);
	return null;
}

export function getDomainById(gs: DS.AnyGameState, id: string): DS.TerritoryStateLite | null {
	if (_impl && typeof _impl.getDomainById === 'function') return _impl.getDomainById(gs, id);
	return null;
}

export function transferDomainOwnership(gs: DS.AnyGameState, domainId: string, newOwnerFaction?: string): boolean {
	if (_impl && typeof _impl.transferDomainOwnership === 'function') return _impl.transferDomainOwnership(gs, domainId, newOwnerFaction);
	return false;
}

// Allow deterministic replay tooling to inject a runtime RNG into the full utils implementation if present
export function setRng(rng: () => number) {
	if (_impl && typeof (_impl as any).setRng === 'function') {
		try { ( _impl as any).setRng(rng); return; } catch (e) { /* ignore */ }
	}
	try { ( _impl as any).rng = rng; } catch (e) { /* ignore */ }
}

export function getRng(): () => number {
	// Prefer an explicit getter on the implementation, then an `rng` field, then try to use a runtime seeded RNG helper
	if (_impl && typeof (_impl as any).getRng === 'function') {
		try { const g = (_impl as any).getRng(); if (typeof g === 'function') return g; } catch (e) { /* ignore */ }
	}
	try {
		const maybe = (_impl as any).rng;
		if (typeof maybe === 'function') return maybe;
	} catch (e) { /* ignore */ }
	// As a last resort, try to use a runtime seeded RNG helper if available in utils/seededRng
	try {
		if (typeof runtimeRng === 'function') return runtimeRng;
	} catch (e) { /* ignore */ }
	return Math.random;
}

export default _impl as any;
