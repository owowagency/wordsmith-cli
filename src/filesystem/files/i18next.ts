import {dot} from "../../misc/helpers.js";
import {Json, JsonList} from "./json.js";
import {LanguageFile, LanguageFileArgs} from "./file.js";

export class I18Next extends Json {
    public constructor(props: LanguageFileArgs) {
        props.translations = dot(props.translations);

        super(props);
    }


    public getContent(): string {
        return super.getContent();
    }
}

export class I18NextList extends JsonList {
    public getFiles(): LanguageFile[] {
        return [
            new I18Next(this.args),
        ];
    }
}