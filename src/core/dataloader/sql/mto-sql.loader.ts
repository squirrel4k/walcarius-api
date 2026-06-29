import { Repository } from "typeorm";
import { BaseSqlLoader } from "./base-sql.loader";

export class ManyToOneSqlLoader<T> extends BaseSqlLoader<T> {

    public constructor (
        private readonly _repository: Repository<T>,
        name: string,
    ) {
        super(name);
    }

    protected async findByIds(ids: number[]): Promise<T[]> {
        const entities = await this._repository.createQueryBuilder()
            .whereInIds(ids)
            .getMany();

        return ids.map(id => entities.find((entity: any) => entity.id == id));
    }
}