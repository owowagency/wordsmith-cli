#!/usr/bin/env node

const {readFileSync, writeFileSync} = require('fs');

const targets = [
    {
        path: 'Cargo.toml',
        pattern: /^(version = ")([^"]+)(")$/m
    },
    {
        path: 'Cargo.lock',
        pattern: /(name = "wordsmith"\nversion = ")([^"]+)(")/
    },
    {
        path: 'composer.json',
        pattern: /("version": ")([^"]+)(")/
    }
];

const nextVersion = process.argv[2];

for (const target of targets) {
    const content = readFileSync(target.path, {encoding: 'utf-8'});
    if (!target.pattern.test(content)) {
        console.error('Failed to update file', target.path);
        process.exit(1);
    }
    
    const updated = content.replace(target.pattern, `$1${nextVersion}$3`);
    writeFileSync(target.path, updated);
}