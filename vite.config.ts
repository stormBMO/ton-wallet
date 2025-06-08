import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { APP_CONFIG } from './src/config/constants'

// Извлекаем домен из URL для allowedHosts
const extractDomain = (url: string) => {
    try {
        return new URL(url).hostname;
    } catch {
        return url; // Если не URL, возвращаем как есть
    }
};

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // test: {
    //   globals: true,
    //   environment: 'jsdom',
    //   setupFiles: ['./src/tests/setup.ts'],
    // },
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            buffer: 'buffer',
            process: 'process/browser',
            stream: 'stream-browserify',
            util: 'util',
        },
    },
    define: {
        global: 'globalThis',
        'process.env': {},
    },
    optimizeDeps: {
        esbuildOptions: {
            define: {
                global: 'globalThis',
            },
        },
        include: ['buffer', '@ton/core', '@ton/crypto', 'process', 'stream-browserify', 'util'],
    },
    build: {
        commonjsOptions: {
            transformMixedEsModules: true,
        },
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                },
            },
        },
    },
    server: {
        host: '0.0.0.0', // Разрешаем подключения с любых IP
        allowedHosts: [
            'localhost',
            '127.0.0.1',
            extractDomain(APP_CONFIG.APP_URL), // Извлекаем только домен из ngrok URL
            '.ngrok-free.app', // Разрешаем все ngrok домены
        ],
    },
})
