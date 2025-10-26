#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

function randChoice(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function slug(n){ return n.toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_+|_+$/g,''); }

const argv = require('minimist')(process.argv.slice(2));
const count = Number(argv.count || argv.c || 200);
const outJson = argv.out || 'sandbox_large_events.json';
const outExec = argv.exec || 'src/events/executors/eventExecutors_sandbox_large.ts';

const titles = [
  'Hidden Shrine', 'Wandering Merchant', 'Abandoned Ruins', 'Misty Pass', 'Secret Lesson', 'Rival Encounter',
  'Strange Artifact', 'Hermit Offer', 'Trial of Spirit', 'Bloodline Echo', 'Heavenly Sign', 'Market Brawl', 'Lost Manual',
  'Minor Sect Event', 'Spirit Beast Hunt', 'Moonlit Meditation', 'Training Montage', 'Fateful Meeting', 'Broken Sword', 'Old Friend'
];

const descriptions = [
  'A faint hum of spiritual energy can be heard.',
  'An opportunity that could change your path appears.',
  'Danger and reward entwine in equal measure.',
  'A quiet moment of insight reveals itself.',
  'This could lead to a long and winding journey.'
];

const events = [];

for(let i=1;i<=count;i++){
  const id = `sandbox_large_e${String(i).padStart(4,'0')}`;
  const title = randChoice(titles) + ' ' + i;
  const desc = randChoice(descriptions);
  // decide branching: 60% single, 30% fork, 10% terminal
  const r = Math.random();
  let choices = [];
  if(r < 0.1){ // terminal
    choices = [{ id: 'continue', text: 'Continue wandering', next: null }];
  } else if(r < 0.4){ // fork
    const a = `sandbox_large_e${String(Math.max(1,i+Math.floor(Math.random()*6)-3)).padStart(4,'0')}`;
    const b = `sandbox_large_e${String(Math.max(1,i+Math.floor(Math.random()*12)-2)).padStart(4,'0')}`;
    choices = [{ id: 'a', text: 'Take path A', next: a }, { id: 'b', text: 'Take path B', next: b }];
  } else {
    const next = `sandbox_large_e${String(Math.max(1,i+Math.floor(Math.random()*8)+1)).padStart(4,'0')}`;
    choices = [{ id: 'next', text: 'Proceed', next }];
  }
  events.push({ id, title, description: desc, choices, executorId: `fn_${id}` });
}

// Emit JSON
fs.writeFileSync(path.join(process.cwd(), outJson), JSON.stringify(events, null, 2), 'utf8');

// Emit executor TS file
const execEntries = events.map(e => `  'fn_${e.id}': (state:any, choice?:any) => { state = {...state}; state.eventLog = state.eventLog||[]; state.eventLog.push({id:'fn_${e.id}', choice}); return state; }`).join(',\n');
const execFile = `import { EventExecutor } from '../../../utils/types';\n\nexport const sandboxLargeEventExecutors: Record<string, EventExecutor> = {\n${execEntries}\n};\n\nexport default sandboxLargeEventExecutors;\n`;
fs.mkdirSync(path.dirname(outExec), { recursive: true });
fs.writeFileSync(path.join(process.cwd(), outExec), execFile, 'utf8');

console.log('Generated', count, 'events ->', outJson);
console.log('Wrote executors ->', outExec);
