export enum TranslationType {
    JSON = 'json',
    I18Next = 'i18next',
    Android = 'android-strings',
    iOS = 'apple-strings',
    CSV = 'csv',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TranslationType {
    export function values(): TranslationType[] {
        return [
            TranslationType.JSON,
            TranslationType.I18Next,
            TranslationType.Android,
            TranslationType.iOS,
            TranslationType.CSV,
        ];
    }
}

export enum TargetType {
    Pull = 'pull',
    Push = 'push',
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace TargetType {
    export function values(): TargetType[] {
        return [
            TargetType.Pull,
            TargetType.Push,
        ];
    }
}
