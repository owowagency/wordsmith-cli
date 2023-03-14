export abstract class List<T> implements Iterable<T> {
    public readonly items: T[];

    constructor(data: any) {
        this.items = data.map((item: any) => this.createItem(item));
    }

    [Symbol.iterator](): Iterator<T> {
        return this.items[Symbol.iterator]();
    }

    // implementation of Iterable interface's forEach method
    forEach(callback: (value: T, index: number, array: T[]) => void) {
        this.items.forEach(callback);
    }

    protected abstract createItem(data: any): T;
}