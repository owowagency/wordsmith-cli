export default abstract class HttpClient {
    readonly apiToken: string;
    protected apiUrl = process.env.API_URL || '' as const;

    abstract get<T>(url: string, params?: Record<string, unknown>, headers?: Record<string, string>): Promise<T>;

    abstract post<T>(url: string, data?: Record<string, unknown>, headers?: Record<string, string>): Promise<T>;

    constructor(apiToken: string) {
        if (!this.apiUrl) {
            throw new Error('Api url is not defined!');
        }
        this.apiToken = apiToken;
    }
}
