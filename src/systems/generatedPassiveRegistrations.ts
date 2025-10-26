import { roll, getRng } from '../utils/rng';

export async function registerGeneratedPassives(registerPassive: (def: any) => void) {
  // Defer loading the heavy generated passives until registration time.
  // This prevents bundling the large generated JSON into the main chunk.
  try {
    const mod: any = await import('../data/generated/passives.generated');
    const GENERATED_PASSIVES = (mod && (mod.GENERATED_PASSIVES || mod.default)) || [];

    GENERATED_PASSIVES.forEach((p: any) => {
      const defId = p.id;
      const stats = p.stats || {};

      const reg: any = {
        id: defId,
        name: p.name,
        description: p.description,
        apply: (player: any) => {
          const out = { ...player };
          out.stats = { ...(out.stats || {}) };
          if (stats.atk) out.stats.attack = (out.stats.attack || 0) + stats.atk;
          if (stats.def) out.stats.defense = (out.stats.defense || 0) + stats.def;
          if (stats.hp) { out.maxHp = (out.maxHp || 0) + stats.hp; out.hp = Math.min(out.hp || out.maxHp, out.maxHp); }
          if (stats.atkPct) {
            out._passivePct = { ...(out._passivePct || {}) };
            out._passivePct[defId] = stats.atkPct;
            out.stats.attack = Math.floor((out.stats.attack || 0) * (1 + stats.atkPct / 100));
          }

          return out;
        },
        remove: (player: any) => {
          const out = { ...player };
          out.stats = { ...(out.stats || {}) };
          if (stats.atk) out.stats.attack = (out.stats.attack || 0) - stats.atk;
          if (stats.def) out.stats.defense = (out.stats.defense || 0) - stats.def;
          if (stats.hp) { out.maxHp = (out.maxHp || 0) - stats.hp; out.hp = Math.min(out.hp || out.maxHp, out.maxHp); }
          if (stats.atkPct) {
            const prev = ((out._passivePct || {})[defId]) || 0;
            delete (out._passivePct || {})[defId];
            const factor = 1 + (prev / 100);
            out.stats.attack = Math.floor((out.stats.attack || 0) / factor);
          }
          return out;
        }
      };

      const tags = p.tags || [];
      if (tags.includes('reflect') || tags.includes('thorn')) {
        reg.onHit = ({ attacker, target: _target, damage }: any) => {
          const pct = 0.15; // 15% baseline
          const refl = Math.max(1, Math.floor(damage * pct));
          if (attacker && typeof attacker.hp === 'number') attacker.hp = Math.max(0, attacker.hp - refl);
          return;
        };
      }

      if (tags.includes('aura') || tags.includes('bleed')) {
        reg.auraTick = (player: any, _ctx?: any) => {
          if (player && typeof player.hp === 'number' && typeof player.maxHp === 'number') {
            const heal = Math.max(1, Math.floor((player.maxHp || 10) * 0.02));
            player.hp = Math.min(player.maxHp, player.hp + heal);
          }
        };
      }

      if (p.origin && p.origin.type === 'ability') {
        reg.proc = (ctx: any) => {
          try {
            const rngFn = (ctx && ctx.rng) ? ctx.rng : getRng(ctx);
            if (rngFn && typeof rngFn === 'function' ? rngFn() < 0.10 : roll() < 0.10) {
              const attacker = ctx.attacker;
              const target = ctx.target;
              if (attacker && target) {
                const extra = Math.max(1, Math.floor(((ctx.damage || 1) * 0.25)));
                target.hp = Math.max(0, target.hp - extra);
              }
            }
          } catch (e) { /* ignore */ }
        };
      }

      registerPassive(reg);
    });
  } catch (e) {
    // If generated content isn't present or fails to load, fail gracefully (no-op)
  }
}

export default true;
