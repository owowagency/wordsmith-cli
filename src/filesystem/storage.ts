import {PullOptions} from "../misc/config.js";
import {TranslationList} from "../models/translation.js";
import * as fs from "fs";
import {Language} from "./language.js";

export class Storage {
    public store(translations: TranslationList, options: PullOptions) {
        const languages = translations.mapToLanguages();

        Object.keys(languages).forEach((language) => {
            this.storeLanguage(language, languages[language], options);
        });

        console.log(options);
    }

    protected storeLanguage(languageCode: string, translations: Record<string, string>, options: PullOptions) {
        const language = new Language({
            code: languageCode,
            translations,
            options: options,
        });

        language.getFiles().forEach((file) => {
            this.makeDir(file.getPath(options.config.langDir));

            this.writeToFile(file.getFullPath(options.config.langDir), file.getContent());
        });
    }

    public makeDir(path: string) {
        const root = process.cwd();

        const fullPath = `${root}/${path}`;

        // If the root directory does not exist, create it.
        if (!fs.existsSync(fullPath)) {
            fs.mkdirSync(fullPath);
        }
    }

    public writeToFile(path: string, content: string) {
        fs.writeFileSync(path, content);
    }
}