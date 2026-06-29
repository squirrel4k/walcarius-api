import { Loader } from "./base.loader";
import * as DataLoader from "dataloader";

export type CustomGetByIds<K, T> = (ids: K[]) => Promise<T[]>;

export class LoaderCustom<K, T> extends Loader<K, T> {

    public static Create<K, T>(name: string, getByIds: CustomGetByIds<K, T>, options?: DataLoader.Options<K, T>): LoaderCustom<K, T> {
        return new this(name, getByIds, options);
    }

    private constructor(name: string, getByIds: CustomGetByIds<K, T>, options?: DataLoader.Options<K, T>) {
        super(name, getByIds, options);
    }
}