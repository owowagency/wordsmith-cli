import * as process from "process";
import * as fs from "fs";

export enum TranslationType {
    JSON = 'json',
    I18Next = 'i18next',
    Laravel = 'laravel',
}

export interface PullOptions {
    type: TranslationType;
    languages?: String[];
    tags?: String[];
    config: WordsmithConfig;
}

interface WordsmithConfig {
    apiKey: string;
    apiUrl: string;
    langDir: string;
    exportType?: TranslationType;
    projectId: string;
    importType?: TranslationType;
}

export class Config {
    private readonly config: WordsmithConfig;

    public constructor() {
        this.config = this.readConfigFile();
    }

    public forPull(options: any): PullOptions {
        return {
            type: options.type ?? this.config.exportType ?? TranslationType.JSON,
            languages: options.languages?.split(',') ?? null,
            tags: options.tags?.split(',') ?? null,
            config: this.config,
        };
    }

    public readConfigFile(filename = 'wordsmith.config.json'): WordsmithConfig {
        const appRoot = process.cwd();

        const content = fs.readFileSync(`${appRoot}/${filename}`, 'utf8');

        return JSON.parse(content);
    }

    public get<T extends keyof WordsmithConfig>(key: T): WordsmithConfig[T] {
        return this.config[key];
    }
}