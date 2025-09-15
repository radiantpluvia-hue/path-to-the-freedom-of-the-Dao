import * as codexMod from '@/data/codexEntries';
import * as taiMod from '@/data/taiYungLore';
const codex: any = (codexMod as any) && ((codexMod as any).default || codexMod);
const tai: any = (taiMod as any) && ((taiMod as any).default || taiMod);

test('codex and taiYungLore presence', () => {
  expect(codex).toBeDefined();
  expect(tai).toBeDefined();
  expect(Array.isArray(codex) || typeof codex === 'object').toBeTruthy();
});
