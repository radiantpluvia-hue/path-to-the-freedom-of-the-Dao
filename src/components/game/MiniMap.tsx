import React, { useMemo, useState } from 'react';
import type { TerritoryState } from '../../types';

// MiniMap supports optional normalized positions (0..1) or absolute pixel positions.
// If positions are not provided the map will auto-layout territories into a grid.
export default function MiniMap({ territories, positions, width = 300, height = 200, onSelect, selected }: {
  territories: Record<string, TerritoryState> | undefined;
  // positions[id] = { x: number, y: number } where x/y are either normalized [0..1] or absolute pixels.
  positions?: Record<string, { x: number; y: number }>;
  width?: number;
  height?: number;
  onSelect?: (id: string | null) => void;
  selected?: string | null;
}) {
  const tKeys = territories ? Object.keys(territories) : [];
  const [hover, setHover] = useState<{ id: string; x: number; y: number } | null>(null);

  // Layout: if positions provided, convert normalized positions (0..1) to pixels.
  const resolvedPositions = useMemo(() => {
    const out: Record<string, { x: number; y: number }> = {};
    if (!tKeys.length) return out;
    const cols = Math.ceil(Math.sqrt(Math.max(1, tKeys.length)));
    const cellW = width / Math.max(1, cols);
    const rows = Math.ceil(tKeys.length / cols);
    const cellH = height / Math.max(1, rows);

    tKeys.forEach((id, i) => {
      const p = positions && positions[id];
      if (p && typeof p.x === 'number' && typeof p.y === 'number') {
        // treat as normalized if within 0..1, else absolute
        const rx = p.x >= 0 && p.x <= 1 ? p.x * width : p.x;
        const ry = p.y >= 0 && p.y <= 1 ? p.y * height : p.y;
        out[id] = { x: Math.max(4, Math.min(width - 40, rx)), y: Math.max(4, Math.min(height - 30, ry)) };
      } else {
        const col = i % cols;
        const row = Math.floor(i / cols);
        out[id] = { x: col * cellW + 8, y: row * cellH + 8 };
      }
    });
    return out;
  }, [tKeys.join(','), positions, width, height]);

  const getColorForTerritory = (t: TerritoryState | undefined) => {
    if (!t) return '#222';
    if (t.ownerFactionId) return '#2b7aef';
    // compute influence heat: max faction influence
    const max = Math.max(...Object.values(t.influence || { 0: 0 }));
    const heat = Math.min(1, max / 100);
    const g = Math.round(240 - 160 * heat);
    return `rgb(${g},${200 - Math.round(160 * heat)},${g + 20})`;
  };

  // helper color per factionId
  const colorForFaction = (fid: string) => {
    const h = (fid.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 360);
    return `hsl(${h} 70% 60%)`;
  };

  // Build neighbor links list
  const links = useMemo(() => {
    const out: Array<{ a: string; b: string }> = [];
    if (!territories) return out;
    for (const id of Object.keys(territories)) {
      const t = territories[id];
      if (!t || !t.neighbors) continue;
      for (const n of t.neighbors) {
        if (territories[n]) {
          // ensure each pair once (a<b)
          if (!out.find(l => (l.a === id && l.b === n) || (l.a === n && l.b === id))) out.push({ a: id, b: n });
        }
      }
    }
    return out;
  }, [territories]);

    return (
      <div style={{ position: 'relative', width, height }}>
      <svg width={width} height={height} style={{ border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, background: 'var(--dark)' }}>
        {/* neighbor links */}
        {links.map((l, i) => {
          const pa = resolvedPositions[l.a];
          const pb = resolvedPositions[l.b];
          if (!pa || !pb) return null;
          return <line key={`link-${i}`} x1={pa.x + 20} y1={pa.y + 12} x2={pb.x + 20} y2={pb.y + 12} stroke={'rgba(255,255,255,0.04)'} strokeWidth={1} />;
        })}

  {tKeys.map((id) => {
          const p = resolvedPositions[id];
          if (!p) return null;
          const w = 120; const h = 44;
          const territory = territories ? territories[id] : undefined;
          const fill = getColorForTerritory(territory);
          const isSelected = selected === id;

          // compute stacked influence bars
          const influences = territory ? Object.entries(territory.influence || {}) : [];
          const totalInf = influences.reduce((s, [, v]) => s + (v as number), 0) || 1;

          return (
            <g key={id} transform={`translate(${p.x},${p.y})`} style={{ cursor: 'pointer' }} onClick={() => onSelect && onSelect(id)} onMouseEnter={() => setHover({ id, x: p.x, y: p.y })} onMouseLeave={() => setHover(null)}>
              <rect x={0} y={0} width={w} height={h} rx={8} ry={8} fill={fill} stroke={isSelected ? 'gold' : 'rgba(255,255,255,0.06)'} strokeWidth={isSelected ? 2 : 1} />
              <text x={8} y={14} fontSize={12} fill="#fff">{id}</text>
              <text x={8} y={28} fontSize={10} fill="#ddd">Owner: {territory?.ownerFactionId || 'None'}</text>

              {/* garrison bar (right side) */}
              {territory?.garrison && (
                <g transform={`translate(${w - 34},6)`}>
                  <rect x={0} y={0} width={24} height={10} rx={3} fill={'rgba(0,0,0,0.25)'} />
                  <rect x={0} y={0} width={Math.max(2, Math.min(24, (territory.garrison.troops || 0) / 10))} height={10} rx={3} fill={'#e07a00'} />
                </g>
              )}

              {/* stacked influence bars at bottom (small) */}
              <g transform={`translate(8, ${h - 8})`}>
                {influences.reduce((acc, [fid, val]) => {
                  const prev = acc.total;
                  const wSeg = Math.max(2, (Number(val) / totalInf) * (w - 16));
                  acc.segs.push({ fid, x: prev, w: wSeg });
                  acc.total += wSeg;
                  return acc;
                }, { total: 0, segs: [] as any[] }).segs.map((seg, i) => (
                  <rect key={i} x={seg.x} y={0} width={seg.w} height={6} fill={colorForFaction(seg.fid)} />
                ))}
              </g>
            </g>
          );
        })}
      </svg>

      {hover && territories && (
        <div style={{ position: 'absolute', left: hover.x + 8, top: hover.y + 48, padding: 8, background: 'rgba(0,0,0,0.85)', color: '#fff', borderRadius: 6, fontSize: 12, minWidth: 140 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>{hover.id}</div>
          <div style={{ maxHeight: 120, overflow: 'auto' }}>
            {Object.entries((territories as any)[hover.id].influence || {}).map(([fid, val]) => (
              <div key={fid} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ color: colorForFaction(fid) }}>{fid}</div>
                <div style={{ color: 'var(--muted)' }}>{Math.round(Number(val) * 100) / 100}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
