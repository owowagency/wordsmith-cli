import {TranslationValue} from './translation-value.js';
import {List} from "./list.js";

export class TranslationList extends List<Translation> {
    public mapToLanguages(): Record<string, any> {
        const languages: Record<string, any> = {};

        this.forEach((translation) => {
            translation.translationValues.forEach((translationValue) => {
                if (!languages[translationValue.language]) {
                    languages[translationValue.language] = {};
                }

                languages[translationValue.language][translation.key] = translationValue.value;
            });
        });

        return languages;
    }

    protected createItem(data: any): Translation {
        return new Translation(data);
    }
}

export class Translation {
    public readonly key: string;

    public readonly tags: string[];

    public readonly translationValues: TranslationValue[];

    constructor(data: any) {
        this.key = data.key;
        this.tags = data.tags.map((tag: any) => tag.name);
        this.translationValues = data.translationValues.map((value: any) => new TranslationValue(value));
    }
}