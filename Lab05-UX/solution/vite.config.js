import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => ({
  base: './',
  plugins: mode === 'https' ? [basicSsl()] : [],
  server: {
    allowedHosts: ['.trycloudflare.com'],
    host: true,
    port: 5173,
  },
}));
