import { defineConfig } from 'vite';
import path from 'path';
import pkg from './package.json';

export default defineConfig({
    resolve: {
        alias: {
          '@': path.resolve('./src'),
        },
    },
    build: {
        lib: {
            entry: 'src/main.ts',
            formats: ['umd'],
            name: pkg.name,
        },
    },
});
