import { defineConfig } from 'vite';
import laravel from 'laravel-vite-plugin';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/sass/app.scss',
                'resources/js/app.js',
            ],
            refresh: true,
        }),
        vue({
            template: {
                transformAssetUrls: {
                    base: null,
                    includeAbsolute: false,
                },
            },
        }),
    ],
    resolve: {
        alias: {
            vue: 'vue/dist/vue.esm-bundler.js',
        },
    },
    // --- NUEVA CONFIGURACIÓN DE PROXY ---
    server: {
        proxy: {
            '/api/DEMORPC': {
                target: 'http://192.168.1.77:7171', 
                rewrite: (path) => path.replace(/^\/api/, ''), 
                changeOrigin: true, 
                secure: false, 
            }
        }
    }
    // --- FIN DE LA NUEVA CONFIGURACIÓN ---
});