// Side-effecting module: enriches auto-generated active abilities at runtime so they
// behave sensibly in CombatSystem without hand-editing the generated file.
// We dynamically import the generated abilities to avoid bundling the large
// generated file into the main chunk. The registration function returns a
// promise that resolves when enrichment is complete.

export async function enrichGeneratedAbilities() {
  const mod: any = await import('../data/generated/activeAbilities.generated');
  const GENERATED = (mod && (mod.default || mod)) || [];

  const xianxiaNames = [
    'Heavenly Whisper', 'Jade Mist Slash', 'Lotus Reap', 'Moonlit Thrust', 'Silkstream Crescent',
    'Azure Dragon Stroke', 'Crimson Cloud Palm', 'Verdant Gale', 'Eternal Echo', 'Riven Lotus Strike'
  ];

  const wuxiaNames = [
    'Drifting Blade', 'Iron Palm Strike', 'Wandering Wind Kick', 'Hidden Fang Thrust', 'Righteous Slash'
  ];

  for (let idx = 0; idx < GENERATED.length; idx++) {
    const a = GENERATED[idx] as any;
    const n = idx + 1;

    const isMortalLike = (a.type === 'attack' || (a.apCost || a.cost?.ap || 0) > 0);
    if (isMortalLike && (n % 5 === 0)) {
      const chosen = wuxiaNames[n % wuxiaNames.length];
      a.name = `${chosen} ${n}`;
    } else {
      const chosen = xianxiaNames[n % xianxiaNames.length];
      a.name = `${chosen} Technique ${n}`;
    }

    if (!Array.isArray(a.effects) || a.effects.length === 0) {
      a.effects = [{ type: 'damage', target: 'enemy', value: Math.max(6, (n % 12) + 4) }];
    }

    a.effects = a.effects.map((e: any) => {
      if (e.type === 'shield') {
        return { type: 'buff', stat: 'def', value: Math.max(3, Math.floor((e.value || 8) * 0.6)), duration: 2, target: e.target || 'self' };
      }
      if (e.type === 'buff' && !e.stat) {
        e.stat = (n % 2 === 0) ? 'atk' : 'def';
      }
      if (e.type === 'heal' && !e.target) e.target = 'self';
      return e;
    });

    a.mechanics = a.mechanics || [];
    if (n % 11 === 0) a.mechanics.push({ type: 'multiHit', hits: 2 });
    if (n % 13 === 0) a.mechanics.push({ type: 'chain', chainChance: 0.2 });
    if (n % 17 === 0) a.mechanics.push({ type: 'conditional', onKill: { healSelf: Math.max(3, Math.floor(n % 10)) } });

    if (typeof a.power !== 'number') a.power = a.effects && a.effects[0] ? a.effects[0].value : 5;
    if (!a.weaponType && a.name && /Blade|Sword|Strike|Slash|Thrust|Palm|Kick/i.test(a.name)) {
      a.weaponType = 'sword';
    }
  }

  return GENERATED;
}

export default true;
