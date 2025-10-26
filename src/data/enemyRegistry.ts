import enemiesData from '../../data/enemies.json';
import { choice } from '../utils/rng';

export interface EnemyDef {
  id: string;
  name: string;
  hp: number;
  attack: number;
  defense: number;
  xpReward: number;
  tags: string[];
  description: string;
}

const ENEMIES: EnemyDef[] = (enemiesData as EnemyDef[]);

export function getEnemyById(id: string): EnemyDef | undefined {
  return ENEMIES.find(e => e.id === id);
}

export function getRandomEnemyForAct(act: number): EnemyDef | undefined {
  // Very simple selection: pick by act-based thresholds or random
  const pool = ENEMIES.filter(e => {
    if (act <= 1) return e.xpReward <= 20;
    if (act <= 3) return e.xpReward <= 50;
    if (act <= 5) return e.xpReward <= 150;
    return true;
  });
  if (pool.length === 0) return choice(ENEMIES);
  return choice(pool);
}

export function listAllEnemies(): EnemyDef[] { return [...ENEMIES]; }
