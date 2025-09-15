import enemiesData from '../../data/enemies.json';

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
  if (pool.length === 0) return ENEMIES[Math.floor(Math.random() * ENEMIES.length)];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function listAllEnemies(): EnemyDef[] { return [...ENEMIES]; }
