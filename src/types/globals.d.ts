import type {Command} from 'commander';

export {};

declare global {
    interface Config {
        apiKey: string;
        langDir: string;
        exportType?: any;
        projectId: string;
        importType?: any;
    }

    interface SubCommand {
        bind: (command: Command) => void;
    }

    interface Translation {
        key: string;
        tags: TranslationTag[];
        translationValues: TranslationValue[];
    }

    interface TranslationValue {
        language: string;
        value: string;
    }

    interface TranslationTag {
        name: string;
        slug: string;
    }

    interface TranslatableRecord {
        key: string;
        value: string;
    }
}
