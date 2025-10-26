"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RichTooltip;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const react_dom_1 = require("react-dom");
function RichTooltip({ content, children, maxWidth = 320 }) {
    const [visible, setVisible] = (0, react_1.useState)(false);
    const [pos, setPos] = (0, react_1.useState)({ x: 0, y: 0 });
    const ref = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        const el = ref.current;
        if (!el)
            return;
        const enter = (e) => {
            setVisible(true);
            setPos({ x: e.clientX, y: e.clientY });
        };
        const move = (e) => setPos({ x: e.clientX, y: e.clientY });
        const leave = () => setVisible(false);
        el.addEventListener('mouseenter', enter);
        el.addEventListener('mousemove', move);
        el.addEventListener('mouseleave', leave);
        return () => {
            el.removeEventListener('mouseenter', enter);
            el.removeEventListener('mousemove', move);
            el.removeEventListener('mouseleave', leave);
        };
    }, []);
    // portal container ref
    const portalElRef = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(() => {
        // create container on mount
        const el = document.createElement('div');
        portalElRef.current = el;
        document.body.appendChild(el);
        return () => {
            try {
                if (portalElRef.current && portalElRef.current.parentNode)
                    portalElRef.current.parentNode.removeChild(portalElRef.current);
            }
            catch { /* ignore */ }
            portalElRef.current = null;
        };
    }, []);
    const tooltipNode = visible ? ((0, jsx_runtime_1.jsx)("div", { role: "tooltip", style: {
            position: 'fixed',
            left: pos.x + 12,
            top: pos.y + 12,
            background: 'rgba(12,12,12,0.95)',
            color: '#fff',
            padding: '8px 10px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.06)',
            zIndex: 4000,
            maxWidth,
            boxShadow: '0 6px 20px rgba(0,0,0,0.6)',
            fontSize: 13,
            whiteSpace: 'pre-wrap'
        }, children: typeof content === 'string' ? (0, jsx_runtime_1.jsx)("div", { style: { lineHeight: '1.3' }, children: content }) : content })) : null;
    return ((0, jsx_runtime_1.jsxs)("div", { style: { display: 'inline-block', position: 'relative' }, ref: ref, children: [children, portalElRef.current && tooltipNode ? (0, react_dom_1.createPortal)(tooltipNode, portalElRef.current) : null] }));
}
