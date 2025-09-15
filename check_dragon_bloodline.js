import { ALL_BLOODLINES } from './src/data/xianxiaIntegration';

const dragonBloodline = ALL_BLOODLINES.find(b => b.name.toLowerCase().includes('dragon'));
if (dragonBloodline) {
  console.log('Dragon bloodline found:', dragonBloodline.name);
  console.log('Special effects:', dragonBloodline.effects.special);
} else {
  console.log('No dragon bloodline found');
}
