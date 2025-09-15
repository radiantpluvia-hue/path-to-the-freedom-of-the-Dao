import { pathToFileURL } from 'url';
const p = pathToFileURL(new URL('../.tmp_build/src/events/executors/eventExecutors_registry.js', import.meta.url).pathname).href;
console.log('trying import', p);
try{
  const mod = await import(p);
  console.log('import ok, keys:', Object.keys(mod).slice(0,10));
}catch(e){
  console.error('import failed, error:');
  console.error(e && e.stack ? e.stack : e);
  process.exit(3);
}
