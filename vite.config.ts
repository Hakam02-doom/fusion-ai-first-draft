import { defineConfig, loadEnv } from 'vite';
import handler from './api/builder.js';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'fusion-api',
      configureServer(server) {
        Object.assign(
          process.env,
          loadEnv(server.config.mode, process.cwd(), ''),
        );
        server.middlewares.use('/api/builder', (req, res) => handler(req, res));
      },
    },
  ],
  server: { host: '0.0.0.0', watch: { usePolling: true } },
});
