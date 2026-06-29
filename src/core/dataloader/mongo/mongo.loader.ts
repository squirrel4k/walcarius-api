import DataLoader from "dataloader";
import { Loader } from "../base.loader";

export type MongoGetByIds<T> = (ids: string[]) => Promise<T[]>;

/**
 * @description Mongo Variant for the loader helper using dataloader
 * @author Houtekiet Yves
 * @export
 * @class MongoLoader
 * @extends {Loader<string, T>}
 * @template T
 */
export class LoaderMongo<T> extends Loader<string, T> {

    public static Create<T>(name: string, getByIds: MongoGetByIds<T>, options?: DataLoader.Options<string, T>): LoaderMongo<T> {
        return new this(name, getByIds, options);
    }

    private constructor(name: string, getByIds: MongoGetByIds<T>, options?: DataLoader.Options<string, T>) {
        super(name, getByIds, options);
    }
}