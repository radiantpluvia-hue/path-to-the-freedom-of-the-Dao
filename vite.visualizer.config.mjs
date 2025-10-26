import { defineConfig } from 'vite';
import path from 'path';
import react from '@vitejs/plugin-react';
// rollup-plugin-visualizer v4 is CommonJS; import default and read .default if present
import visualizerPkg from 'rollup-plugin-visualizer';
const visualizer = visualizerPkg && visualizerPkg.default ? visualizerPkg.default : visualizerPkg;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), 'src')
    }
  },
  build: {
    rollupOptions: {
      plugins: [
        visualizer({ filename: 'dist/stats.html', template: 'treemap', open: false, gzipSize: true }),
        // generate a JSON stats file using the treemap template's json output
        visualizer({ filename: 'dist/stats.json', template: 'treemap', open: false, gzipSize: true, json: true })
      ]
    }
  }
});
