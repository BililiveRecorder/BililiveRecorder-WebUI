import { PluginOption, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueJsx from '@vitejs/plugin-vue-jsx';
import { visualizer } from 'rollup-plugin-visualizer';
import { execSync } from 'child_process';
import { inc } from 'semver';
import { resolve } from 'path';

function getVersion() {
  const desc = execSync('git describe --always --tags --abbrev=8').toString().trim();
  if (desc.indexOf('-') === -1) {
    return desc;
  }
  const branch = execSync('git rev-parse --abbrev-ref HEAD').toString().trim();
  const _desc = desc.split('-');
  const version = inc(_desc[0], 'patch');
  const commit = _desc[1];
  const sha = _desc[2];
  return `${version}-${branch}.${commit}-${sha}`;
}

// https://vitejs.dev/config/
export default defineConfig(({ command }) => {
  return {
    base: process.env.BASE_URL || './',
    plugins: [vue(), vueJsx(), visualizer()] as PluginOption[],
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
        '/file': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
        },
        '^/unroot/.*': {
          target: 'http://127.0.0.1:8000',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/unroot/, ''),
        },
      },
    },
    build: {
      minify: 'terser',
    },
    define: {
      __VERSION__: command == 'build' ? '"' + getVersion() + '"' : '"dev"',
    },
    resolve: {
      'alias': { '@': resolve('./src') },
    },
  };
});
