


export class Translation {

    private readonly _key: string;

    private readonly _values: TranslationValue[];

    constructor(responseObject: any) {
        this._key = responseObject.key;
        this._values = responseObject.translationValues.map((translation: any) => {
            return new TranslationValue(translation);
        });
    }

    get values(): TranslationValue[] {
        return this._values;
    }

    get key(): string {
        return this._key;
    }
}

class TranslationValue {

    language: string;
    value: string;

    constructor(responseObject: any) {
        this.language = responseObject.language;
        this.value = responseObject.value;
    }
}