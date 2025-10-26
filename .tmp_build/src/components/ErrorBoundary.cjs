"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorBoundary = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const react_1 = __importDefault(require("react"));
class ErrorBoundary extends react_1.default.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, info) {
        // eslint-disable-next-line no-console
        console.error('ErrorBoundary caught:', error, info);
    }
    render() {
        if (this.state.hasError) {
            return ((0, jsx_runtime_1.jsxs)("div", { style: { padding: 20 }, children: [(0, jsx_runtime_1.jsx)("h2", { children: "Something went wrong." }), (0, jsx_runtime_1.jsx)("pre", { style: { whiteSpace: 'pre-wrap' }, children: String(this.state.error) })] }));
        }
        return this.props.children;
    }
}
exports.ErrorBoundary = ErrorBoundary;
exports.default = ErrorBoundary;
