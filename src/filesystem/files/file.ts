export interface LanguageFileArgs {
    code: string;
    translations: Record<string, string>;
}

export abstract class LanguageFile {
    public constructor(protected args: LanguageFileArgs) {
        //
    }

    public abstract getName(): string;

    public abstract getPath(root: string): string;

    public getFullPath(root: string): string {
        return `${this.getPath(root)}/${this.getName()}`;
    }

    public abstract getContent(): string;
}

export abstract class LanguageFileList {
    public constructor(protected args: LanguageFileArgs) {
        //
    }

    public getFiles(): LanguageFile[] {
        return [];
    }
}