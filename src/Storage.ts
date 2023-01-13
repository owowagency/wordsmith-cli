import {TranslationCollection} from "./TranslationCollection";
import {StorageTranslation} from "./StorageTranslation";
import {StorageTranslationCollection} from "./StorageTranslationCollection";
const { readFileSync, writeFileSync, readdirSync } = require('fs');

export class Storage {

    private readonly path: string;

    constructor(path: string) {
        this.path = path;
    }

    // TODO: whenever configuration changes, storage contents should be diverted to the new location
    // because project id and tags might have changed, which will invalidate translations
    public writeTranslations(language: string, translationCollection: TranslationCollection): void {
        let translationsJson = translationCollection.toJson(language);

        let filePath = this.path + '/' + language + '.json';

        writeFileSync(filePath, JSON.stringify(translationsJson, null, 2), 'utf8');
    }

    public writeTranslationsForAllLanguages(translationCollection: TranslationCollection): void {
        let languages = translationCollection.uniqueLanguages()

        languages.forEach(language => {
            this.writeTranslations(language, translationCollection);
        });
    }

    public readTranslations(): StorageTranslationCollection {
        let files = readdirSync(this.path);

        let languages = files.map((filename: string ) => filename.replace('.json', ''));

        let storageTranslations: StorageTranslation[] = [];
        languages.forEach((language: string) => {
            let dataRaw = readFileSync(this.path + '/' + language + '.json', 'utf8');

            let data = JSON.parse(dataRaw);

            storageTranslations.push(new StorageTranslation(language, data));
        });

        return new StorageTranslationCollection(storageTranslations);
    }
}