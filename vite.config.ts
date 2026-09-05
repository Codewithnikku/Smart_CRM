import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
    build: {
        sourcemap: 'hidden',
        chunkSizeWarningLimit: 1000,
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom', 'zustand'],
                    charts: ['recharts'],
                    icons: ['lucide-react'],
                },
            },
        },
    },
    plugins: [
        react(),
        tsconfigPaths()
    ],
});
