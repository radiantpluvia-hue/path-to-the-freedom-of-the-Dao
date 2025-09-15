try{
  const reg = require('../.tmp_build/src/events/executors/eventExecutors_registry.cjs');
  console.log('loaded registry keys:', Object.keys(reg).slice(0,10));
}catch(e){ console.error('require error:', e && e.message); process.exit(3);}