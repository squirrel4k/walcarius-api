import DataLoader from "dataloader";
import { Loader } from "../base.loader";

export type SQLGetByIds<T> = (ids: number[]) => Promise<T[]>;

/**
 * @description SQL Variant for the loader helper using dataloader
 * @author Houtekiet Yves
 * @export
 * @class LoaderSQL
 * @extends {Loader<number, T>}
 * @template T
 */
export class LoaderSQL<T> extends Loader<number, T> {

    public static Create<T>(name: string, getByIds: SQLGetByIds<T>, options?: DataLoader.Options<number, T>): LoaderSQL<T> {
        return new this(name, getByIds, options);
    }

    private constructor(name: string, getByIds: SQLGetByIds<T>, options?: DataLoader.Options<number, T>) {
        super(name, getByIds, options);
    }
}