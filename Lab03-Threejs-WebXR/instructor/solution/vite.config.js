import { defineConfig } from 'vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => ({
  // The local certificate is deliberately enabled only for the lab HTTPS mode.
  plugins: mode === 'https' ? [basicSsl()] : [],
  server: {
    host: true,
    port: 5173,
  },
}));
