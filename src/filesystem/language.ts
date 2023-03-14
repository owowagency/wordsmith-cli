import {PullOptions, TranslationType} from "../misc/config.js";
import {I18NextList, JsonList, LanguageFileList, LaravelList} from "./files/index.js";

interface LanguageOptions {
    code: string;
    translations: Record<string, string>;
    options: PullOptions;
}

export class Language {
    protected list: LanguageFileList;

    constructor(protected args: LanguageOptions) {
        this.list = this.makeList();
    }

    public getList() {
        return this.list;
    }

    public getFiles() {
        return this.list.getFiles();
    }

    private makeList() {
        switch (this.args.options.type) {
            case TranslationType.JSON:
                return new JsonList(this.args);
            case TranslationType.I18Next:
                return new I18NextList(this.args);
            case TranslationType.Laravel:
                return new LaravelList(this.args);
        }
    }
}