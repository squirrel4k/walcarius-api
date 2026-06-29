import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { QuoteProject, InputQuoteProject, UpdateQuoteProject, SortQuoteProject, QuoteProjectSortBy } from "../interfaces/quote-project.interface";
import { ERROR_MESSAGE } from "../../../core/errors/enum/error.enum";
import { Pagination } from "../../../core/interfaces/crud.interface";
import { Quote } from "../interfaces/quote.interface";
import "../../../core/ext/date";
import { QuoteProjectLoader } from "../loaders/quote-project.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { StringUtil } from "../../../core/utils/string.util";

@Injectable()
export class QuoteProjectService {

    public constructor(
        @InjectModel("projects") private readonly _quoteProjectModel: Model<QuoteProject>,
        private readonly _quoteProjectLoader: QuoteProjectLoader,
    ) { }

    /**
     * @description Create a new QuoteProject
     * @author Quentin
     * @param {InputQuoteProject} project
     * @returns {Promise<QuoteProject>}
     * @memberof QuoteProjectService
     */
    public async create(project: InputQuoteProject): Promise<QuoteProject> {
        try {
            if (!project.createdAt) { project.createdAt = new Date().getTimeSeconds(); }

            const added = await this._quoteProjectModel.create(project);
            if (!added) { throw new InternalServerErrorException(ERROR_MESSAGE.INTERNAL_SERVER_ERROR, "Couldn't save project"); }
            return added;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Updates an existing QuoteProject
     * @author Quentin
     * @param {UpdateQuoteProject} project
     * @param {string} _id
     * @returns {Promise<QuoteProject>}
     * @memberof QuoteProjectService
     */
    public async update(project: UpdateQuoteProject, _id: string): Promise<QuoteProject> {
        try {
            project.updatedAt = new Date().getTimeSeconds();
            return await await this._quoteProjectModel.findOneAndUpdate(
                { _id }, project, { "new": true }
            );
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Delete an existing QuoteProject
     * @author Quentin
     * @param {string} _id
     * @param {boolean} [hard]
     * @returns {Promise<boolean>}
     * @memberof QuoteProjectService
     */
    public async delete(_id: string, hard?: boolean): Promise<boolean> {
        try {
            if (hard) {
                return await this._quoteProjectModel.deleteOne({ _id });
            } else {
                const deleted = await this._quoteProjectModel.findOneAndUpdate(
                    { _id }, { "deletedAt": new Date().getTimeSeconds() }, { "new": true }
                );

                return deleted.deletedAt != 0;
            }
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Returns the QuoteProject corresponding to the given id, or null if not found.
     * @author Quentin
     * @param {string} _id
     * @param {string} uuid
     * @returns {Promise<QuoteProject>}
     * @memberof QuoteProjectService
     */
    public async getById(_id: string, uuid: string): Promise<QuoteProject> {
        try {
            return this._quoteProjectLoader.get(uuid).load(_id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Lists available QuoteProjects filtered by a search term
     * @author Quentin
     * @param {Pagination} pagination
     * @param {SortQuoteProject} sort
     * @param {string} uuid
     * @returns {Promise<QuoteProject[]>}
     * @memberof QuoteProjectService
     */
    public async list(pagination: Pagination, sort: SortQuoteProject, search: string): Promise<QuoteProject[]> {
        try {
            return await this._quoteProjectModel.aggregate(this.getListAggregateStages(search, sort, pagination));
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Returns the aggregation stages of the list
     * @author Quentin
     * @private
     * @param {string} search
     * @param {SortQuoteProject} sortParams
     * @param {Pagination} pagination
     * @returns
     * @memberof QuoteProjectService
     */
    private getListAggregateStages(search: string, sortParams: SortQuoteProject, pagination: Pagination) {
        const regex = new RegExp(`.*${StringUtil.escapeRegex(search)}.*`, "i");
        const stages = [];
        if (!!search && search.length > 0) {
            // Link with quotes collection
            stages.push({ $lookup: {
                from: "quotes",
                localField: "_id",
                foreignField: "projectId",
                as: "quotes"
            } });
            // Unwind quotes array to make matches available
            stages.push({ $unwind:
                {
                    path: "$quotes",
                    preserveNullAndEmptyArrays: true
                }
            });
            // Match only valid projects
            stages.push({ $match: {
                "deletedAt": { $not: { $gt: 0 } },
                $or: [
                    { $or: [
                        { "name": { $regex: regex } },
                        { "reference": { $regex: regex } },
                        { "customer": { $regex: regex } }
                    ] },
                    { $and: [
                        { "quotes": { $exists: true } },
                        { "quotes.deletedAt": { $not: { $gt: 0 } } },
                        { $or: [
                            { "quotes.number": { $regex:  regex } },
                            { "quotes.name": { $regex: regex } },
                            { "quotes.reference": { $regex: regex } }
                        ] }
                    ] }
                ]
            } });
            // Regroup projects after filter is done
            stages.push({ $group: {
                _id: "$_id",
                "name": { $first: "$name" },
                "reference": { $first: "$reference" },
                "customer": { $first: "$customer" },
                "createdAt": { $first: "$createdAt" }
            } });
        } else {
            stages.push({
                $match: {
                    "deletedAt": { $not: { $gt: 0 } }
                }
            });
        }
        if (sortParams) {
            stages.push({ $sort: { [QuoteProjectSortBy[sortParams.sortBy]]: sortParams.sortDirection == "ASC" ? 1 : -1 } });
        }
        if (pagination && pagination.limit && pagination.page) {
            stages.push({ $skip: (pagination.page - 1) * pagination.limit });
            stages.push({ $limit: pagination.limit });
        }

        return stages;
    }
}