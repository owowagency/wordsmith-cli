export class StorageTranslation {

    private readonly _language: string;

    private readonly translationValues: StorageTranslationValue[];

    constructor(language: string, translations: Record<string, string>) {
        this._language = language;
        this.translationValues = Object.keys(translations).map((key: string) => {
            return new StorageTranslationValue(key, translations[key]);
        });
    }

    public keys(): string[] {
        return this.translationValues.map((translationValue: StorageTranslationValue) => translationValue.key);
    }

    public getTranslationValue(key: string): string | undefined {
        let translationValue =
            this.translationValues.find((translationValue: StorageTranslationValue) => translationValue.key === key);
        return translationValue?.value;
    }

    get language(): string {
        return this._language;
    }
}

class StorageTranslationValue {
    key: string;
    value: string;

    constructor(key: string, value: string) {
        this.key = key;
        this.value = value;
    }
}