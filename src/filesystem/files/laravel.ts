import {LanguageFile, LanguageFileList} from "./file.js";
import {dot} from "../../misc/helpers.js";

export class Laravel extends LanguageFile {
    public getName(): string {
        return `${this.getKey()}.php`;
    }

    public getKey(): string {
        return Object.keys(this.args.translations)[0] ?? 'default';
    }

    public getPath(root: string): string {
        return `${root}/${this.args.code}`;
    }

    public getContent(): string {
        const key = this.getKey();

        const translations = this.args.translations[key];

        const lines = [];

        for (const [key, value] of Object.entries(translations)) {
            const keyValueString = `'${key}' => '${value}',`;
            lines.push(`    ${keyValueString}`);
        }

        return `<?php\n\nreturn [\n${lines.join("\n")}\n];\n`;
    }
}

export class LaravelList extends LanguageFileList {
    public getFiles(): LanguageFile[] {
        const files: Laravel[] = [];

        const translations = dot(this.args.translations);

        for (const [key, value] of Object.entries(translations)) {
            files.push(new Laravel({
                code: this.args.code,
                translations: {
                    [key]: value as any,
                },
            }));
        }

        return files;
    }
}