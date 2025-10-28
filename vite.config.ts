import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  base: '/<REPO>/',
  server: {
    host: true,
    port: 4173
  }
});
