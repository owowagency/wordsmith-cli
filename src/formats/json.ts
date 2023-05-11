import Translatable from '@/contracts/translation';

export default class JSONFormat extends Translatable {
    readonly extension: string = 'json';
    readonly pattern: string = '*.json';

    serialize(records: TranslatableRecord[]): string {
        const content: Record<string, string> = {};

        for (const record of records) {
            content[record.key] = record.value;
        }

        return JSON.stringify(content, null, 4);
    }

    deserialize(content: string): TranslatableRecord[] {
        const parsed: Record<number, string> = JSON.parse(content);

        const records: TranslatableRecord[] = [];

        for (const key in parsed) {
            records.push({ key, value: parsed[key] });
        }

        return records;
    }
}
