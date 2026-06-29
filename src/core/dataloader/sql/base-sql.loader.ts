import { LoaderSQL } from "./sql.loader";
import { LoaderManager } from "../loader.manager";

export abstract class BaseSqlLoader<T> {

    public readonly name: string;

    public constructor (
        name: string
    ) {
        this.name = name;
    }

    public get(uuid: string): LoaderSQL<T> {
        let loader = LoaderManager.Mngr.get<LoaderSQL<T>>(uuid, this.name);

        if (!loader) {
            loader = LoaderSQL.Create(this.name, this.findByIds.bind(this));
            LoaderManager.Mngr.set(uuid, loader);
        }

        return loader;
    }

    protected abstract findByIds(ids: number[]): Promise<T[]>;
}