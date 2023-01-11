const { program } = require("commander");
const packageJson = require('../package.json');

import { Config } from './config';

let config = new Config();

program
    .name(config.get('cli.name'))
    .description(packageJson.description)
    .version(packageJson.version)
    .option('-token, --api-token <token>', 'Set the token used to authenticate with the API')
    .option('-id, --project-id <id>', 'Set the ID of the project that will be used for translations')
    .option('-d, --translations-directory <directory>', 'Set the directory where the translations will be stored')
    .option('-t --tags <tags>', 'Set the tags that will be used to filter the translations');

program.parse(process.argv);

const options = program.opts();

if (options.apiToken) { config.set('client.api_token', options.apiToken); }

if (options.projectId) { config.set('client.project_id', options.projectId); }

if (options.translationsDirectory) { config.set('client.translations_directory', options.translationsDirectory); }

if (options.tags) { config.set('client.tags', options.tags); }

if (! config.isConfigured()) {
    console.log("Please configure the CLI before using it.");
    program.help();
}