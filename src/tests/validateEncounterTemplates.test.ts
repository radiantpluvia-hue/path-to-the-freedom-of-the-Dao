describe('Encounter templates JSON schema validation', () => {
  it('validates encounter_narratives.json against schema', () => {
    // run the node script; if it exits non-zero we'll throw
    const res = require('child_process').spawnSync('node', [require('path').resolve(__dirname, '..', '..', 'scripts', 'verify', 'validate_encounters.cjs')], { encoding: 'utf8' });
    if (res.status !== 0) {
      console.error(res.stdout);
      console.error(res.stderr);
    }
    expect(res.status).toBe(0);
  });
});
