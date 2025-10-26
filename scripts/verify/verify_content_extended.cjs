const { execSync } = require('child_process');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..');

function run(cmd) {
  console.log('> ' + cmd);
  try {
    const out = execSync(cmd, { cwd: repoRoot, stdio: 'inherit' });
    return { ok: true };
  } catch (e) {
    console.error('Command failed:', cmd, e.status);
    return { ok: false, status: e.status };
  }
}

// Run our icons verification script
const res = run('node scripts/verify/run_icons.cjs');
if (!res.ok) process.exit(1);
console.log('verify_content_extended: icons check passed.');

// Run game data validation
const res2 = run('node scripts/verify/validate_game_data.cjs');
if (!res2.ok) process.exit(1);
console.log('verify_content_extended: game data check passed.');

process.exit(0);
