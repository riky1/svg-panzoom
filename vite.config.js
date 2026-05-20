import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  base: process.env.BUILD_MODE === 'demo' ? '/svg-panzoom/' : '/',
  build: {
    lib: process.env.BUILD_MODE === 'demo' ? false : {
      entry: path.resolve(__dirname, 'src/index.js'),
      name: 'SvgPanZoom',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'svg-panzoom.js' : 'svg-panzoom.cjs')
    },
    outDir: process.env.BUILD_MODE === 'demo' ? 'docs' : 'dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: process.env.BUILD_MODE === 'demo' ? {
      input: {
        index: path.resolve(__dirname, 'index.html'),
        basic: path.resolve(__dirname, 'examples/basic/index.html')
      }
    } : {
      // No external deps in core for now
      external: [],
      output: {
        exports: 'named'
      }
    }
  },
  server: {
    open: process.env.BUILD_MODE === 'demo' ? '/examples/basic/index.html' : undefined
  }
});
