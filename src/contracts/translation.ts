import type { ParsedPath } from 'node:path';
import path from 'node:path';
import fs from 'node:fs';
import FormData from 'form-data';
import fg from 'fast-glob';
import type HttpClient from '@/contracts/client';
import Axios from '@/clients/axios';

export abstract class TranslatableContract {
    public configFilename = process.env.CONFIG_FILE || '' as const;

    readonly abstract extension: string;

    readonly abstract pattern: string;

    abstract get hasConfig(): boolean;

    abstract get config(): Config;

    abstract get files(): ParsedPath[];

    abstract get langs(): string[];

    abstract pull(languages?: string, tags?: string): Promise<Translation[]>;

    abstract push(data: BinaryData, file: string): Promise<unknown>;

    abstract serialize(records: TranslatableRecord[]): string;

    abstract deserialize(content: string): TranslatableRecord[];

    protected abstract client: HttpClient;
}

export default abstract class Translatable extends TranslatableContract {
    client = new Axios(this.config);

    get hasConfig() {
        return fs.existsSync(path.resolve(this.configFilename));
    }

    get config() {
        try {
            const content = fs.readFileSync(path.resolve(this.configFilename));

            const config = JSON.parse(content.toString());

            return config as Config;
        }
        catch {
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

    pull(languages?: string, tags?: string) {
        return this.client.get<{ data: Translation[] }>(`projects/${this.config.projectId}/translations/pull`, {
            'filters[tags.name]': tags,
            'filters[translation_values.language]': languages,
        }).then(response => response.data);
    }

    push(data: BinaryData, file: string) {
        const formData = new FormData();

        formData.append('data', data, file);

        return this.client.post(`projects/${this.config.projectId}/translations/push`, formData, {
            'Content-Type': 'multipart/form-data',
        });
    }
}
