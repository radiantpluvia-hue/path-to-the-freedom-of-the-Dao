(async () => {
  try {
    const pr = await import('../src/systems/passiveRegistry.js');
    const reg = await import('../src/data/registry.js');
    const gp = await import('../src/data/generated/passives.generated.js');
    console.log('GENERATED_PASSIVES length=', gp.GENERATED_PASSIVES && gp.GENERATED_PASSIVES.length);
    if (pr && typeof pr.loadGeneratedPassives === 'function') {
      await pr.loadGeneratedPassives();
      console.log('passiveRegistry.loadGeneratedPassives called');
    }
    if (reg && typeof reg.loadGeneratedPassivesNow === 'function') {
      await reg.loadGeneratedPassivesNow();
      console.log('registry.loadGeneratedPassivesNow called');
    }
    const sample = gp.GENERATED_PASSIVES[0];
    console.log('sample id', sample && sample.id);
    console.log('Registry.getPassiveById sample ->', reg.getPassiveById(sample.id));
  } catch (e) {
    console.error('debug load failed', e);
  }
})();
