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

    getTranslationsForLanguage(language: string): Translation[] {
        return this.translations.filter((translation: Translation) => {
            return translation.values.some(v => v.language === language);
        });
    }

    toJson(language: string): any {
        return this.getTranslationsForLanguage(language)
            .reduce((translations: Record<string, any>, translation: Translation) => {
                translations[translation.key] = translation.values.find(v => v.language === language)?.value;

                return translations;
            }, {}
        );
    }
}