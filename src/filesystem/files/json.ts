import {LanguageFile, LanguageFileList} from "./file.js";

export class Json extends LanguageFile {
    public getName(): string {
        return `${this.args.code}.json`;
    }

    public getPath(root: string): string {
        return root;
    }

    public getContent(): string {
        return JSON.stringify(this.args.translations, null, 4);
    }
}

export class JsonList extends LanguageFileList {
    public getFiles(): LanguageFile[] {
        return [
            new Json(this.args),
        ];
    }
}