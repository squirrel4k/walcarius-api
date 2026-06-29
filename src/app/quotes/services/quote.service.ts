import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { QuoteEntity } from "../entities/quote.entity";
import { Quote, SortQuote, InputQuote, UpdateQuote, DisplayQuote, QuoteSortBy } from "../interfaces/quote.interface";
import { QuoteProjectService } from "./quote-project.service";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { QuoteProject } from "../interfaces/quote-project.interface";
import { RESUME_FIELDS } from "./resume.config";
import { QuoteLoader } from "../loaders/quote.loader";
import { QuoteByQuoteProjectLoader } from "../loaders/quote-by-quote-project.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { StringUtil } from "../../../core/utils/string.util";

@Injectable()
export class QuoteService {

    public constructor(
        @InjectRepository(QuoteEntity)
        private readonly _quoteRepo: Repository<QuoteEntity>,
        private readonly _quoteProjectSrv: QuoteProjectService,
        private readonly _quoteLoader: QuoteLoader,
        private readonly _quoteByQuoteProjectLoader: QuoteByQuoteProjectLoader,
    ) { }

    public async getLastQuoteNumber(search: string): Promise<string> {
        try {
            // search uses MYSQL wildcard '_' (single char), convert to LIKE pattern
            const likePattern = search.replace(/_/g, "_");
            const result = await this._quoteRepo
                .createQueryBuilder("q")
                .select("q.number")
                .where("q.number LIKE :pattern", { pattern: likePattern })
                .orderBy("q.number", "DESC")
                .limit(1)
                .getOne();
            return result ? result.number : null;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async getByIds(ids: string[], uuid: string): Promise<Quote[]> {
        try {
            const numIds = ids.map(id => parseInt(id, 10));
            return (await this._quoteLoader.get(uuid).load(numIds)).map(e => this._toInterface(e));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async list(pagination: Pagination, sort: SortQuote, search: string, uuid: string): Promise<Quote[]> {
        try {
            const ids = await this.searchIds(search, sort);
            const usedIds = ids.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);
            if (usedIds.length === 0) { return []; }
            const entities = await this._quoteLoader.get(uuid).load(usedIds);
            return (entities as QuoteEntity[]).map(e => this._toInterface(e));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async getById(_id: string, uuid: string): Promise<Quote> {
        try {
            const entity = await this._quoteLoader.get(uuid).load(parseInt(_id, 10));
            return entity ? this._toInterface(entity as QuoteEntity) : null;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async create(quote: InputQuote): Promise<Quote> {
        try {
            const now = new Date().getTimeSeconds();
            const entity = this._quoteRepo.create({
                name: quote.name,
                number: quote.number,
                reference: quote.reference,
                isEn1090: quote.isEn1090,
                projectId: parseInt(quote.projectId, 10),
                status: quote.status as number || 0,
                needSandblasting: quote.needSandblasting || false,
                needMetallization: quote.needMetallization || false,
                needLacquering: quote.needLacquering || false,
                needPainting: quote.needPainting || false,
                needGalvanization: quote.needGalvanization || false,
                remarks: quote.remarks,
                totalPrice: quote.totalPrice,
                elements: quote.elements || [],
                createdAt: quote.createdAt || now,
                updatedAt: now,
            });
            const saved = await this._quoteRepo.save(entity);
            return this._toInterface(saved);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async update(quote: UpdateQuote, _id: string): Promise<Quote> {
        try {
            const id = parseInt(_id, 10);
            await this._quoteRepo.update(id, {
                name: quote.name,
                number: quote.number,
                reference: quote.reference,
                isEn1090: quote.isEn1090,
                projectId: quote.projectId ? parseInt(quote.projectId, 10) : undefined,
                needSandblasting: quote.needSandblasting,
                needMetallization: quote.needMetallization,
                needLacquering: quote.needLacquering,
                needPainting: quote.needPainting,
                needGalvanization: quote.needGalvanization,
                remarks: quote.remarks,
                totalPrice: quote.totalPrice,
                elements: quote.elements || [],
                updatedAt: new Date().getTimeSeconds(),
            });
            const updated = await this._quoteRepo.findOne(id);
            return this._toInterface(updated);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async delete(_id: string, hard?: boolean): Promise<boolean> {
        try {
            const id = parseInt(_id, 10);
            if (hard) {
                const result = await this._quoteRepo.delete(id);
                return result.affected > 0;
            } else {
                await this._quoteRepo.update(id, { deletedAt: new Date().getTimeSeconds() });
                return true;
            }
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async getQuotesOfProject(projectId: string, uuid: string): Promise<Quote[]> {
        try {
            const entities = await this._quoteByQuoteProjectLoader.get(uuid).load(parseInt(projectId, 10));
            return (entities as QuoteEntity[]).map(e => this._toInterface(e));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async searchIds(search: string, sortParams: SortQuote): Promise<number[]> {
        try {
            const qb = this._quoteRepo
                .createQueryBuilder("q")
                .select("q.id", "id")
                .where("q.deletedAt IS NULL");

            if (search && search.length > 0) {
                const pattern = `%${StringUtil.escapeRegex(search)}%`;
                qb.leftJoin("quote_projects", "qp", "qp.id = q.projectId")
                  .andWhere(
                    "(q.name LIKE :pattern OR q.reference LIKE :pattern OR q.number LIKE :pattern" +
                    " OR qp.name LIKE :pattern OR qp.reference LIKE :pattern OR qp.customer LIKE :pattern)",
                    { pattern }
                  );
            }

            if (sortParams && sortParams.sortBy !== undefined) {
                const col = QuoteSortBy[sortParams.sortBy] || "createdAt";
                qb.orderBy(`q.${col}`, sortParams.sortDirection === "ASC" ? "ASC" : "DESC");
            }

            const rows = await qb.getRawMany();
            return rows.map(r => r.id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async duplicate(_id: string, newNumber: string, uuid: string): Promise<Quote> {
        try {
            const baseQuote = await this.getById(_id, uuid);
            const input: InputQuote = {
                name: baseQuote.name,
                number: newNumber,
                reference: baseQuote.reference,
                isEn1090: baseQuote.isEn1090,
                projectId: baseQuote.projectId,
                status: baseQuote.status,
                needSandblasting: baseQuote.needSandblasting,
                needMetallization: baseQuote.needMetallization,
                needLacquering: baseQuote.needLacquering,
                needPainting: baseQuote.needPainting,
                needGalvanization: baseQuote.needGalvanization,
                remarks: baseQuote.remarks,
                totalPrice: baseQuote.totalPrice,
                elements: baseQuote.elements as any,
            };
            return this.create(input);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async getWorkResumeData(_id: string, uuid: string): Promise<{ quote: Quote, resume: { [className: string]: number } }> {
        try {
            const quote: Quote = await this.getById(_id, uuid);
            const project: QuoteProject = await this._quoteProjectSrv.getById(quote.projectId, uuid);
            quote.project = project;
            return { quote, resume: this.sortQuoteByWorkType(quote) };
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async getDisplayQuotesByProject(quoteProjectId: string, uuid: string): Promise<DisplayQuote[]> {
        try {
            const entities = await this._quoteByQuoteProjectLoader.get(uuid).load(parseInt(quoteProjectId, 10));
            return (entities as QuoteEntity[]).map(e => ({
                _id: e._id,
                name: e.name,
                number: e.number,
                reference: e.reference,
                isEn1090: e.isEn1090,
                projectId: e.projectId?.toString(),
            }));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    public async displayedList(pagination: Pagination, sort: SortQuote, search: string): Promise<DisplayQuote[]> {
        try {
            const qb = this._quoteRepo
                .createQueryBuilder("q")
                .select(["q.id", "q.name", "q.number", "q.reference", "q.isEn1090", "q.projectId", "q.createdAt"])
                .where("q.deletedAt IS NULL");

            if (search && search.length > 0) {
                const pattern = `%${StringUtil.escapeRegex(search)}%`;
                qb.leftJoin("quote_projects", "qp", "qp.id = q.projectId")
                  .andWhere(
                    "(q.name LIKE :pattern OR q.reference LIKE :pattern OR q.number LIKE :pattern" +
                    " OR qp.name LIKE :pattern OR qp.reference LIKE :pattern OR qp.customer LIKE :pattern)",
                    { pattern }
                  );
            }

            if (sort && sort.sortBy !== undefined) {
                const col = QuoteSortBy[sort.sortBy] || "createdAt";
                qb.orderBy(`q.${col}`, sort.sortDirection === "ASC" ? "ASC" : "DESC");
            }

            if (pagination && pagination.page && pagination.limit) {
                qb.skip((pagination.page - 1) * pagination.limit).take(pagination.limit);
            }

            const results = await qb.getMany();
            return results.map(e => ({
                _id: e._id,
                name: e.name,
                number: e.number,
                reference: e.reference,
                isEn1090: e.isEn1090,
                projectId: e.projectId?.toString(),
            }));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    private _toInterface(entity: QuoteEntity): Quote {
        return {
            _id: entity._id,
            id: entity._id,
            name: entity.name,
            number: entity.number,
            reference: entity.reference,
            isEn1090: entity.isEn1090,
            projectId: entity.projectId?.toString(),
            status: entity.status,
            needSandblasting: entity.needSandblasting,
            needMetallization: entity.needMetallization,
            needLacquering: entity.needLacquering,
            needPainting: entity.needPainting,
            needGalvanization: entity.needGalvanization,
            remarks: entity.remarks,
            totalPrice: entity.totalPrice,
            elements: entity.elements,
            createdAt: entity.createdAt,
            updatedAt: entity.updatedAt,
            deletedAt: entity.deletedAt,
            project: null,
        } as any;
    }

    private sortQuoteByWorkType(quote: Quote): { [className: string]: number } {
        let key: string;
        let resume: { [className: string]: number } = {};
        RESUME_FIELDS.forEach(field => resume[field] = 0);

        if (quote.elements && quote.elements.length > 0) {
            quote.elements.forEach((element: any) => {
                key = element.useClass;
                if (RESUME_FIELDS.indexOf(key) !== -1) {
                    resume[key] += element.quantity * element.unitPrice;
                }
                if (element.children && element.children.length > 0) {
                    resume = this.computeChildren(resume, element);
                }
            });
        }

        return resume;
    }

    private computeChildren(resume: { [className: string]: number }, element: any): { [className: string]: number } {
        element.children.forEach((child: any) => {
            if (child.additionalComputings && child.additionalComputings.length > 0) {
                resume = this.computeCustom(resume, element.quantity, child);
            } else {
                resume = this.computeManipulations(resume, element.quantity, child);
            }
        });
        return resume;
    }

    private computeCustom(resume: { [className: string]: number }, elementQuantity: number, custom: any): { [className: string]: number } {
        if (custom.useClass === "Equerre" && custom.content && custom.content.properties) {
            resume["Folding"] += elementQuantity * custom.quantity * custom.content.properties.foldingPrice;
        }
        custom.additionalComputings.forEach((computing: any) => {
            const k = computing.useClass;
            if (RESUME_FIELDS.indexOf(k) !== -1) {
                resume[k] += elementQuantity * custom.quantity * computing.unitPrice;
            }
        });
        return resume;
    }

    private computeManipulations(resume: { [className: string]: number }, elementQuantity: number, manip: any): { [className: string]: number } {
        let key: string = manip.useClass;
        if (RESUME_FIELDS.indexOf(key) !== -1) {
            if (key === "Drilling") {
                key = manip.content.properties.isCalculated ? "LaserDrilling" : key;
            }
            resume[key] += elementQuantity * manip.quantity * manip.unitPrice;
        }
        return resume;
    }
}
