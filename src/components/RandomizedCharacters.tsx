import React from 'react';
import { CULTIVATION_REALMS } from '../data/cultivationRealms';
import './RandomizedCharacters.css';

interface Props {
  strength: number; // numeric proxy for faction/sect power
  size?: number; // number of characters to show
  seed?: number | string; // optional seed for deterministic lists
}

// small seeded RNG (mulberry32)
function makeRng(seed: number) {
  let t = seed >>> 0;
  return function() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

const syllables = ['an', 'li', 'wei', 'shen', 'xiao', 'yu', 'zheng', 'hao', 'ming', 'feng', 'rui', 'lei', 'chen', 'bo', 'qiu'];

function makeName(rng: () => number) {
  const parts = 2 + Math.floor(rng() * 2);
  let name = '';
  for (let i = 0; i < parts; i++) name += syllables[Math.floor(rng() * syllables.length)];
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function realmIndexFromStrength(strength: number) {
  // Clamp and normalize an unknown-range strength into [0,1]
  // Assume typical strength around -100..200; map to [0,1]
  const clamped = Math.max(-150, Math.min(300, strength));
  const norm = (clamped + 150) / 450; // 0..1
  const max = Object.keys(CULTIVATION_REALMS).length - 1;
  return Math.round(norm * max);
}

export default function RandomizedCharacters({ strength, size = 6, seed }: Props) {
  const seedNum = typeof seed === 'number' ? seed : (typeof seed === 'string' ? [...seed].reduce((s, c) => s + c.charCodeAt(0), 0) : Math.floor((strength + 12345) * 997));
  const rng = makeRng(seedNum);
  const baseRealmIdx = realmIndexFromStrength(strength);

  const chars = Array.from({ length: size }).map(() => {
    const jitter = Math.floor((rng() - 0.5) * 3); // -1..+1 roughly
    const idx = Math.max(0, Math.min(Object.keys(CULTIVATION_REALMS).length - 1, baseRealmIdx + jitter));
    const realmKeys = Object.keys(CULTIVATION_REALMS);
    const realmKey = realmKeys[idx];
    return {
      name: makeName(rng),
      realmKey,
      power: Math.max(1, Math.round((idx + 1) * (1 + rng() * 0.4)))
    };
  });

  return (
    <div className="randomized-characters">
      {chars.map((c, i) => (
        <div className="rc-item" key={`${c.name}-${i}`}>
          <div className="rc-avatar">{c.name.charAt(0)}</div>
          <div className="rc-info">
            <div className="rc-name">{c.name}</div>
            <div className="rc-meta">{CULTIVATION_REALMS[c.realmKey]?.name || c.realmKey} • Power {c.power}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
