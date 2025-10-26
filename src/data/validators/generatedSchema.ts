// Lightweight validators for generated passives and active abilities.
// Not a full runtime schema library — just focused checks used in tests.
import { GENERATED_PASSIVES } from '../generated/passives.generated';
import GENERATED_ABILITIES from '../generated/activeAbilities.generated';

export function validateGeneratedPassiveShape(p: any) {
  if (!p || typeof p.id !== 'string') return { ok: false, reason: 'missing id' };
  if (!p.name || typeof p.name !== 'string') return { ok: false, reason: 'missing name' };
  if (!p.stats || typeof p.stats !== 'object') return { ok: false, reason: 'missing stats' };
  const s = p.stats;
  const numericFields = ['atk','def','hp','atkPct','defPct'];
  for (const f of numericFields) {
    if (s[f] !== undefined && typeof s[f] !== 'number') return { ok: false, reason: `stat ${f} not a number` };
  }
  return { ok: true };
}

export function validateGeneratedAbilityShape(a: any) {
  if (!a || typeof a.id !== 'string') return { ok: false, reason: 'missing id' };
  if (!a.name || typeof a.name !== 'string') return { ok: false, reason: 'missing name' };
  if (!Array.isArray(a.effects)) return { ok: false, reason: 'effects missing or not array' };
  for (const e of a.effects) {
    if (!e || typeof e.type !== 'string') return { ok: false, reason: 'effect missing type' };
    if (e.value !== undefined && typeof e.value !== 'number') return { ok: false, reason: 'effect value not number' };
  }
  return { ok: true };
}

export function validateAllGenerated() {
  const pBad = GENERATED_PASSIVES.map(p => ({ id: p.id, result: validateGeneratedPassiveShape(p) })).filter(x => !x.result.ok);
  const aBad = (GENERATED_ABILITIES as any[]).map(a => ({ id: a.id, result: validateGeneratedAbilityShape(a) })).filter(x => !x.result.ok);
  return { passivesInvalid: pBad, abilitiesInvalid: aBad };
}

export default true;
