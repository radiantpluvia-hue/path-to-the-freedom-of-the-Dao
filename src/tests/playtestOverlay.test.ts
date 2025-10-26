import { GENERATED_PASSIVES } from '../data/generated/passives.generated';
import { applyPassiveToPlayer } from '../systems/passiveRegistry';

describe('Playtest overlay grant behavior', () => {
  test('grantSamplePassives applies generated passives to a player', () => {
    const player: any = { id: 'player', stats: { attack: 10, defense: 5 }, maxHp: 100, hp: 100 };
    const list = GENERATED_PASSIVES.slice(0, 20);
    expect(list.length).toBeGreaterThan(0);

    const chosen = [list[0], list[1]];
    let p = { ...player };
    chosen.forEach(c => { p = applyPassiveToPlayer(p, c.id); });

    // At least one numeric stat should have changed on p compared to base player
    const changed = (p.stats.attack !== player.stats.attack) || (p.stats.defense !== player.stats.defense) || (p.maxHp !== player.maxHp);
    expect(changed).toBe(true);
  });
});
