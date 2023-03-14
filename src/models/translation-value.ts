export class TranslationValue {
    public readonly language: string;

    public readonly value: string;

    constructor(data: any) {
        this.language = data.language;
        this.value = data.value;
    }
}