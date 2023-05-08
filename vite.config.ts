import path from 'node:path';
import { defineConfig } from 'vite';

export default defineConfig({
    // import.meta.env values are statically replaced at build time
    resolve: {
        alias: {
            '@': path.resolve('./src'),
        },
    },
    build: {
        target: 'es6',
        outDir: 'build',
        ssr: true,
        lib: {
            entry: './src/main.ts',
            formats: ['es'],
            fileName: format => '[name].js',
        },
        rollupOptions: {
            // input,
            external: ['chalk'],
            output: {
                inlineDynamicImports: false,
                preserveModules: true,
                preserveModulesRoot: 'src',
            },
        },
    },
    plugins: [],
    // test: {},
});
