"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Progress = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Progress = ({ value = null, max = 100, className = '', style = {}, showText = false, color = 'var(--primary)', backgroundColor = 'rgba(255, 255, 255, 0.1)', height = '8px' }) => {
    const isIndeterminate = value === null || typeof value === 'undefined';
    const percentage = isIndeterminate ? 0 : Math.min(Math.max((value / max) * 100, 0), 100);
    return ((0, jsx_runtime_1.jsxs)("div", { role: "progressbar", "aria-valuemin": 0, "aria-valuemax": max, "aria-valuenow": isIndeterminate ? undefined : Math.round(percentage), className: className, style: {
            width: '100%',
            height,
            backgroundColor,
            borderRadius: '4px',
            overflow: 'hidden',
            position: 'relative',
            ...style
        }, children: [(0, jsx_runtime_1.jsx)("div", { style: {
                    width: isIndeterminate ? '30%' : `${percentage}%`,
                    height: '100%',
                    backgroundColor: color,
                    transition: isIndeterminate ? 'none' : 'width 0.3s ease',
                    borderRadius: '4px',
                    animation: isIndeterminate ? 'progress-indeterminate 1s linear infinite' : undefined
                } }), showText && !isIndeterminate && ((0, jsx_runtime_1.jsxs)("div", { style: {
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    fontSize: '0.75rem',
                    fontWeight: 'bold',
                    color: 'var(--text)',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.7)',
                    pointerEvents: 'none'
                }, children: [Math.round(percentage), "%"] })), (0, jsx_runtime_1.jsx)("style", { children: `
        @keyframes progress-indeterminate {
          0% { transform: translateX(-200%); }
          100% { transform: translateX(200%); }
        }
      ` })] }));
};
exports.Progress = Progress;
exports.default = exports.Progress;
