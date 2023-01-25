import fs from "fs";

const { readFileSync, writeFileSync } = require('fs');
const pathLib = require('path');
const _ = require('lodash');

export class Config {

    readonly path: string = pathLib.join(__dirname, '..', 'config.json');

    data: any;

    constructor(path?: string) {
        if (path !== undefined) {
            this.path = path;
        }

        try {
            let dataRaw = readFileSync(this.path, 'utf8');
            this.data = JSON.parse(dataRaw);
        } catch (error) {
            console.log("Error reading config file: " + error);
        }
    }

    // TODO: split tags on comma
    get(key: string): any {
        return _.get(this.data, key);
    }

    set(key: string, value: any): void {
        if (this.data && value) {
            _.set(this.data, key, value)

            writeFileSync(this.path, JSON.stringify(this.data, null, 2), 'utf8');
        }
    }

    isConfigured(): boolean {
        return this.get('api_token') !== undefined
            && this.get('project_id') !== undefined
            && this.get('translations_directory') !== undefined
            && this.get('tags') !== undefined;
    }

    isPathValid(): boolean {
        let path = this.get('translations_directory');

        return path !== undefined && fs.existsSync(path);
    }
}