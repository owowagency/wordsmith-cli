#!/usr/bin/env node

import {spawnSync} from 'child_process';
import {resolve} from 'path';
import {chmodSync, constants} from 'fs';

const commandArgs = process.argv.slice(2);

interface Platform {
    name: NodeJS.Platform,
    architectures: NodeJS.Architecture[],
}

const supported: Platform[] = [
    {
        name: 'win32',
        architectures: ['x64'],
    },
    {
        name: 'darwin',
        architectures: ['arm64'],
    },
    {
        name: 'linux',
        architectures: ['x64', 'arm64'],
    }
];

const platform = supported.find(p => p.name === process.platform);

if (!(platform && platform.architectures.find(a => a === process.arch))) {
    throw new Error(`Unsupported platform: "${process.platform}" [${process.arch}]`);
}

const binaryPostfix = process.platform === 'win32' ? '.exe' : '';
const binaryName = 'wordsmith';
const binary = resolve(__dirname, '..', 'bin', process.platform, process.arch, `${binaryName}${binaryPostfix}`);

chmodSync(binary, constants.S_IXUSR | constants.S_IRUSR);
spawnSync(binary, commandArgs, {
    shell: true,
    stdio: 'inherit',
});