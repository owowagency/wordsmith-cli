import { TargetType, TranslationType } from '@/misc/enums';
import type {Command} from 'commander';
import { FileTypes } from 'glob/dist/mjs/glob';

export {};

declare global {
    interface Config {
        token: string;
        projectId: string;
        targets: Target[];
    }

    interface Target {
        file: string;
        defaultLocaleOverride?: string;
        types: TargetType[];
        args: TargetArguments;
    }

    interface TargetArguments {
        fileType: TranslationType;
        tags?: string[];
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
