const { program } = require("commander");
const figlet = require("figlet");

console.log(figlet.textSync("translate-cli"));

program
    .name('translate-cli')
    .description('CLI tool to work with translations')
    .version('1.0.0');

program.parse();