import dotenv from 'dotenv';
import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/main.ts'],
    format: ['cjs'],
    target: ['node12'],
    outDir: 'bin',
    clean: true,
    minify: true,
    env: dotenv.config().parsed,
});
