#!/usr/bin/env node

const {existsSync} = require('fs');

const files = ['Cargo.toml', 'Cargo.lock', 'composer.json'];

for (const file of files) {
    if (!existsSync(file)) {
        console.error('Could not find file', file);
        process.exit(1);
    }
}