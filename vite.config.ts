import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: process.env.GITHUB_ACTIONS ? '/sinter-kerst/' : '/', // vervang <repo-naam>
  server: {
    host: true,
    port: 4173
  }
});
