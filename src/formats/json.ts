import Translatable from '@/contracts/translation';

export default class JSONFormat extends Translatable {
    readonly extension: string = 'json';

    readonly pattern: string = '*.json';
}
