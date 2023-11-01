#!/usr/bin/env node

import {spawnSync} from 'child_process';
import {resolve} from 'path';
import {chmodSync, constants, linkSync, existsSync} from 'fs';

const commandArgs = process.argv.slice(2);

interface BinaryLocation {
    platform: NodeJS.Platform,
    arch: NodeJS.Architecture,
    path: string,
}

const binaries: BinaryLocation[] = [
    {
        platform: 'linux',
        arch: 'arm64',
        path: resolve(__dirname, '..', 'bin', 'wordsmith-aarch64-unknown-linux-gnu'),
    },
    {
        platform: 'linux',
        arch: 'x64',
        path: resolve(__dirname, '..', 'bin', 'wordsmith-x86_64-unknown-linux-gnu'),
    },
    {
        platform: 'darwin',
        arch: 'arm64',
        path: resolve(__dirname, '..', 'bin', 'wordsmith-aarch64-apple-darwin'),
    },
    {
        platform: 'darwin',
        arch: 'x64',
        path: resolve(__dirname, '..', 'bin', 'wordsmith-x86_64-apple-darwin'),
    },
    {
        platform: 'win32',
        arch: 'x64',
        path: resolve(__dirname, '..', 'bin', 'wordsmith-x86_64-pc-windows-msvc.exe'),
    }
]

const binary = binaries.find(b => b.arch === process.arch && b.platform === process.platform)

if (!binary) {
    throw new Error(`Unsupported platform: "${process.platform}" [${process.arch}]`);
}

chmodSync(binary.path, constants.S_IXUSR | constants.S_IRUSR);

const path = resolve(__dirname, '..', 'bin', 'wordsmith');

if (!existsSync(path)) {
    linkSync(binary.path, path);
}

const result = spawnSync(path, commandArgs, {
    shell: true,
    stdio: 'inherit',
});

process.exit(result.status ?? 0);