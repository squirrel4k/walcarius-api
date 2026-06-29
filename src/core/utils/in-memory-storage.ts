/**
 * Minimal in-memory key/value store — drop-in replacement for node-localstorage.
 * All instances share the same underlying map (process-wide singleton).
 */
const _store: Map<string, string> = new Map();

export class InMemoryStorage {
    public setItem(key: string, value: string): void {
        _store.set(key, value);
    }

    public getItem(key: string): string | null {
        return _store.has(key) ? _store.get(key) : null;
    }

    public removeItem(key: string): void {
        _store.delete(key);
    }

    public clear(): void {
        _store.clear();
    }
}
