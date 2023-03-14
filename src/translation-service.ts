import {Config, PullOptions} from "./misc/config.js";
import axios from "axios";
import {TranslationList} from './models/translation.js';

export class TranslationService {
    private config: Config;

    constructor() {
        this.config = new Config();
    }

    public async pull(options: PullOptions): Promise<TranslationList> {
        const response = await axios.get(this.getPullUrl(options), {
            headers: {
                Authorization: `Bearer ${this.config.get("apiKey")}`,
            },
        });

        if (response.status !== 200) {
            throw new Error(`Pull failed with status code ${response.status}`);
        }

        return new TranslationList(response.data.data);
    }

    public push() {
        // TODO
    }

    public getPullUrl(options: PullOptions) {
        const baseUrl = `${this.getApiUrl()}/projects/${this.config.get('projectId')}/translations/pull`;

        const query = new URLSearchParams();

        if (options.tags) {
            query.append('filters[tags.name]', options.tags.join(','));
        }

        if (options.languages) {
            query.append('filters[translation_values.language]', options.languages.join(','));
        }

        return `${baseUrl}?${query.toString()}`;
    }

    public getPushUrl(projectId: string) {
        return `${this.getApiUrl()}/projects/${projectId}/translations/push`;
    }

    public getApiUrl() {
        return this.config.get("apiUrl");
    }
}