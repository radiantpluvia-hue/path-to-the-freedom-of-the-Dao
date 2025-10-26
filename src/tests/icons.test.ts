import { RACE_BACKGROUNDS } from '../data/raceBackgrounds';

// list of implemented icon ids from src/components/ui/Icon.tsx
const implementedIcons = new Set([
  'icon-noble',
  'icon-scholar',
  'icon-commoner',
  'icon-sect',
  'icon-infernal',
  'icon-outcast',
  'icon-woodland',
  'icon-wandering',
  'icon-dragonblood',
  'icon-dragon-scholar',
  'icon-phoenix-reborn',
  'icon-phoenix-flame',
  'icon-celestial-bureau',
  'icon-celestial-fallen',
  'icon-asura-warborn',
  'icon-asura-rage',
  'icon-asura-tactician',
  'icon-monkey-king',
  'icon-monkey-mountain',
  'icon-monkey-trickster',
  'icon-monkey-mystic',
  'icon-monkey-artisan',
  'icon-fox-nine',
  'icon-fox-city',
  'icon-qilin-auspice',
  'icon-qilin-guardian',
  'icon-qilin-blessed'
  ,
  // Additional icons added for recent races/backgrounds
  'icon-kunpeng-ocean',
  'icon-kunpeng-sky',
  'icon-heavenly-warrior',
  'icon-heavenly-noble',
  'icon-devil-shadow',
  'icon-devil-contract',
  'icon-ghost-wandering',
  'icon-ghost-ancestral',
  'icon-chelonian-longevity',
  'icon-chelonian-guardian',
  'icon-monster-chimera',
  'icon-monster-behemoth'
]);

describe('previewIcon coverage', () => {
  it('every previewIcon in data has a corresponding implemented icon', () => {
    const missing: string[] = [];
    Object.values(RACE_BACKGROUNDS).forEach((arr) => {
      arr.forEach((b) => {
        if (b.previewIcon && !implementedIcons.has(b.previewIcon)) missing.push(`${b.id}:${b.previewIcon}`);
      });
    });

    if (missing.length) {
      throw new Error('Missing icon implementations for: ' + missing.join(', '));
    }
  });
});
