import { existsSync } from 'node:fs';
import chalk from 'chalk';

export function verifyConfigFile() {
    if (!existsSync(process.env.CONFIG_FILE || '')) {
        console.log(chalk.redBright('Config file has not been created yet.'));

        process.exit();
    }
}
