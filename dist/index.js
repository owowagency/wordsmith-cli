"use strict";
const { program } = require("commander");
const figlet = require("figlet");
console.log(figlet.textSync("translate-cli"));
program
    .name('string-util')
    .description('CLI tool to work with translations')
    .version('1.0.0');
// console.log(figlet.textSync("Dir Manager"));
program.parse();
//# sourceMappingURL=index.js.map