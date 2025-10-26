"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = MiniMap;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
// MiniMap supports optional normalized positions (0..1) or absolute pixel positions.
// If positions are not provided the map will auto-layout territories into a grid.
function MiniMap({ territories, positions, width = 300, height = 200, onSelect, selected }) {
    const tKeys = territories ? Object.keys(territories) : [];
    const [hover, setHover] = (0, react_1.useState)(null);
    // Layout: if positions provided, convert normalized positions (0..1) to pixels.
    const resolvedPositions = (0, react_1.useMemo)(() => {
        const out = {};
        if (!tKeys.length)
            return out;
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
            }
            else {
                const col = i % cols;
                const row = Math.floor(i / cols);
                out[id] = { x: col * cellW + 8, y: row * cellH + 8 };
            }
        });
        return out;
    }, [tKeys.join(','), positions, width, height]);
    const getColorForTerritory = (t) => {
        if (!t)
            return '#222';
        if (t.ownerFactionId)
            return '#2b7aef';
        // compute influence heat: max faction influence
        const max = Math.max(...Object.values(t.influence || { 0: 0 }));
        const heat = Math.min(1, max / 100);
        const g = Math.round(240 - 160 * heat);
        return `rgb(${g},${200 - Math.round(160 * heat)},${g + 20})`;
    };
    // helper color per factionId
    const colorForFaction = (fid) => {
        const h = (fid.split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 360);
        return `hsl(${h} 70% 60%)`;
    };
    // Build neighbor links list
    const links = (0, react_1.useMemo)(() => {
        const out = [];
        if (!territories)
            return out;
        for (const id of Object.keys(territories)) {
            const t = territories[id];
            if (!t || !t.neighbors)
                continue;
            for (const n of t.neighbors) {
                if (territories[n]) {
                    // ensure each pair once (a<b)
                    if (!out.find(l => (l.a === id && l.b === n) || (l.a === n && l.b === id)))
                        out.push({ a: id, b: n });
                }
            }
        }
        return out;
    }, [territories]);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', width, height }, children: [(0, jsx_runtime_1.jsxs)("svg", { width: width, height: height, style: { border: '1px solid rgba(255,255,255,0.06)', borderRadius: 6, background: 'var(--dark)' }, children: [links.map((l, i) => {
                        const pa = resolvedPositions[l.a];
                        const pb = resolvedPositions[l.b];
                        if (!pa || !pb)
                            return null;
                        return (0, jsx_runtime_1.jsx)("line", { x1: pa.x + 20, y1: pa.y + 12, x2: pb.x + 20, y2: pb.y + 12, stroke: 'rgba(255,255,255,0.04)', strokeWidth: 1 }, `link-${i}`);
                    }), tKeys.map((id) => {
                        const p = resolvedPositions[id];
                        if (!p)
                            return null;
                        const w = 120;
                        const h = 44;
                        const territory = territories ? territories[id] : undefined;
                        const fill = getColorForTerritory(territory);
                        const isSelected = selected === id;
                        // compute stacked influence bars
                        const influences = territory ? Object.entries(territory.influence || {}) : [];
                        const totalInf = influences.reduce((s, [, v]) => s + v, 0) || 1;
                        return ((0, jsx_runtime_1.jsxs)("g", { transform: `translate(${p.x},${p.y})`, style: { cursor: 'pointer' }, onClick: () => onSelect && onSelect(id), onMouseEnter: () => setHover({ id, x: p.x, y: p.y }), onMouseLeave: () => setHover(null), children: [(0, jsx_runtime_1.jsx)("rect", { x: 0, y: 0, width: w, height: h, rx: 8, ry: 8, fill: fill, stroke: isSelected ? 'gold' : 'rgba(255,255,255,0.06)', strokeWidth: isSelected ? 2 : 1 }), (0, jsx_runtime_1.jsx)("text", { x: 8, y: 14, fontSize: 12, fill: "#fff", children: id }), (0, jsx_runtime_1.jsxs)("text", { x: 8, y: 28, fontSize: 10, fill: "#ddd", children: ["Owner: ", territory?.ownerFactionId || 'None'] }), territory?.garrison && ((0, jsx_runtime_1.jsxs)("g", { transform: `translate(${w - 34},6)`, children: [(0, jsx_runtime_1.jsx)("rect", { x: 0, y: 0, width: 24, height: 10, rx: 3, fill: 'rgba(0,0,0,0.25)' }), (0, jsx_runtime_1.jsx)("rect", { x: 0, y: 0, width: Math.max(2, Math.min(24, (territory.garrison.troops || 0) / 10)), height: 10, rx: 3, fill: '#e07a00' })] })), (0, jsx_runtime_1.jsx)("g", { transform: `translate(8, ${h - 8})`, children: influences.reduce((acc, [fid, val]) => {
                                        const prev = acc.total;
                                        const wSeg = Math.max(2, (Number(val) / totalInf) * (w - 16));
                                        acc.segs.push({ fid, x: prev, w: wSeg });
                                        acc.total += wSeg;
                                        return acc;
                                    }, { total: 0, segs: [] }).segs.map((seg, i) => ((0, jsx_runtime_1.jsx)("rect", { x: seg.x, y: 0, width: seg.w, height: 6, fill: colorForFaction(seg.fid) }, i))) })] }, id));
                    })] }), hover && territories && ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'absolute', left: hover.x + 8, top: hover.y + 48, padding: 8, background: 'rgba(0,0,0,0.85)', color: '#fff', borderRadius: 6, fontSize: 12, minWidth: 140 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 700, marginBottom: 6 }, children: hover.id }), (0, jsx_runtime_1.jsx)("div", { style: { maxHeight: 120, overflow: 'auto' }, children: Object.entries(territories[hover.id].influence || {}).map(([fid, val]) => ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between' }, children: [(0, jsx_runtime_1.jsx)("div", { style: { color: colorForFaction(fid) }, children: fid }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: Math.round(Number(val) * 100) / 100 })] }, fid))) })] }))] }));
}
