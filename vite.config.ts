// vite.config.ts
import { defineConfig, Plugin } from 'vite';
import react from '@vitejs/plugin-react';

const configureServerHeaders = (): Plugin => ({
    name: 'configure-server-headers',
    configureServer(server) {
        server.middlewares.use((_req, res, next) => {
            res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
            res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
            next();
        });
    },
});

export default defineConfig({
    base: '/LuckyRepo/',
    plugins: [
        react(),
        configureServerHeaders()
    ],

    worker: {
        format: 'es',
        plugins: () => [
        ]
    },

    server: {
        port: 3000,
        headers: {
            'Cross-Origin-Opener-Policy': 'same-origin',
            'Cross-Origin-Embedder-Policy': 'require-corp',
        },
    },

    build: {
        target: 'esnext',
        outDir: 'dist',
        sourcemap: true
    }
});