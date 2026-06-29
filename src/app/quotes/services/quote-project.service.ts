import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuoteProjectEntity } from "../entities/quote-project.entity";
import { QuoteProject, InputQuoteProject, UpdateQuoteProject, SortQuoteProject, QuoteProjectSortBy } from "../interfaces/quote-project.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { QuoteProjectLoader } from "../loaders/quote-project.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import "../../../core/ext/date";

@Injectable()
export class QuoteProjectService {

    public constructor(
        @InjectRepository(QuoteProjectEntity)
        private readonly _quoteProjectRepo: Repository<QuoteProjectEntity>,
        private readonly _quoteProjectLoader: QuoteProjectLoader,
    ) { }

    public async create(project: InputQuoteProject): Promise<QuoteProject> {
        try {
            const now = new Date().getTimeSeconds();
            const entity = this._quoteProjectRepo.create({ ...project, createdAt: now, updatedAt: now } as any);
            const saved = await this._quoteProjectRepo.save(entity as any) as QuoteProjectEntity;
            if (!saved) { throw new InternalServerErrorException(ERROR_MESSAGE.INTERNAL_SERVER_ERROR, "Couldn't save project"); }
            return this._toInterface(saved);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async update(project: UpdateQuoteProject, _id: string): Promise<QuoteProject> {
        try {
            const id = parseInt(_id, 10);
            await this._quoteProjectRepo.update(id, { ...project, updatedAt: new Date().getTimeSeconds() });
            const updated = await this._quoteProjectRepo.findOneBy({ id });
            return this._toInterface(updated);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async delete(_id: string, hard?: boolean): Promise<boolean> {
        try {
            const id = parseInt(_id, 10);
            if (hard) {
                const result = await this._quoteProjectRepo.delete(id);
                return result.affected > 0;
            } else {
                await this._quoteProjectRepo.update(id, { deletedAt: new Date().getTimeSeconds() });
                return true;
            }
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async getById(_id: string, uuid: string): Promise<QuoteProject> {
        try {
            const entity = await this._quoteProjectLoader.get(uuid).load(parseInt(_id, 10));
            return entity ? this._toInterface(entity) : null;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async list(pagination: Pagination, sort: SortQuoteProject, search: string): Promise<QuoteProject[]> {
        try {
            const qb = this._quoteProjectRepo
                .createQueryBuilder("qp")
                .where("qp.deletedAt IS NULL");

            if (search && search.length > 0) {
                const pattern = `%${search}%`;
                qb.andWhere(
                    "(qp.name LIKE :pattern OR qp.reference LIKE :pattern OR qp.customer LIKE :pattern" +
                    " OR EXISTS (SELECT 1 FROM quotes q WHERE q.projectId = qp.id AND q.deletedAt IS NULL" +
                    " AND (q.name LIKE :pattern OR q.number LIKE :pattern OR q.reference LIKE :pattern)))",
                    { pattern }
                );
            }

            if (sort && sort.sortBy !== undefined) {
                const col = QuoteProjectSortBy[sort.sortBy] || "createdAt";
                qb.orderBy(`qp.${col}`, sort.sortDirection === "ASC" ? "ASC" : "DESC");
            }

            if (pagination && pagination.page && pagination.limit) {
                qb.skip((pagination.page - 1) * pagination.limit).take(pagination.limit);
            }

            const results = await qb.getMany();
            return results.map(e => this._toInterface(e));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    private _toInterface(entity: QuoteProjectEntity): QuoteProject {
        return {
            _id: entity._id,
            id: entity._id,
            name: entity.name,
            reference: entity.reference,
            customer: entity.customer,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt,
            quotes: [],
        } as any;
    }
}
