import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'


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
        allowedHosts: ['e5b3-79-127-252-80.ngrok-free.app'],
    },
})
