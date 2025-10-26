import fs from 'fs';
import path from 'path';

export async function saveDraft(seed: any, kind: string, options?: { overwrite?: boolean }) {
  const draftsDir = path.resolve(process.cwd(), 'data', 'drafts');
  if (!fs.existsSync(draftsDir)) fs.mkdirSync(draftsDir, { recursive: true });

  const filename = `${kind}_${seed.id || seed.name || 'unnamed'}.json`;
  const filePath = path.join(draftsDir, filename);
  if (fs.existsSync(filePath) && !options?.overwrite) {
    // avoid overwriting
    throw new Error('Draft already exists: ' + filePath);
  }

  await fs.promises.writeFile(filePath, JSON.stringify(seed, null, 2), 'utf-8');
  return filePath;
}

export default saveDraft;
