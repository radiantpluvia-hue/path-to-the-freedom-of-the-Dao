const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const repoRoot = path.join(__dirname, '..', '..');
const reportsDir = path.join(repoRoot, 'reports');
if(!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

function run(cmd){
  console.log('\n> ' + cmd);
  try{
    const out = execSync(cmd, { cwd: repoRoot, stdio: 'pipe' }).toString();
    console.log(out);
    return { ok: true, out };
  }catch(e){
    console.error('Command failed:', cmd, e.status);
    return { ok: false, out: (e.stdout||e.stderr||'').toString(), status: e.status };
  }
}

const summary = { timestamp: new Date().toISOString(), steps: [] };

// 1) Ensure node build emit exists (.tmp_build) by running the node tsc emit script
summary.steps.push({ name: 'build:node', cmd: 'npm run build:node' });
summary.steps[summary.steps.length-1].result = run('npm run build:node');

// 2) Run smoke tests (compiled)
summary.steps.push({ name: 'smoke_test_compiled_cjs', cmd: 'node scripts/run_compiled_smoke_cjs.cjs' });
summary.steps[summary.steps.length-1].result = run('node scripts/run_compiled_smoke_cjs.cjs');

// 3) Run content verifiers
summary.steps.push({ name: 'verify_content', cmd: 'node scripts/verify_content.cjs' });
summary.steps[summary.steps.length-1].result = run('node scripts/verify_content.cjs');

summary.steps.push({ name: 'verify_content_extended', cmd: 'node scripts/verify_content_extended.cjs' });
summary.steps[summary.steps.length-1].result = run('node scripts/verify_content_extended.cjs');

// 4) Run the missing-unlocks report (generates JSON)
summary.steps.push({ name: 'report_missing_unlocks', cmd: 'node scripts/report_missing_unlocks.cjs' });
summary.steps[summary.steps.length-1].result = run('node scripts/report_missing_unlocks.cjs');

const outPath = path.join(reportsDir, `verify_summary_${Date.now()}.json`);
fs.writeFileSync(outPath, JSON.stringify(summary, null, 2));
console.log('\nWrote summary to', outPath);

// exit non-zero if any step failed
if(summary.steps.some(s=>!s.result.ok)) process.exit(2);
console.log('\nAll verification steps passed.');
process.exit(0);
