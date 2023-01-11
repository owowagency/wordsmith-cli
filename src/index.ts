const { program } = require("commander");
const figlet = require("figlet");
const packageJson = require('../package.json');

console.log(figlet.textSync(packageJson.name));

program
    .name(packageJson.name)
    .description(packageJson.description)
    .version(packageJson.version);

program.parse();