import { validateSeed } from '@/utils/seedValidator';
import { saveDraft } from '@/utils/draftSaver';
import fs from 'fs';
import path from 'path';

describe('seed validator + draft saver', () => {
  const tmpDir = path.resolve(process.cwd(), 'data', 'drafts');
  beforeAll(() => {
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
  });
  afterAll(() => {
    // cleanup created drafts
    try {
      const files = fs.readdirSync(tmpDir);
      for (const f of files) fs.unlinkSync(path.join(tmpDir, f));
    } catch (e) {}
  });

  it('validates a good item seed', () => {
    const item = { id: 'i1', name: 'Iron Sword', rarity: 'common', description: 'Sharp' };
    const errs = validateSeed(item, 'items');
    expect(errs.length).toBe(0);
  });

  it('rejects a bad item seed', () => {
    const item = { name: 'NoId' };
    const errs = validateSeed(item, 'items');
    expect(errs.length).toBeGreaterThan(0);
  });

  it('saves a draft file', async () => {
    const item = { id: 'i2', name: 'Draft Sword', rarity: 'uncommon' };
    const p = await saveDraft(item, 'items', { overwrite: true });
    expect(fs.existsSync(p)).toBe(true);
    const content = JSON.parse(fs.readFileSync(p, 'utf-8'));
    expect(content.id).toBe('i2');
  });
});
