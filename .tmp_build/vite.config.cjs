"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vite_1 = require("vite");
const plugin_react_1 = __importDefault(require("@vitejs/plugin-react"));
const path_1 = __importDefault(require("path"));
// https://vitejs.dev/config/
exports.default = (0, vite_1.defineConfig)(({ mode }) => {
    const isProd = mode === 'production';
    return {
        // Build assets with relative paths so index.html can be opened directly
        base: './',
        plugins: [(0, plugin_react_1.default)()],
        resolve: {
            alias: {
                '@': path_1.default.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 3000,
            open: true,
        },
        define: {
            __DEV__: JSON.stringify(!isProd),
            'process.env.NODE_ENV': JSON.stringify(mode),
        },
        build: {
            outDir: 'dist',
            sourcemap: !isProd, // disable source maps for release
            minify: isProd ? 'terser' : false,
            terserOptions: isProd
                ? {
                    compress: { drop_console: true, drop_debugger: true },
                    format: { comments: false },
                }
                : undefined,
            rollupOptions: {
                // Code split heavy panels into separate chunks
                output: {
                    manualChunks(id) {
                        if (id.includes('/components/game/MarketPanel'))
                            return 'market';
                        if (id.includes('/components/game/SectJoiningPanel'))
                            return 'sect';
                        if (id.includes('/components') && id.toLowerCase().includes('rival'))
                            return 'rival';
                        return undefined;
                    },
                },
                // Ensure tests/docs are never part of the prod bundle
                external: isProd
                    ? [
                        /\.test\.[tj]sx?$/,
                        /src\/tests\//,
                        /src\/test\//,
                        /tests\//,
                        /docs?\//,
                    ]
                    : [],
            },
            // Smaller output when releasing
            cssCodeSplit: true,
            assetsInlineLimit: 0,
            reportCompressedSize: true,
            target: 'es2019',
        },
        esbuild: {
            legalComments: 'none',
        },
        optimizeDeps: {
            exclude: ['src/tests', 'src/test'],
        },
    };
});
