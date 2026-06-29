import { Loader } from "./base.loader";

export class LoaderManager {

    private static _instance: LoaderManager;
    public static get Mngr() { return this._instance || (this._instance = new this()); }

    private _loaders: Map<string, Loader<any, any>[]>;

    public constructor() {
        this._loaders = new Map<string, Loader<any, any>[]>();
    }

    public get<T extends Loader<any, any>>(uuid: string, name: string): T {
        const loaders = this._loaders.get(uuid);
        if (!loaders) {
            return null;
        }

        return <T>this._loaders.get(uuid).find(loader => loader.name == name);
    }

    public set(uuid: string, loader: Loader<any, any>): Loader<any, any> {
        let loaders = this._loaders.get(uuid);
        loaders = [ ...(loaders ? loaders : []), loader ];

        this._loaders.set(uuid, loaders);
        return loader;
    }

    public unset(uuid: string) {
        this._loaders.delete(uuid);
    }
}