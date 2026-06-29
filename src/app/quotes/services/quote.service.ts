import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Quote, SortQuote, InputQuote, UpdateQuote, QuoteElement, QuoteSortBy, DisplayQuote } from "../interfaces/quote.interface";
import { Model } from "mongoose";
import { QuoteProjectService } from "./quote-project.service";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { QuoteProject } from "../interfaces/quote-project.interface";
import { RESUME_FIELDS } from "./resume.config";
import { QuoteLoader } from "../loaders/quote.loader";
import { QuoteByQuoteProjectLoader } from "../loaders/quote-by-quote-project.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { StringUtil } from "../../../core/utils/string.util";
import { DisplayQuoteByQuoteProjectLoader } from "../loaders/display-quote-by-quote-project.loader";

@Injectable()
export class QuoteService {

    public constructor(
        @InjectModel("quotes") private readonly _quoteModel: Model<Quote>,
        private readonly _quoteProjectSrv: QuoteProjectService,
        private readonly _quoteLoader: QuoteLoader,
        private readonly _quoteByQuoteProjectLoader: QuoteByQuoteProjectLoader,
        private readonly _displayQuoteByQuoteProjectLoader: DisplayQuoteByQuoteProjectLoader
    ) { }

    /**
     * @description Get last quoteNumber from database
     * @author Quentin Wolfs
     * @param {string} search
     * @returns {Promise<string>}
     * @memberof QuoteService
     */
    public async getLastQuoteNumber(search: string): Promise<string> {
        try {
            const match = { "$match": { "number": { "$regex": search } } };
            const sort = { "$sort": { "number": -1 } };
            const limit = { "$limit": 1 };

            const lastQuote = await this._quoteModel.aggregate([match, sort, limit]);
            return lastQuote.map(quote => quote.number).pop();
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a list of quotes by their ids
     * @author Quentin Wolfs
     * @param {string[]} ids
     * @param {string} uuid
     * @returns {Promise<Quote[]>}
     * @memberof QuoteService
     */
    public async getByIds(ids: string[], uuid: string): Promise<Quote[]> {
        try {
            return this._quoteLoader.get(uuid).load(ids);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Lists available Quotes matching a search pattern
     * @author Quentin Wolfs
     * @param {Pagination} pagination
     * @param {SortQuote} sort
     * @param {string} search
     * @param {string} uuid
     * @returns {Promise<Quote[]>}
     * @memberof QuoteService
     */
    public async list(pagination: Pagination, sort: SortQuote, search: string, uuid: string): Promise<Quote[]> {
        try {
            const ids = await this.searchIds(search ? search : "", sort);
            const usedIds = ids.slice((pagination.page - 1) * pagination.limit, pagination.page * pagination.limit);
            if (usedIds.length == 0) { return []; }

            // return this._quoteLoader.get(uuid).load(usedIds);
            return this._quoteLoader.get(uuid).load(usedIds);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get a quote by its id
     * @author Quentin
     * @param {string} _id
     * @param {string} uuid
     * @returns {Promise<Quote>}
     * @memberof QuoteService
     */
    public async getById(_id: string, uuid: string): Promise<Quote> {
        try {
            return this._quoteLoader.get(uuid).load(_id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create a new quote
     * @author Quentin
     * @param {InputQuote} quote
     * @returns {Promise<Quote>}
     * @memberof QuoteService
     */
    public async create(quote: InputQuote): Promise<Quote> {
        try {
            if (!quote.createdAt) { quote.createdAt = new Date().getTimeSeconds(); }
            quote.updatedAt = quote.createdAt;

            return await this._quoteModel.create(quote);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Updates an existing quote
     * @author Quentin
     * @param {UpdateQuote} quote
     * @param {string} _id
     * @returns {Promise<Quote>}
     * @memberof QuoteService
     */
    public async update(quote: UpdateQuote, _id: string): Promise<Quote> {
        try {
            quote.updatedAt = new Date().getTimeSeconds();
            return await this._quoteModel.findOneAndUpdate({ _id }, quote, { "new": true });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete (by default : softly) a Quote
     * @author Quentin
     * @param {string} _id
     * @param {boolean} [hard]
     * @returns {Promise<boolean>}
     * @memberof QuoteService
     */
    public async delete(_id: string, hard?: boolean): Promise<boolean> {
        try {
            if (hard) {
                return await this._quoteModel.deleteOne({ _id });
            } else {
                const deleted = await this._quoteModel.findOneAndUpdate(
                    { _id }, { "deletedAt": new Date().getTimeSeconds() }, { "new": true }
                );

                return deleted.deletedAt != 0;
            }
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Returns the quotes linked to a project
     * @author Quentin
     * @param {string} projectId
     * @param {string} uuid
     * @returns {Promise<Quote[]>}
     * @memberof QuoteService
     */
    public async getQuotesOfProject(projectId: string, uuid: string): Promise<Quote[]> {
        try {
            return this._quoteByQuoteProjectLoader.get(uuid).load(projectId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Search for quotes ids matching the pattern
     * @author Quentin
     * @param {string} search
     * @param {SortQuote} sortParams
     * @returns {Promise<string[]>}
     * @memberof QuoteService
     */
    public async searchIds(search: string, sortParams: SortQuote): Promise<string[]> {
        try {
            const list = await this._quoteModel.aggregate(this.getListAggregateStages(search, sortParams));
            if (list.length == 0) { return []; }

            return list.map(quote => quote._id.toString());
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Returns the aggregation stages of the list
     * @author Quentin
     * @private
     * @param {string} search
     * @param {SortQuote} sortParams
     * @returns
     * @memberof QuoteService
     */
    private getListAggregateStages(search: string, sortParams: SortQuote, pagination?: Pagination, forDisplay?: boolean) {
        const stages = [];
        if (!!search && search.length > 0) {
            const regex = new RegExp(`.*${StringUtil.escapeRegex(search)}.*`, "i");
            // Join projects collection
            stages.push({ "$lookup": {
                from: "projects",
                localField: "projectId",
                foreignField: "_id",
                as: "project"
            } });
            // Unwind project to access its values
            stages.push({ $unwind: "$project" });
            // Match regex in different searched fields
            stages.push({ $match: {
                $or: [
                    { "name": { $regex: regex } },
                    { "reference": { $regex: regex } },
                    { "number": { $regex:  regex } },
                    { "project.name": { $regex: regex } },
                    { "project.reference": { $regex: regex } },
                    { "project.customer": { $regex: regex } },
                ],
                "deletedAt": { $not: { $gt : 0 } }
            } });
            if (forDisplay) {
                // Restrict returned fields to only have displayed fields
                stages.push({ $project: {
                    "_id": 1,
                    "name": 1,
                    "number": 1,
                    "reference": 1,
                    "isEn1090": 1,
                    "createdAt": 1,
                    "projectId": 1
                } });
            }
        }
        if (sortParams) {
            stages.push({ $sort: { [QuoteSortBy[sortParams.sortBy]]: sortParams.sortDirection == "ASC" ? 1 : -1 } });
        }
        if (!!pagination && !!pagination.page && !!pagination.limit) {
            stages.push({ $skip: (pagination.page - 1) * pagination.limit });
            stages.push({ $limit: pagination.limit });
        }

        return stages;
    }

    /**
     * @description Duplicate an existing quote and assign a selected quote number
     * @author Quentin Wolfs
     * @param {string} _id
     * @param {string} newNumber
     * @param {string} uuid
     * @returns {Promise<Quote>}
     * @memberof QuoteService
     */
    public async duplicate(_id: string, newNumber: string, uuid: string): Promise<Quote> {
        try {
            const baseQuote = await this.getById(_id, uuid);
            delete baseQuote._id;
            baseQuote.number = newNumber;

            return await this.create(baseQuote);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /******************
     *    PDF DATA    *
     ******************/

     /**
     * @description Generate the data for the work_resume pdf
     * @author Quentin Wolfs
     * @param {string} _id
     * @param {string} uuid
     * @returns {Promise<{ quote: Quote, resume: { [className: string]: number }}>}
     * @memberof QuoteService
     */
    public async getWorkResumeData(_id: string, uuid: string): Promise<{ quote: Quote, resume: { [className: string]: number }}> {
        try {
            const quote: Quote = await this.getById(_id, uuid);
            const project: QuoteProject = await this._quoteProjectSrv.getById(quote.projectId, uuid);
            quote.project = project;

            return { quote: quote, resume: this.sortQuoteByWorkType(quote) };
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Sorts & filter the quoteElements to have the price by each work type
     * @author Quentin Wolfs
     * @private
     * @param {Quote} quote
     * @returns {{ [className: string]: number }}
     * @memberof QuoteService
     */
    private sortQuoteByWorkType(quote: Quote): { [className: string]: number } {
        let key: string;
        let resume: { [className: string]: number } = {};
        RESUME_FIELDS.forEach(field => resume[field] = 0);

        if (quote.elements && quote.elements.length > 0) {
            quote.elements.forEach(element => {
                key = element.useClass;
                if (RESUME_FIELDS.indexOf(key) != -1) {
                    resume[key] += element.quantity * element.unitPrice;
                }
                if (element.children.length > 0) {
                    resume = this.computeChildren(resume, element);
                }
            });
        }

        return resume;
    }

    /**
     * @description Compute a children QuoteElement
     * @author Quentin Wolfs
     * @private
     * @param {{ [ className: string ]: number }} resume
     * @param {QuoteElement} element
     * @returns {{ [className: string]: number }}
     * @memberof QuoteService
     */
    private computeChildren(resume: { [ className: string ]: number }, element: QuoteElement): { [className: string]: number } {
        element.children.forEach(child => {
            if (child.additionalComputings && child.additionalComputings.length > 0) {
                // Custom element
                resume = this.computeCustom(resume, element.quantity, child);
            } else {
                // Operation / Assemblage
                resume = this.computeManipulations(resume, element.quantity, child);
            }
        });

        return resume;
    }

    /**
     * @description Compute a Custom element
     * @author Quentin Wolfs
     * @private
     * @param {{ [className: string]: number }} resume
     * @param {number} elementQuantity
     * @param {QuoteElement} custom
     * @returns {{ [className: string]: number }}
     * @memberof QuoteService
     */
    private computeCustom(resume: { [className: string]: number }, elementQuantity: number, custom: QuoteElement): { [className: string]: number } {
        let key: string;
        if (custom.useClass == "Equerre" && custom.content && custom.content.properties) {
            resume["Folding"] += elementQuantity * custom.quantity * custom.content.properties.foldingPrice;
        }
        custom.additionalComputings.forEach(computing => {
            key = computing.useClass;
            if (RESUME_FIELDS.indexOf(key) != -1) {
                resume[key] += elementQuantity * custom.quantity * computing.unitPrice;
            }
        });
        return resume;
    }

    /**
     * @description Compute either an Operation or Assemblage element
     * @author Quentin Wolfs
     * @private
     * @param {{ [className: string]: number }} resume
     * @param {number} elementQuantity
     * @param {QuoteElement} manip
     * @returns {{ [className: string]: number }}
     * @memberof QuoteService
     */
    private computeManipulations(resume: { [className: string]: number }, elementQuantity: number, manip: QuoteElement): { [className: string]: number } {
        let key: string = manip.useClass;
        if (RESUME_FIELDS.indexOf(key) != -1) {
            // Need to split laser & standard drilling
            if (key == "Drilling") {
                key = manip.content.properties.isCalculated ? "LaserDrilling" : key;
            }
            resume[key] += elementQuantity * manip.quantity * manip.unitPrice;
        }

        return resume;
    }

    /**
     * @description Get "DisplayQuote" (quotes without the detail) for each linked ProjectId using DataLoader
     * @author Quentin Wolfs
     * @param {string} quoteProjectId
     * @param {string} uuid
     * @returns {Promise<DisplayQuote[]>}
     * @memberof QuoteService
     */
    public async getDisplayQuotesByProject(quoteProjectId: string, uuid: string): Promise<DisplayQuote[]> {
        try {
            return await this._displayQuoteByQuoteProjectLoader.get(uuid).load(quoteProjectId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Lists available DisplayQuotes matching a search pattern
     * @author Quentin Wolfs
     * @param {Pagination} pagination
     * @param {SortQuote} sort
     * @param {string} search
     * @param {string} uuid
     * @returns {Promise<Quote[]>}
     * @memberof QuoteService
     */
    public async displayedList(pagination: Pagination, sort: SortQuote, search: string): Promise<DisplayQuote[]> {
        try {
            return await this._quoteModel.aggregate(this.getListAggregateStages(search, sort, pagination, true));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}