"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Progress = ({ value, max = 100, className = '', style = {}, showText = false, color = 'var(--primary)', backgroundColor = 'rgba(255, 255, 255, 0.1)', height = '8px' }) => {
    const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
    return ((0, jsx_runtime_1.jsxs)("div", { className: className, style: {
            width: '100%',
            height,
            backgroundColor,
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
            ...style
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    width: `${percentage}%`,
                    height: '100%',
                    backgroundColor: color,
                    transition: 'width 0.3s ease',
                    borderRadius: '4px'
                } }), showText && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: 'var(--text)',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                    pointerEvents: 'none'
                }, children: [Math.round(percentage), "%"] }))] }));
};
exports.Progress = Progress;
exports.default = exports.Progress;
