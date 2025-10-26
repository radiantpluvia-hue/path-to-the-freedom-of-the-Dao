const fs = require('fs');
const path = require('path');

const src = path.resolve(__dirname, '..', 'tests', 'public', 'assets', 'china-chinese-asian-music-346568.mp3');
const destDir = path.resolve(__dirname, '..', 'public', 'assets', 'music');
const dest = path.join(destDir, 'china-chinese-asian-music-346568.mp3');

try {
  if (!fs.existsSync(src)) {
    console.error('Source file not found:', src);
    process.exit(1);
  }
  fs.mkdirSync(destDir, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log('Copied', src, '->', dest);
} catch (e) {
  console.error('Copy failed', e);
  process.exit(1);
}
