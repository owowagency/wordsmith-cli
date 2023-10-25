#!/usr/bin/env node

const {execSync} = require('child_process');

const pattern = /Release note for version (?<version>.+):$/gm
const output = execSync('yarn semantic-release --verify-conditions', {
    encoding: 'utf-8', 
    stdio: 'pipe',
});

const match = pattern.exec(output);

if (match && match.groups && 'version' in match.groups) {
    console.log(`WORDSMITH_CLI_VERSION=${match.groups['version']}`);
    process.exit(0);
} else {
    process.exit(1);
}
