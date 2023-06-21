import type { ParsedPath } from 'node:path';
import path from 'node:path';
import fs from 'node:fs';
import fg from 'fast-glob';
import FormData from 'form-data';
import fetch from 'node-fetch';
import type HttpClient from '@/contracts/client';
import Fetch from '@/clients/fetch';
import type { PushOptions } from '@/commands/push';

export abstract class TranslatableContract {
    public configFilename = process.env.CONFIG_FILE || '' as const;

    readonly abstract extension: string;

    readonly abstract pattern: string;

    abstract get hasConfig(): boolean;

    abstract get config(): Config;

    abstract get files(): ParsedPath[];

    abstract get langs(): string[];

    abstract pull(language: string): Promise<boolean>;

    abstract push(data: ParsedPath, options?: PushOptions): Promise<boolean>;

    protected abstract client: HttpClient;
}

export default abstract class Translatable extends TranslatableContract {
    client = new Fetch(this.config);

    get hasConfig() {
        return fs.existsSync(path.resolve(this.configFilename));
    }

    get config() {
        try {
            const content = fs.readFileSync(path.resolve(this.configFilename));

            const config = JSON.parse(content.toString());

            return config as Config;
        } catch {
            return {
                apiKey: '',
                exportType: '',
                langDir: '',
                projectId: '',
                importType: '',
            };
        }
    }

    get files() {
        if (!this.hasConfig) {
            return [];
        }

        const files = fg.sync(path.resolve(this.config.langDir, this.pattern));

        return files.map(file => path.parse(file));
    }

    get langs() {
        return [...new Set(this.files.map(file => file.name))];
    }

    async pull(language: string): Promise<boolean> {
        const response = await this.client.get(`projects/${this.config.projectId}/translations/pull`, {
            language,
            fileType: this.config.importType,
        });

        if (response.ok) {
            const data = await response.json() as { url: string; fileName: string };

            const res = await fetch(data.url);

            const fileStream = fs.createWriteStream(path.resolve(`${this.config.langDir}/${data.fileName}`));

            return new Promise((resolve, reject) => {
                res.body.pipe(fileStream);

                res.body.on('error', reject);

                fileStream.on('finish', () => resolve(true));
            });
        }

        return false;
    }

    async push(file: ParsedPath, options?: Omit<PushOptions, 'languages'>) {
        const formData = new FormData();

        const filename = `${file.name}${file.ext}`;

        formData.append('file', fs.createReadStream(path.resolve(file.dir, filename)), filename);
        formData.append('fileType', this.config.exportType);
        formData.append('language', file.name);
        formData.append('overwrite_existing_values', +(options?.overwrite !== undefined ? options.overwrite : true));
        formData.append('verify_translations', +(options?.verify !== undefined ? options.verify : true));

        const response = await this.client.post(`/projects/${this.config.projectId}/translations/push`, formData);

        return response.ok && response.status === 204;
    }
}
