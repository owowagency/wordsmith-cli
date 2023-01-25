import axios from "axios";
import {Config} from "./Config";

export class Repository {

    private config: Config;

    constructor(config: Config) {
        this.config = config;

        if (! config || ! config.isConfigured()) {
            throw new Error("Please configure the CLI before using it.");
        }
    }

    async sendRawProjectTranslations(translationsJson: Object[]): Promise<boolean> {
        let success: boolean = false;

        try {
            const response = await axios.post('http://localhost:8000/projects/2/translations', {'translations': translationsJson});

            success = response.status === 200;
        } catch (error) {
            console.error('Error sending translations: ' + error);
        }

        return success;
    }

    async getRawProjectTranslations(): Promise<Object[]> {
        let data: Object[] = [];

        try {
            // TODO: get rid of the constant
            // TODO: attach tags to the request
            const response = await axios.get('http://localhost:8000/projects/2/translations');

            data = response.data.data;
        } catch (error) {
            console.error('Error fetching translations: ' + error);
        }

        return data;
    }
}