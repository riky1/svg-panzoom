import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'SvgPanZoom',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'svg-panzoom.js' : 'svg-panzoom.cjs')
    },
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      // No external deps in core for now
      external: [],
      output: {
        exports: 'named'
      }
    }
  }
});
