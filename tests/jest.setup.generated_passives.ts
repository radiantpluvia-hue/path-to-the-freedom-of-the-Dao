// Ensure generated passives are registered before tests run.
// This file is included in jest.config.cjs via setupFilesAfterEnv.

// Use synchronous require() when possible to avoid timing issues where async imports
// complete after the Jest environment has been torn down. This setup file runs prior
// to tests and should synchronously register generated passives where possible.
const maybeLoad = () => {
  try {
    let pr: any = null;
    let reg: any = null;
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      pr = require('../src/systems/passiveRegistry');
    } catch (e) {
      pr = null;
    }
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires, global-require
      reg = require('../src/data/registry');
    } catch (e) {
      reg = null;
    }

    const doEnsure = async () => {
      if (!pr) {
        try { pr = await import('../src/systems/passiveRegistry'); } catch (e) { pr = null; }
      }
      if (!reg) {
        try { reg = await import('../src/data/registry'); } catch (e) { reg = null; }
      }

      // Prefer the explicit async loaders when available
      if (pr && typeof pr.loadGeneratedPassives === 'function') {
        await pr.loadGeneratedPassives();
      } else if (pr && typeof pr.ensureGeneratedPassives === 'function') {
        pr.ensureGeneratedPassives();
        await new Promise((res) => setTimeout(res, 50));
      }

      if (reg && typeof reg.loadGeneratedPassivesNow === 'function') {
        await reg.loadGeneratedPassivesNow();
      }
    };

    // Return a promise so Jest will wait for completion of async loaders when needed
    return doEnsure();
  } catch (err) {
    // If this fails, tests will still run and surface the error; log for diagnostics.
    // eslint-disable-next-line no-console
    console.warn('[jest.setup.generated_passives] failed to prefetch generated passives:', err);
    return Promise.resolve();
  }
};

// Jest supports asynchronous setupFilesAfterEnv returning a promise when using ts-jest.
module.exports = maybeLoad();
