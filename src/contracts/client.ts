export default abstract class HttpClient {
    protected apiUrl = process.env.API_URL || '' as const;

    protected config: Config;

    abstract get<T>(url: string, params?: Record<string, unknown>, headers?: Record<string, string>): Promise<T>;

    abstract post<T>(url: string, data?: Record<string, unknown>, headers?: Record<string, string>): Promise<T>;

    constructor(config: Config) {
        if (!this.apiUrl) {
            throw new Error('Api url is not defined!');
        }

        this.config = config;
    }
}
