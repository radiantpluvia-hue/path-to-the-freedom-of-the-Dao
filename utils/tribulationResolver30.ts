// tribulationResolver30.ts
import { GameState } from './types';

function clamp(v:number,a:number,b:number){ return Math.max(a,Math.min(b,v)); }
function sigmoid(x:number){ return 1/(1+Math.exp(-x)); }

export type Trib30Result = {
  success:boolean; chance:number; roll:number; log:string[];
  effects:{ hpDelta:number; qiDelta:number; daoHeartDelta:number; federationBreak?:boolean; rewards:string[]; flagsSet:string[]; }
};

export function computePlayerPower30(p:any){
  const level = (p.level||0)*220;
  const qi = clamp((p.qi||0)/3,0,5000);
  const dao = (p.daoHeart||0)*10;
  const blood = (p.bloodline?.pillarState==='legendary'?800:(p.bloodline?.pillarState==='pillar'?350:0));
  const seats = (p.councilSeats||0)*120;
  return level+qi+dao+blood+seats;
}

export function resolveTribulation30(gs:GameState, opts?:{seed?:number|null}):Trib30Result{
  const rand = (()=>{ let x=(opts?.seed??Date.now())>>>0; return ()=>{ x^=x<<13; x^=x>>>17; x^=x<<5; return (x>>>0)/4294967296; }; })();
  const P = computePlayerPower30(gs.player);
  const D = 2.2; // difficulty scaler
  const m_coal = gs.world.flags?.['trib30_coalition']?0.12:0;
  const m_sac = gs.world.flags?.['trib30_sacrifice']?0.18:0;
  const m_gate = gs.world.flags?.['ascension_gate_built']?0.10:0;
  const m_mark = gs.world.flags?.['silent_emperor_mark']?-0.04:0; // power with strings
  const base = sigmoid((P/(D*4200))-0.4);
  const chance = clamp(base + m_coal + m_sac + m_gate + m_mark, 0.03, 0.93);
  const roll = rand();
  const success = roll < chance;
  const log = [`P=${Math.round(P)} base=${base.toFixed(3)} mods=${(m_coal+m_sac+m_gate+m_mark).toFixed(3)} chance=${(chance*100).toFixed(1)}%`, `roll=${(roll*100).toFixed(2)} -> ${success?'SUCCESS':'FAIL'}`];

  const effects = { hpDelta:0, qiDelta:0, daoHeartDelta:0, federationBreak:false, rewards:[] as string[], flagsSet:[] as string[] };

  if (success){
    const maxHp = (gs.player.stats?.hp || 100);
    const hp = Math.round((0.18 + (1-chance)*0.22) * maxHp);
    effects.hpDelta = -hp; effects.qiDelta = -Math.min(gs.player.qi||0,600);
    gs.world.flags = gs.world.flags||{}; gs.world.flags['tribulation30_success']=true; effects.flagsSet.push('tribulation30_success');
    // Rewards: Major shard, title, and optional ascension gate ignition
    const shardId = 'shard_' + Math.random().toString(36).substr(2, 9);
    effects.rewards.push('major_realm_shard_'+shardId,'title:Stormbranded','unlock_ascension_trial');
    if (gs.world.flags['ascension_gate_built']) { gs.world.flags['ascension_gate_ignited']=true; effects.flagsSet.push('ascension_gate_ignited'); }
  } else {
    const maxHp = (gs.player.stats?.hp || 100);
    const hp = Math.round((0.55 + rand()*0.25) * maxHp);
    effects.hpDelta = -hp; effects.qiDelta = -(gs.player.qi||0); effects.daoHeartDelta = -30;
    gs.world.flags = gs.world.flags||{}; gs.world.flags['tribulation30_failed']=true; effects.flagsSet.push('tribulation30_failed');
    // Federation strain
    if (gs.world.flags['federation_forged'] && rand()<0.4){ effects.federationBreak = true; gs.world.flags['federation_forged']=false; }
  }

  // apply
  if (gs.player.stats) {
    gs.player.stats.hp = Math.max(0,(gs.player.stats.hp||0)+effects.hpDelta);
  }
  gs.player.qi = Math.max(0,(gs.player.qi||0)+effects.qiDelta);
  gs.player.daoHeart = Math.max(0,(gs.player.daoHeart||0)+effects.daoHeartDelta);

  return { success, chance, roll, log, effects };
}
