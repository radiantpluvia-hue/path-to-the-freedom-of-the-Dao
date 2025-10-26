"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CompetitorCard;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const SmallChip_1 = __importDefault(require("@/components/ui/SmallChip"));
function CompetitorCard({ profile, label }) {
    if (!profile)
        return ((0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 220, padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 600 }, children: label || 'Competitor' }), (0, jsx_runtime_1.jsx)("div", { style: { color: 'var(--muted)' }, children: "Empty slot" })] }));
    const name = profile.name || profile.id || 'Unknown';
    const level = profile.level || (profile.stats && profile.stats.level) || '—';
    const hp = Math.round((profile.stats && profile.stats.hp) || profile.hp || 0);
    const atk = Math.round((profile.stats && profile.stats.atk) || profile.atk || 0);
    const def = Math.round((profile.stats && profile.stats.def) || profile.def || 0);
    const spd = Math.round((profile.stats && profile.stats.speed) || profile.speed || 0);
    const sectTag = profile.sect || profile.faction || null;
    const techniques = (profile.techniques || profile.skills || []).slice(0, 6).map((t) => typeof t === 'string' ? t : t.name || String(t));
    const [openTech, setOpenTech] = (0, react_1.useState)(null);
    const avatarUrl = profile.avatar || null;
    const techniqueIcon = (tech) => {
        const k = (tech || '').toLowerCase();
        const svgStyle = { width: 16, height: 16, display: 'inline-block' };
        if (k.includes('fire') || k.includes('flame'))
            return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: [(0, jsx_runtime_1.jsx)("path", { fill: "#ff6a00", d: "M12 2s4 3 4 7a4 4 0 01-8 0c0-4 4-7 4-7z" }), (0, jsx_runtime_1.jsx)("path", { fill: "#ffb86b", d: "M12 13a4 4 0 01-4-4c0-1.6 1.2-3 2-4 .8 1 2 2.4 2 4 0 1.1.9 2 2 2z" })] }));
        if (k.includes('water') || k.includes('ice'))
            return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { fill: "#4aa3ff", d: "M12 2s4 4 4 7a4 4 0 11-8 0c0-3 4-7 4-7z" }) }));
        if (k.includes('wind') || k.includes('air'))
            return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { fill: "#b3e5ff", d: "M3 12h14a3 3 0 100-6 5 5 0 10-5 5H6a2 2 0 100 4z" }) }));
        if (k.includes('earth') || k.includes('stone'))
            return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("rect", { fill: "#a8845b", x: "4", y: "8", width: "16", height: "8", rx: "2" }) }));
        if (k.includes('light') || k.includes('holy'))
            return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "8", r: "3", fill: "#fff59d" }), (0, jsx_runtime_1.jsx)("path", { fill: "#ffe57f", d: "M12 2v2M12 18v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" })] }));
        if (k.includes('shadow') || k.includes('dark'))
            return ((0, jsx_runtime_1.jsxs)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: [(0, jsx_runtime_1.jsx)("circle", { cx: "12", cy: "12", r: "8", fill: "#222" }), (0, jsx_runtime_1.jsx)("path", { d: "M8 12a4 4 0 018 0", fill: "#444" })] }));
        if (k.includes('sword') || k.includes('blade'))
            return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { fill: "#c7c7c7", d: "M3 21l18-18 2 2L5 23z" }) }));
        if (k.includes('spear'))
            return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { fill: "#b2d8d8", d: "M12 2l2 8 8 2-8 2-2 8-2-8-8-2 8-2z" }) }));
        if (k.includes('heal') || k.includes('recover'))
            return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { fill: "#8ef08e", d: "M12 2v6M12 16v6M6 8h12M8 12h8" }) }));
        // default star
        return ((0, jsx_runtime_1.jsx)("svg", { viewBox: "0 0 24 24", style: svgStyle, xmlns: "http://www.w3.org/2000/svg", children: (0, jsx_runtime_1.jsx)("path", { fill: "#ffd54f", d: "M12 2l2.9 6.3L21 9.3l-5 4.2L17.8 21 12 17.6 6.2 21 8 13.5 3 9.3l6.1-.9z" }) }));
    };
    // simple avatar: initials on colored circle based on id hash
    const initials = String(name).split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
    const colorHash = (String(profile.id || name).split('').reduce((s, c) => s + c.charCodeAt(0), 0) % 360);
    return ((0, jsx_runtime_1.jsxs)("div", { style: { minWidth: 260, padding: 10, background: 'rgba(255,255,255,0.02)', borderRadius: 8, display: 'flex', gap: 12 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: `linear-gradient(135deg,hsl(${colorHash} 60% 70%), hsl(${(colorHash + 40) % 360} 60% 50%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18 }, children: avatarUrl ? (0, jsx_runtime_1.jsx)("img", { src: avatarUrl, alt: name, style: { width: '100%', height: '100%', objectFit: 'cover' } }) : initials }), (0, jsx_runtime_1.jsxs)("div", { style: { flex: 1 }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }, children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: '1rem', fontWeight: 800 }, children: name }), (0, jsx_runtime_1.jsxs)("div", { style: { color: 'var(--muted)', fontSize: '0.85rem' }, children: ["Level ", level] })] }), (0, jsx_runtime_1.jsx)("div", { style: { textAlign: 'right' }, children: sectTag && (0, jsx_runtime_1.jsx)(SmallChip_1.default, { style: { marginLeft: 0 }, children: sectTag }) })] }), (0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8, display: 'flex', gap: 10, flexWrap: 'wrap' }, children: [(0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["HP: ", hp] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["ATK: ", atk] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["DEF: ", def] }), (0, jsx_runtime_1.jsxs)("div", { style: { fontSize: 12, color: 'var(--muted)' }, children: ["SPD: ", spd] })] }), techniques.length > 0 && ((0, jsx_runtime_1.jsxs)("div", { style: { marginTop: 8 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontSize: 12, color: 'var(--muted)', marginBottom: 4 }, children: "Techniques" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'flex', gap: 6, flexWrap: 'wrap' }, children: techniques.map((t, i) => ((0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative' }, children: [(0, jsx_runtime_1.jsxs)("button", { onClick: () => setOpenTech(openTech === t ? null : t), style: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, padding: '6px 10px', borderRadius: 8, background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.01))', border: '1px solid rgba(255,255,255,0.03)', color: '#fff', cursor: 'pointer' }, children: [(0, jsx_runtime_1.jsx)("span", { style: { fontSize: 14 }, children: techniqueIcon(t) }), (0, jsx_runtime_1.jsx)("span", { style: { whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: 120 }, children: t })] }), openTech === t && ((0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', top: 36, left: 0, zIndex: 500 }, children: (0, jsx_runtime_1.jsxs)("div", { style: { position: 'relative', background: 'linear-gradient(180deg, rgba(10,10,10,0.95), rgba(20,20,20,0.95))', color: '#fff', padding: 10, borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.6)', minWidth: 220 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { position: 'absolute', left: 12, top: -8, width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '8px solid rgba(20,20,20,0.95)' } }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }, children: [(0, jsx_runtime_1.jsx)("div", { style: { fontWeight: 800 }, children: t }), (0, jsx_runtime_1.jsx)("button", { onClick: () => setOpenTech(null), style: { background: 'transparent', border: 'none', color: '#bbb', cursor: 'pointer', fontSize: 14 }, children: "\u2715" })] }), (0, jsx_runtime_1.jsx)("div", { style: { fontSize: 13, color: 'var(--muted)' }, children: (profile.techniqueDescriptions && (profile.techniqueDescriptions[t] || profile.techniqueDescriptions[t.toLowerCase()])) || 'No description available.' }), profile.techniqueMeta && profile.techniqueMeta[t] && ((0, jsx_runtime_1.jsx)("div", { style: { marginTop: 8, display: 'flex', gap: 8, flexWrap: 'wrap' }, children: Object.entries(profile.techniqueMeta[t]).map(([k, v]) => ((0, jsx_runtime_1.jsxs)(SmallChip_1.default, { style: { fontSize: 11, borderRadius: 6, background: 'rgba(255,255,255,0.03)' }, children: [k, ": ", String(v)] }, k))) }))] }) }))] }, i))) })] }))] })] }));
}
