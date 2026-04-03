import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 4174,
    strictPort: true,
    cors: true
  },
  preview: {
    host: '127.0.0.1',
    port: 4175,
    strictPort: true
  },
  plugins: [
    {
      name: 'inject-endpoint',
      configureServer(server) {
        server.middlewares.use('/inject.js', async (_req, res, next) => {
          try {
            const result = await server.transformRequest('/src/inject.js');

            if (!result) {
              res.statusCode = 404;
              res.end('inject.js not found');
              return;
            }

            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', '*');
            res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
            res.end(result.code);
          } catch (error) {
            next(error);
          }
        });
      }
    }
  ],
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        app: resolve(__dirname, 'index.html'),
        inject: resolve(__dirname, 'src/inject.js')
      },
      output: {
        entryFileNames(chunkInfo) {
          if (chunkInfo.name === 'inject') {
            return 'inject.js';
          }

          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  }
});
