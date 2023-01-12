import axios from "axios";
import {Config} from "./Config";
import {TranslationCollection} from "./TranslationCollection";

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
    }

    private async getRawProjectTranslations(): Promise<Object[]> {
        let data: Object[] = [];

        try {
            const response = await axios.get('http://localhost:8000/projects/1/translations');

            data = response.data.data;
        } catch (error) {
            console.error('Error fetching translations: ' + error);
        }

        return data;
    }
}