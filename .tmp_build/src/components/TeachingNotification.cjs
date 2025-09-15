"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeachingNotification = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = require("react");
const TeachingNotification = ({ message, type, onClose }) => {
    const [visible, setVisible] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            setTimeout(onClose, 300); // Wait for fade out animation
        }, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);
    const getStyles = () => {
        const baseStyles = {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 'bold',
            zIndex: 1000,
            transition: 'opacity 0.3s ease',
            opacity: visible ? 1 : 0,
            maxWidth: '400px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        };
        const typeStyles = {
            success: { backgroundColor: '#28a745' },
            failure: { backgroundColor: '#dc3545' },
            unlock: { backgroundColor: '#17a2b8' }
        };
        return { ...baseStyles, ...typeStyles[type] };
    };
    return ((0, jsx_runtime_1.jsx)("div", { style: getStyles(), children: message }));
};
exports.TeachingNotification = TeachingNotification;
