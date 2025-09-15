"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingPrerequisiteVisualization = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const TeachingPrerequisiteVisualization = ({ teaching, playerState }) => {
    const checkRequirement = (key, required) => {
        if (key === 'mentorAffinity') {
            for (const [mentor, value] of Object.entries(required)) {
                if ((playerState.mentorAffinity?.[mentor] || 0) < value)
                    return false;
            }
            return true;
        }
        if (typeof required === 'number') {
            return (playerState[key] || 0) >= required;
        }
        if (typeof required === 'boolean') {
            return !!playerState[key] === required;
        }
        return true;
    };
    const entries = Object.entries(teaching.prerequisites || {});
    return ((0, jsx_runtime_1.jsxs)("div", { style: {
            padding: '15px',
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa',
            marginBottom: '15px'
        }, children: [(0, jsx_runtime_1.jsx)("h4", { style: { margin: '0 0 10px 0', color: '#495057' }, children: "Prerequisites" }), (0, jsx_runtime_1.jsx)("div", { style: { display: 'grid', gap: '8px' }, children: entries.map(([key, value]) => {
                    const isMet = checkRequirement(key, value);
                    return ((0, jsx_runtime_1.jsxs)("div", { style: {
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '8px',
                            borderRadius: '4px',
                            backgroundColor: isMet ? '#d4edda' : '#f8d7da',
                            border: `1px solid ${isMet ? '#c3e6cb' : '#f5c6cb'}`
                        }, children: [(0, jsx_runtime_1.jsxs)("span", { style: { fontWeight: '500' }, children: [key === 'mentorAffinity' ? 'Mentor Affinity' : key.charAt(0).toUpperCase() + key.slice(1), ":"] }), (0, jsx_runtime_1.jsxs)("div", { style: { display: 'flex', alignItems: 'center', gap: '8px' }, children: [key === 'mentorAffinity' ? (Object.entries(value).map(([mentor, required]) => ((0, jsx_runtime_1.jsxs)("span", { style: { fontSize: '14px' }, children: [mentor, ": ", playerState.mentorAffinity?.[mentor] || 0, "/", required] }, mentor)))) : ((0, jsx_runtime_1.jsx)("span", { style: { fontSize: '14px' }, children: typeof value === 'number'
                                            ? `${playerState[key] || 0}/${value}`
                                            : typeof value === 'boolean'
                                                ? (playerState[key] ? '✓' : '✗')
                                                : 'Unknown' })), (0, jsx_runtime_1.jsx)("span", { style: {
                                            fontSize: '16px',
                                            color: isMet ? '#28a745' : '#dc3545',
                                            fontWeight: 'bold'
                                        }, children: isMet ? '✓' : '✗' })] })] }, key));
                }) })] }));
};
exports.TeachingPrerequisiteVisualization = TeachingPrerequisiteVisualization;
