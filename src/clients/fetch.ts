import fetch from 'node-fetch';
import FormData from 'form-data';
import HttpClient from '@/contracts/client';

export default class Fetch extends HttpClient {
    async get<T = Response>(url: string, params?: Record<string, unknown>) {
        return fetch(this.getUrl(url, params), {
            method: 'GET',
            headers: this.headers,
        }) as Promise<T>;
    }

    async post<T = Response>(url: string, data?: Record<string, unknown> | FormData) {
        return fetch(this.getUrl(url), {
            method: 'POST',
            headers: this.headers,
            body: data instanceof FormData ? data : JSON.stringify(data),
        }) as Promise<T>;
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.config.apiKey}`,
            Accept: 'application/json',
        };
    }

    private getUrl(url: string, params?: Record<string, unknown>) {
        return [
            this.apiUrl,
            url.startsWith('/') ? url : `/${url}`,
            params ? '?' : '',
            params ? new URLSearchParams(params as Record<string, string>) : '',
        ].join('');
    }
}
