import { Injectable } from "@nestjs/common";
import { LoaderMongo } from "../../../core/dataloader/mongo/mongo.loader";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { LoaderManager } from "../../../core/dataloader/loader.manager";
import { Quote, DisplayQuote } from "../interfaces/quote.interface";

@Injectable()
export class DisplayQuoteByQuoteProjectLoader {

    public readonly name: string;

    public constructor (
        @InjectModel("quotes") private readonly _quoteModel: Model<Quote>
    ) {
        this.name = "displayQuotesByQuoteProjects";
    }

    public get(uuid: string): LoaderMongo<DisplayQuote[]> {
        let loader = LoaderManager.Mngr.get<LoaderMongo<DisplayQuote[]>>(uuid, this.name);

        if (!loader) {
            loader = LoaderMongo.Create(this.name, this.findByIds.bind(this));
            LoaderManager.Mngr.set(uuid, loader);
        }

        return loader;
    }

    private async findByIds(ids: string[]): Promise<DisplayQuote[][]> {
        if (!ids || ids.length == 0) { return []; }

        // Aggregation stages preparation
        const objIds: Types.ObjectId[] = ids.map(id => Types.ObjectId(id));
        const match = { $match: {
            "projectId": { $in: objIds },
            "deletedAt": { $not: { $gt : 0 } }
        } };
        const sort = { $sort: { "updatedAt": 1 } };
        const project = { $project: {
            "_id": 1,
            "name": 1,
            "number": 1,
            "reference": 1,
            "isEn1090": 1,
            "createdAt": 1,
            "projectId": 1
        } };

        const quotes = await this._quoteModel.aggregate([match, sort, project]);

        return ids.map(id => quotes.filter(quote => quote.projectId.toString() == id));
    }
}