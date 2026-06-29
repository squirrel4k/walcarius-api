import { Injectable } from "@nestjs/common";
import { Repository, In, FindManyOptions } from "typeorm";
import { BaseSqlLoader } from "./base-sql.loader";

/**
 * @description
 * @author Quentin Wolfs
 * @export
 * @class ManyToManySqlLoader
 * @extends {BaseSqlLoader<U[]>}
 * @template T Base repository Entity
 * @template U Linked entity that is returned
 */
@Injectable()
export class ManyToManySqlLoader<T, U> extends BaseSqlLoader<U[]> {

    private _linkRelation: string;
    private _params: FindManyOptions<T>;

    public constructor (
        private readonly _repository: Repository<T>,
        name: string,
        linkRelation: string,
        params?: FindManyOptions<T>
    ) {
        super(name);
        this._linkRelation = linkRelation;
        this._params = params;
    }

    protected async findByIds(ids: number[]): Promise<U[][]> {
        const params = this._params ? this._params : { where: {} };
        (params.where as Record<string, unknown>)["id"] = In(ids);
        (params as any).relations = { [this._linkRelation]: true };

        const elements = await this._repository.find(params);

        return ids.map(id => {
            const foundElement = elements.find((element: any) => element.id == id);
            return foundElement ? foundElement[this._linkRelation] : [];
        });
    }
}