// File: src/ui/HeavenlyStele.tsx
import React, { useMemo, useState } from 'react';
import type { HeavenlyRankingSeason, HeavenlyRankEntry } from '../types/heavenly';

// Props: season (nullable) and onClose
export default function HeavenlyStele({ season, onClose }: { season?: HeavenlyRankingSeason | null; onClose?: () => void; }) {
  const [tab, setTab] = useState<'overall' | 'power' | 'providence' | 'karma'>('overall');
  if (!season) {
    return (
      <div className="p-4 rounded-2xl shadow-lg bg-white">
        <h2 className="text-lg font-bold">Heavenly Dao Rankings</h2>
        <p className="text-sm mt-2">No active season.</p>
      </div>
    );
  }

  const entries = useMemo(() => {
    switch (tab) {
      case 'power':
        return [...season.entries].sort((a, b) => b.powerScore - a.powerScore);
      case 'providence':
        return [...season.entries].sort((a, b) => b.providenceScore - a.providenceScore);
      case 'karma':
        return [...season.entries].sort((a, b) => b.karmaScore - a.karmaScore);
      default:
        return season.entries;
    }
  }, [season, tab]);

  return (
    <div className="p-4 rounded-2xl shadow-2xl bg-gradient-to-br from-white to-slate-50 max-w-4xl">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-xl font-extrabold">Heavenly Dao Rankings</h1>
          <div className="text-xs text-slate-600">Season {season.seasonId} — {new Date(season.publishedAt ?? Date.now()).toDateString()}</div>
        </div>
        <div>
          <button className="px-3 py-1 rounded-md border" onClick={onClose}>Close</button>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <button onClick={() => setTab('overall')} className={`px-2 py-1 rounded ${tab === 'overall' ? 'bg-slate-100' : ''}`}>Overall</button>
        <button onClick={() => setTab('power')} className={`px-2 py-1 rounded ${tab === 'power' ? 'bg-slate-100' : ''}`}>Power</button>
        <button onClick={() => setTab('providence')} className={`px-2 py-1 rounded ${tab === 'providence' ? 'bg-slate-100' : ''}`}>Providence</button>
        <button onClick={() => setTab('karma')} className={`px-2 py-1 rounded ${tab === 'karma' ? 'bg-slate-100' : ''}`}>Karma</button>
      </div>

      <div className="mt-4 overflow-auto max-h-[60vh]">
        <table className="w-full table-auto text-sm">
          <thead className="sticky top-0 bg-white">
            <tr>
              <th className="text-left p-2">#</th>
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Type</th>
              <th className="text-left p-2">Realm</th>
              <th className="text-right p-2">Power</th>
              <th className="text-right p-2">Providence</th>
              <th className="text-right p-2">Karma</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e: HeavenlyRankEntry, i: number) => (
              <tr key={e.id} className="hover:bg-slate-100 border-b">
                <td className="p-2">{i + 1}</td>
                <td className="p-2">{e.name}</td>
                <td className="p-2">{e.type}</td>
                <td className="p-2">{e.realm}</td>
                <td className="p-2 text-right">{formatScore(e.powerScore)}</td>
                <td className="p-2 text-right">{formatScore(e.providenceScore)}</td>
                <td className="p-2 text-right">{formatScore(e.karmaScore)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatScore(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(2) + 'k';
  return Math.round(n * 100) / 100;
}
