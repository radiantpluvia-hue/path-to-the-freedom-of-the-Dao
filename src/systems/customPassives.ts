import { registerPassive, getPassive } from './passiveRegistry';
import { safeInc, applyStatDeltas, revertStatDeltas, addHook, removeHook, devSafe } from './passiveHelpers';

// Register specific crafted passives for newly named skills
try {
  registerPassive({
    id: 'heaven_splitter',
    name: 'Rift-Cleaver of Celestial Tide',
    description: 'A sword technique that rends the heavens and fractures fate; strikes with thunderlike finality.',
    apply: (player: any) => {
      const out = { ...player } as any;
      out.stats = { ...(out.stats || {}) };
  // helper APIs will create _autoApplied and _passiveHooks as needed

      // Apply stat deltas + persistent penalty metadata idempotently
      applyStatDeltas(out, 'heaven_splitter', { atk: 6, hsPenalty: 2 });
      // consume the small initial qi cost now
      out.qi = Math.max(0, (out.qi || 0) - 2);

      // Hooks must operate on runtime ctx.player and not close over `out`.
      const onEnter = (ctx: any) => {
        try {
          const p = ctx.player || ctx;
          p._autoApplied = p._autoApplied || {};
          p._autoApplied.heaven_splitter = p._autoApplied.heaven_splitter || { atk: 6, hsPenalty: 2 };
          p._autoApplied.heaven_splitter.nextEmpowered = true;
        } catch (e) { /* dev-safe */ }
      };

      const onDealDamage = (ctx: any) => {
        try {
          const p = ctx.player || ctx;
          const meta = (p._autoApplied && p._autoApplied.heaven_splitter) || null;
          if (!meta || !meta.nextEmpowered) return;
          meta.nextEmpowered = false; // consume
          ctx.modifiers = ctx.modifiers || {};
          ctx.modifiers.critChance = (ctx.modifiers.critChance || 0) + 0.45;
          ctx.modifiers.critDamage = (ctx.modifiers.critDamage || 0) + 1.0;
          // cost: additional qi drain on trigger
          p.qi = Math.max(0, (p.qi || 0) - 25);
        } catch (e) { /* dev-safe */ }
      };

      // Use helper to attach runtime hooks (deduped) and wrap with devSafe
      addHook(out, 'onEnterCombat', 'heaven_splitter', devSafe(onEnter));
      addHook(out, 'onDealDamage', 'heaven_splitter', devSafe(onDealDamage));

      return out;
    },
    remove: (player: any) => {
      const out = { ...player } as any;
      out.stats = { ...(out.stats || {}) };
      // Revert stat deltas recorded under _autoApplied
      revertStatDeltas(out, 'heaven_splitter');
      // restore qi penalty if present
      const pen = (out as any)._autoApplied && (out as any)._autoApplied.heaven_splitter && (out as any)._autoApplied.heaven_splitter.hsPenalty;
      if (pen) out.qi = Math.min((out.qi || 0) + pen, (out.maxQi || Infinity));
      // remove runtime hooks
      removeHook(out, 'onEnterCombat', 'heaven_splitter');
      removeHook(out, 'onDealDamage', 'heaven_splitter');
      return out;
    }
  });

  registerPassive({
    id: 'void_dragon_saber',
    name: 'Void-Dragon Saber',
    description: 'A saber form that channels the cold hunger of the void; cleaves through spirit and matter alike.',
    apply: (player: any) => {
      const out = { ...player };
      out.stats = { ...(out.stats || {}) };
      // moderate attack and a proc that damages attackers on hit
      applyStatDeltas(out, 'void_dragon_saber', { atk: 4 });
      // attach onHit that wounds the attacker by a small percent
      const onHit = ({ attacker, damage }: any) => {
        try {
          if (attacker && typeof attacker.hp === 'number') {
            const refl = Math.max(1, Math.floor((damage || 1) * 0.12));
            attacker.hp = Math.max(0, attacker.hp - refl);
          }
        } catch (e) { /* ignore */ }
      };
      addHook(out, 'onHit', 'void_dragon_saber', devSafe(onHit));
      return out;
    },
    remove: (player: any) => {
      const out = { ...player };
      out.stats = { ...(out.stats || {}) };
      // revert applied deltas and remove runtime hook
      revertStatDeltas(out, 'void_dragon_saber');
      removeHook(out, 'onHit', 'void_dragon_saber');
      return out;
    },
    onHit: undefined
  });

  registerPassive({
    id: 'phoenix_rebirth_aura_custom',
    name: 'Phoenix Rebirth Aura (Custom)',
    description: 'A custom stronger rebirth aura for playtesting; heals and restores qi over time.',
    apply: (player: any) => {
      const out = { ...player };
      const aura = (pl: any) => {
        try {
          const max = pl.maxHp || 100;
          pl.hp = Math.min(max, (pl.hp || 0) + 5);
          pl.qi = Math.min((pl.qi || 0) + 4, (pl.maxQi || Infinity));
        } catch (e) { /* ignore */ }
      };
      // record serializable metadata and attach runtime hook
      applyStatDeltas(out, 'phoenix_rebirth_aura_custom', { heal: 5, qi: 4 });
      addHook(out, 'auraTick', 'phoenix_rebirth_aura_custom', devSafe(aura));
      return out;
    },
    remove: (player: any) => {
      const out = { ...player };
      // revert stored metadata and remove runtime hook
      revertStatDeltas(out, 'phoenix_rebirth_aura_custom');
      removeHook(out, 'auraTick', 'phoenix_rebirth_aura_custom');
      return out;
    },
    auraTick: undefined
  });

} catch (e) {
  // if passive registry isn't available, skip gracefully
}

export default true;

// Ensure every skill entry has a runtime passive implementation.
// Tier-driven defaults: S (strongest): atk+5/def+3 + auraTick; A: atk+3/def+1; B: def+2; C: def+1 (weakest manuals)
try {
  // Use require to avoid TS JSON import constraints at runtime
  // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
  const SKILLS: any[] = require('../data/skills/all_skills.json');
  SKILLS.forEach((s: any) => {
    const id = s && s.id;
    if (!id) return;
    if (getPassive(id)) return; // don't overwrite existing handcrafted passives

    const tier = ((s && s.tier) || 'C').toUpperCase();
    const name = (s && s.name) || id;
    const description = (s && s.description) || '';

    if (tier === 'S') {
      registerPassive({
        id,
        name,
        description,
        apply: (player: any) => {
          const out = { ...player } as any;
          out.stats = { ...(out.stats || {}) };

          applyStatDeltas(out, id, { atk: 5, def: 3, cultivationSpeed: 0.90 });

          // attach aura tick: restore small qi each tick
          const aura = (pl: any) => { try { pl.qi = Math.min((pl.qi || 0) + 2, (pl.maxQi || Infinity)); } catch (e) { /* dev-safe */ } };
          addHook(out, 'auraTick', id, devSafe(aura));

          return out;
        },
        remove: (player: any) => {
          const out = { ...player } as any;
          // revert deltas
          revertStatDeltas(out, id);
          // remove aura hook
          removeHook(out, 'auraTick', id);
          return out;
        }
      });
      return;
    }

    if (tier === 'A') {
      registerPassive({
        id,
        name,
        description,
        apply: (player: any) => {
          const out = { ...player };
          out.stats = { ...(out.stats || {}) };
          // record and apply deltas idempotently
          applyStatDeltas(out, id, { atk: 3, def: 1, cultivationSpeed: 0.30 });
          return out;
        },
        remove: (player: any) => {
          const out = { ...player } as any;
          // revert deltas and remove stored metadata
          revertStatDeltas(out, id);
          return out;
        }
      });
      return;
    }

    if (tier === 'B') {
      registerPassive({
        id,
        name,
        description,
        apply: (player: any) => {
          const out = { ...player };
          out.stats = { ...(out.stats || {}) };
          applyStatDeltas(out, id, { def: 2, cultivationSpeed: 0.12 });
          return out;
        },
        remove: (player: any) => {
          const out = { ...player } as any;
          revertStatDeltas(out, id);
          return out;
        }
      });
      return;
    }

    // default C-tier
    registerPassive({
      id,
      name,
      description,
      apply: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        applyStatDeltas(out, id, { def: 1, cultivationSpeed: 0.05 });
        return out;
      },
      remove: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        revertStatDeltas(out, id);
        return out;
      }
    });
  });
} catch (e) {
  // graceful fallback if JSON can't be loaded
}

// Additional generated registrations (tier-driven)
try {
  // A-tier examples: moderate bonuses or simple hooks
  registerPassive({
    id: 'heavenly_fist_of_millennia',
    name: 'Millennia Heavenly Fist',
    description: 'Hundreds of years of condensed technique made into a single palm — a crushing truth disguised as an embrace.',
    apply: (player: any) => {
      const out = { ...player } as any;
      out.stats = { ...(out.stats || {}) };
      applyStatDeltas(out, 'heavenly_fist_of_millennia', { atk: 4, def: 2 });
      return out;
    },
    remove: (player: any) => {
      const out = { ...player } as any;
      revertStatDeltas(out, 'heavenly_fist_of_millennia');
      return out;
    }
  });

  registerPassive({
    id: 'swiftwind_strike',
    name: 'Swiftwind Gale Strike',
    description: 'A blade of wind that leaves no echo; grants sudden, decisive strikes and fleeting mobility.',
    apply: (player: any) => {
      const out = { ...player } as any;
      out.stats = { ...(out.stats || {}) };
      applyStatDeltas(out, 'swiftwind_strike', { speed: 4, atk: 2 });
      return out;
    },
    remove: (player: any) => {
      const out = { ...player } as any;
      revertStatDeltas(out, 'swiftwind_strike');
      return out;
    }
  });

  registerPassive({
    id: 'starfall_sword_dance',
    name: 'Starfall Sword Dance',
    description: 'A graceful barrage of blades like falling stars; excels at overwhelming multiple foes.',
    apply: (player: any) => {
      const out = { ...player } as any;
      out.stats = { ...(out.stats || {}) };
      applyStatDeltas(out, 'starfall_sword_dance', { atk: 3 });
      return out;
    },
    remove: (player: any) => {
      const out = { ...player } as any;
      revertStatDeltas(out, 'starfall_sword_dance');
      return out;
    }
  });

  // B-tier: modest stat tweaks
  const bTier = [
    'purifying_sutra', 'tenacious_guard', 'iron_skin', 'southern_academy_skill_4', 'sword_hall_skill_3', 'weapon_clanblade_ashen', 'weapon_clanstaff_yun', 'weapon_clanbow_wind', 'weapon_clanwhip_lotus', 'weapon_clandagger_shade', 'weapon_clanaxe_boulder', 'weapon_clanhammer_gale', 'mutra_gale_hand_sutra', 'sutra_silverscribe_breath', 'sutra_tidebinder_verse', 'sutra_moonfall_chant', 'mutra_serpent_twine', 'mutra_windvein_sutra', 'mutra_hollow_palm_sutra', 'mutra_echoing_braid'
  ];
  bTier.forEach((id) => {
    registerPassive({
      id,
      name: (id === 'purifying_sutra') ? 'Sutra of Purging Dawn' : undefined,
      description: '',
      apply: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        applyStatDeltas(out, id, { def: 2 });
        return out;
      },
      remove: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        revertStatDeltas(out, id);
        return out;
      }
    });
  });

  // C-tier: minor bonuses
  const cTier = ['iron_mountain_skill_2', 'sect_generic_0', 'nomad_clans_tactic_0', 'monastic_temple_skill_1', 'weapon_clanknife_huos', 'weapon_clanshield_vigil', 'weapon_clanfan_mirth', 'mutra_echoing_braid'];
  cTier.forEach(id => {
    registerPassive({
      id,
      apply: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        applyStatDeltas(out, id, { def: 1 });
        return out;
      },
      remove: (player: any) => {
        const out = { ...player };
        out.stats = { ...(out.stats || {}) };
        revertStatDeltas(out, id);
        return out;
      }
    });
  });

  // S-tier extras
  registerPassive({
    id: 'eternal_spirit_18',
    name: 'Eternal-Spirit Chant XVIII',
  description: "An exalted incantation that harmonizes the spirit to the world's deeper rhythms.",
    apply: (player: any) => {
      const out = { ...player } as any;
      out.stats = { ...(out.stats || {}) };
  // helper APIs will create _autoApplied and _passiveHooks as needed

      applyStatDeltas(out, 'eternal_spirit_18', { atk: 5, def: 3 });

  const aura = (pl: any) => { try { pl.qi = Math.min((pl.qi || 0) + 3, (pl.maxQi || Infinity)); pl.insight = (pl.insight || 0) + 1; } catch (e) { /* dev-safe */ } };
  const onExplore = (ctx: any) => { try { const p = ctx.player || ctx; p.insight = (p.insight || 0) + 2; } catch (e) { /* dev-safe */ } };

      addHook(out, 'auraTick', 'eternal_spirit_18', devSafe(aura));
      addHook(out, 'onExplore', 'eternal_spirit_18', devSafe(onExplore));

      return out;
    },
    remove: (player: any) => {
      const out = { ...player } as any;
      revertStatDeltas(out, 'eternal_spirit_18');
      removeHook(out, 'auraTick', 'eternal_spirit_18');
      removeHook(out, 'onExplore', 'eternal_spirit_18');
      return out;
    }
  });

  registerPassive({
    id: 'immortal_necrosis_poison',
    name: 'Necrotic Tongue of the Immortals',
    description: 'A venom refined to corrupt mortal vitality and linger in the soul if untreated.',
    apply: (player: any) => {
      const out = { ...player };
      // attaches a proc that deals lingering damage to enemies when they hit
      const proc = (ctx: any) => {
        try {
          const target = ctx.target;
          if (target && typeof target.hp === 'number') {
            target.hp = Math.max(0, target.hp - 2);
          }
  } catch (e) { /* dev-safe */ }
      };
      // attach runtime hook and record simple metadata
      applyStatDeltas(out, 'immortal_necrosis_poison', { dot: 2 });
      addHook(out, 'proc', 'immortal_necrosis_poison', devSafe(proc));
      return out;
    },
    remove: (player: any) => {
      const out = { ...player };
      // revert recorded metadata and remove runtime hook
      revertStatDeltas(out, 'immortal_necrosis_poison');
      removeHook(out, 'proc', 'immortal_necrosis_poison');
      return out;
    }
  });

  registerPassive({
    id: 'soul_shackle',
    name: 'Soul-Shackle Bind',
    description: "A metaphysical restraint that clamps spirit flow and weakens foes' cultivations.",
    apply: (player: any) => {
      const out = { ...player } as any;
  // helper APIs will create _autoApplied and _passiveHooks as needed

      const onHit = ({ attacker }: any) => {
        try {
          if (attacker && attacker.stats) {
            attacker.stats.atk = Math.max(0, (attacker.stats.atk || 0) - 2);
            attacker.stats.cultivationPower = Math.max(0, (attacker.stats.cultivationPower || 0) - 3);
            // record a stacks counter in attacker's serializable metadata instead of ad-hoc field
            try { safeInc(attacker, ['_autoApplied', 'soul_shackle', 'stacks'], 1); } catch (e) { /* dev-safe */ }
          }
        } catch (e) { /* dev-safe */ }
      };

      addHook(out, 'onHit', 'soul_shackle', devSafe(onHit));
      applyStatDeltas(out, 'soul_shackle', { applied: 1 });
      return out;
    },
    remove: (player: any) => {
      const out = { ...player } as any;
      removeHook(out, 'onHit', 'soul_shackle');
      revertStatDeltas(out, 'soul_shackle');
      return out;
    }
  });

  } catch (e) {
  // ignore
}
