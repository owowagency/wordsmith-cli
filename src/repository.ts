import axios from "axios";
import {Config} from "./config";

const fs = require("fs");
const _ = require('lodash');

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
        let projectTranslations: Object[] = await this.getProjectTranslations();

        let a = 2;
    }

    private async getProjectTranslations(): Promise<Object[]> {
        let translations: Object[] = [];

        try {
            const {data} = await axios.get('http://localhost:8000/projects/1/translations');

            if (! _.isEmpty(data)) {
                data.data.forEach((translation: any) => {
                    translations.push(translation);
                });
            }
        } catch (error) {
            console.error('Error fetching translations: ' + error);
        }

        return translations;
    }
}