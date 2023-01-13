import axios from "axios";
import {Config} from "./Config";
import {TranslationCollection} from "./TranslationCollection";
import {Storage} from "./Storage";
import {StorageTranslationCollection} from "./StorageTranslationCollection";

export class Repository {

    private config: Config;

    constructor(config: Config) {
        this.config = config;

        if (! config || ! config.isConfigured()) {
            throw new Error("Please configure the CLI before using it.");
        }

        if (! config.isPathValid()) {
            throw new Error("Invalid translations directory: " + config.get('client.translations_directory'));
        }
    }

    async pull(): Promise<void> {
        let rawProjectTranslations: Object[] = await this.getRawProjectTranslations();

        let translationCollection: TranslationCollection = new TranslationCollection(rawProjectTranslations);

        let storage: Storage = new Storage(this.config.get('client.translations_directory'));

        storage.writeTranslationsForAllLanguages(translationCollection);
    }

    async push(): Promise<void> {
        let storage: Storage = new Storage(this.config.get('client.translations_directory'));

        let storageTranslationCollection: StorageTranslationCollection = storage.readTranslations();

        let translationsJson = storageTranslationCollection.toJson();

        let success: boolean = await this.sendRawProjectTranslations(translationsJson);

        if (! success) {
            throw new Error("Error sending translations to the server.");
        }
    }

    private async sendRawProjectTranslations(translationsJson: Object[]): Promise<boolean> {
        let success: boolean = false;

        try {
            const response = await axios.post('http://localhost:8000/projects/1/translations', {'translations': translationsJson});

            success = response.status === 200;
        } catch (error) {
            console.error('Error sending translations: ' + error);
        }

        return success;
    }

    private async getRawProjectTranslations(): Promise<Object[]> {
        let data: Object[] = [];

        try {
            // TODO: get rid of the constant
            // TODO: attach tags to the request
            const response = await axios.get('http://localhost:8000/projects/1/translations');

            data = response.data.data;
        } catch (error) {
            console.error('Error fetching translations: ' + error);
        }

        return data;
    }
}