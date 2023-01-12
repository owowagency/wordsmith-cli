import {Translation} from "./Translation";

export class TranslationCollection {

    private translations: Translation[];

    constructor(translationResponse: any) {
        this.translations = translationResponse.map((translation: any) => {
            return new Translation(translation);
        });
    }

    uniqueLanguages(): string[] {
        let languageSet: Set<string> = new Set();

        this.translations.forEach((translation: Translation) => {
            translation.values.forEach(v => languageSet.add(v.language))
        });

        return Array.from(languageSet);
    }

}