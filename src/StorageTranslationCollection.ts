import {StorageTranslation} from "./StorageTranslation";

export class StorageTranslationCollection {

    private readonly storageTranslations: StorageTranslation[];

    constructor(storageTranslations: StorageTranslation[]) {
        this.storageTranslations = storageTranslations;
    }

    public uniqueKeys(): string[] {
        let keySet = new Set<string>();

        this.storageTranslations.forEach((storageTranslation: StorageTranslation) => {
            storageTranslation.keys().forEach((key: string) => {
                keySet.add(key);
            });
        });

        return Array.from(keySet);
    }

    public toJson(): any {
        let json: any = [];

        this.uniqueKeys().forEach((translationKey: string) => {
            json.push(this.getTranslationResponseObject(translationKey));
        });

        return json;
    }

    private getTranslationResponseObject(translationKey: string): any {
        let translationResponse: any = {};

        translationResponse['key'] = translationKey;
        translationResponse['translationValues'] =
            this.storageTranslations
                .filter((storageTranslation: StorageTranslation) => storageTranslation.getTranslationValue(translationKey) !== undefined)
                .map((storageTranslation: StorageTranslation) => {
                    return {
                        language: storageTranslation.language,
                        value: storageTranslation.getTranslationValue(translationKey),
                    };
                });

        return translationResponse;
    }
}