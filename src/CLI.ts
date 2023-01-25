import {Repository} from "./Repository";
import {Config} from "./Config";
import {Storage} from "./Storage";
import {StorageTranslationCollection} from "./StorageTranslationCollection";
import fs from "fs";
import {TranslationCollection} from "./TranslationCollection";

/**
 * A class that contains all functionality of the CLI.
 */
export class CLI {

    /**
     * Reads translations from remote repository.
     */
    static async pull(repository: Repository, config: Config): Promise<void> {
        if (! config.isPathValid()) {
            try {
                fs.mkdirSync(config.get('translations_directory'), { recursive: true })
            } catch (error) {
                throw new Error("Invalid translations directory: " + config.get('translations_directory'));
            }
        }

        let rawProjectTranslations: Object[] = await repository.getRawProjectTranslations();

        let translationCollection: TranslationCollection = new TranslationCollection(rawProjectTranslations);

        let storage: Storage = new Storage(config.get('translations_directory'));

        storage.writeTranslationsForAllLanguages(translationCollection);
    }

    /**
     * Stores translations in remote repository.
     */
    static async push(repository: Repository, config: Config): Promise<void> {
        if (! config.isPathValid()) {
            throw new Error("Invalid translations directory: " + config.get('translations_directory'));
        }

        let storage: Storage = new Storage(config.get('translations_directory'));

        let storageTranslationCollection: StorageTranslationCollection = storage.readTranslations();

        let translationsJson: any = storageTranslationCollection.toJson();

        let success: boolean = await repository.sendRawProjectTranslations(translationsJson);

        if (! success) {
            throw new Error("Error sending translations to the server.");
        }
    }
}