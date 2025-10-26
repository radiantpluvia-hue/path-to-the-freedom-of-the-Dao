// Auto-generated active abilities (data-only)
export const GENERATED_ACTIVE_ABILITIES = (() => {
  const arr: any[] = [];
  const effectsPool = ['damage', 'heal', 'buff', 'debuff', 'shield'];

  for (let i = 1; i <= 200; i++) {
    const id = `gen_ability_${String(i).padStart(3, '0')}`;
    const name = `Echoing Art ${i}`;
    const type = i % 5 === 0 ? 'support' : i % 3 === 0 ? 'defense' : 'attack';
    const apCost = (i % 4) + 1;
    const qiCost = (i % 6 === 0) ? 5 : 0;
    const cooldown = (i % 7 === 0) ? 3 : 1;
    const effectType = effectsPool[i % effectsPool.length];
    const value = Math.max(5, Math.floor((i * 7) % 40));

    arr.push({
      id,
      name,
      description: `${name} - generated ${type} technique.`,
      type,
      apCost,
      qiCost,
      cooldown,
      effects: [{ type: effectType, target: effectType === 'heal' ? 'self' : 'enemy', value }]
    });
  }

  return arr;
})();

export default GENERATED_ACTIVE_ABILITIES;
