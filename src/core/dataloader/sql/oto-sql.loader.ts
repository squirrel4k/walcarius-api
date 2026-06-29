import { Injectable } from "@nestjs/common";
import { Repository, In } from "typeorm";
import { BaseSqlLoader } from "./base-sql.loader";

@Injectable()
export class OneToOneSqlLoader<T> extends BaseSqlLoader<T> {

    private _linkProp: string;

    public constructor (
        private readonly _repository: Repository<T>,
        name: string,
        linkProperty: string
    ) {
        super(name);
        this._linkProp = linkProperty;
    }

    protected async findByIds(ids: number[]): Promise<T[]> {
        const elements = await this._repository.find({ [this._linkProp]: In(ids) });

        return ids.map(id => elements.find(element => element[this._linkProp] == id));
    }
}