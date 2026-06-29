import * as DataLoader from "dataloader";

type LoadKey<T> = T[] | T;

/**
 * @description A Loader is a helper to use dataloader lib
 * @author Houtekiet Yves
 * @export
 * @abstract
 * @class Loader
 * @template K type for the key used to load a value (i.e number in SQL since we use id)
 * @template V type for the value we will retrieve with this loader
 */
export abstract class Loader<K, V> {

    /**
     * @description Instance of the dataloader
     * @private
     * @type {DataLoader<K, V>}
     * @memberof Loader
     */
    private _dataloader: DataLoader<K, V>;

    public constructor(
        public readonly name: string,
        public readonly getByIds: (ids: K[]) => Promise<V[]>,
        protected _options?: DataLoader.Options<K, V>
    ) {
        this._dataloader = new DataLoader<K, V>(this.getByIds, this._options);
    }

    /**
     * @description Call to the load method from dataloader instance
     * @author Houtekiet Yves
     * @param {LoadKey<K>} ids
     * @returns {(Promise<V[] | V>)}
     * @memberof Loader
     */
    public async load<T extends LoadKey<K>>(ids: T): Promise<T extends Array<K> ? V[] : V> {
        if (Array.isArray(ids) && ids.length == 0) {
            throw new Error("There is no IDs in request.");
        }

        return <any>(Array.isArray(ids) ? await this._dataloader.loadMany(ids) : await this._dataloader.load(<K>ids));
    }

    /**
     * @description Clear items by id in dataloader cache
     * @author Houtekiet Yves
     * @param {LoadKey<K>} ids
     * @memberof Loader
     */
    public clear(ids: LoadKey<K>): void {
        if (Array.isArray(ids)) {
            if (ids.length == 0) { throw new Error("There is no IDs in request."); }
            ids.forEach(id => { this._dataloader.clear(id); });
        } else {
            this._dataloader.clear(ids);
        }
    }
}