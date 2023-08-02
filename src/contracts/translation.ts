import { basename } from 'node:path';
import fs from 'node:fs';
import FormData from 'form-data';
import fetch from 'node-fetch';
import type HttpClient from '@/contracts/client';
import Fetch from '@/clients/fetch';
import type { PushOptions } from '@/commands/push';

export abstract class TranslatableContract {
    abstract pull(projectId: string, language: string, fileType: string, tags: string[]): Promise<Uint8Array>;

    abstract push(projectId: string, language: string, fileType: string, data: string, tags: string[], options?: Omit<PushOptions, 'env'>): Promise<boolean>;

    protected abstract client: HttpClient;
}

export default class Translatable extends TranslatableContract {
    readonly client: Fetch;

    constructor(apiToken: string) {
        super();
        this.client = new Fetch(apiToken);
    }

    async pull(projectId: string, language: string, fileType: string, tags: string[]): Promise<Uint8Array> {
        const response = await this.client.get(`/projects/${projectId}/translations/pull`, {
            language,
            fileType,
            'tags[]': tags,
        });

        if (response.ok) {
            const data = await response.json() as { url: string; fileName: string };

            const res = await fetch(data.url);

            const buffer = await res.arrayBuffer();

            return new Uint8Array(buffer);
        }

        throw new Error(`Failed to pull ${language}`);
    }

    async push(
        projectId: string,
        language: string,
        fileType: string,
        path: string,
        tags: string[],
        options?: Omit<PushOptions, 'env'>,
    ) {
        const formData = new FormData();

        const filename = basename(path);

        formData.append('file', fs.createReadStream(path), filename);
        formData.append('fileType', fileType);
        formData.append('language', language);
        formData.append('overwrite_existing_values', +(options?.overwrite !== undefined ? options.overwrite : true));
        formData.append('verify_translations', +(options?.verify !== undefined ? options.verify : true));

        for (const tag of tags) {
            formData.append('tags[]', tag);
        }

        const response = await this.client.post(`/projects/${projectId}/translations/push`, formData);

        return response.ok && response.status === 204;
    }
}
