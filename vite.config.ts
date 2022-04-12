import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// https://vitejs.dev/config/
export default defineConfig({
  base: process.env.BASE_URL || '/',
  plugins: [vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/swagger': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    minify: 'terser',
    rollupOptions: {
      plugins: [

        require('@rollup/plugin-replace')({
          delimiters: ['', ''],
          values: {
            '__VERSION__': require('child_process').execSync('git describe --always --tags --abbrev=8').toString().trim(),
            '__BASE_URL__': process.env.BASE_URL || '/',
          },
        }),
      ],
    },
  },
});
