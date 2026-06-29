import { Injectable } from "@nestjs/common";
import { Repository, In, FindManyOptions } from "typeorm";
import { BaseSqlLoader } from "./base-sql.loader";

@Injectable()
export class OneToManySqlLoader<T> extends BaseSqlLoader<T[]> {

    private _linkProp: string;
    private _params: FindManyOptions<T>;

    public constructor (
        private readonly _repository: Repository<T>,
        name: string,
        linkProperty: string,
        params?: FindManyOptions<T>
    ) {
        super(name);
        this._linkProp = linkProperty;
        this._params = params;
    }

    protected async findByIds(ids: number[]): Promise<T[][]> {
        const params = this._params ? this._params : { where: {} };
        params.where[this._linkProp] = In(ids);

        const elements = await this._repository.find(params);

        return ids.map(id => elements.filter(element => element[this._linkProp] == id));
    }
}