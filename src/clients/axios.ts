import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import axios from 'axios';
import type FormData from 'form-data';
import HttpClient from '@/contracts/client';

export default class Axios extends HttpClient {
    private client: AxiosInstance;

    constructor(config: Config) {
        super(config);

        this.client = axios.create({
            baseURL: this.apiUrl,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`,
            },
        });
    }

    get<T>(url: string, params?: Record<string, unknown> | undefined): Promise<T> {
        return this.client.get<T>(url, { params }).then(response => response.data);
    }

    post<T>(url: string, data?: Record<string, unknown> | undefined | FormData, headers?: AxiosRequestConfig['headers']): Promise<T> {
        return this.client.post<T>(url, { data }, { headers }).then(response => response.data);
    }
}
