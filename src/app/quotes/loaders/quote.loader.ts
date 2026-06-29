import { Injectable } from "@nestjs/common";
import { LoaderMongo } from "../../../core/dataloader/mongo/mongo.loader";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { LoaderManager } from "../../../core/dataloader/loader.manager";
import { Quote } from "../interfaces/quote.interface";

@Injectable()
export class QuoteLoader {

    public readonly name: string;

    public constructor (
        @InjectModel("quotes") private readonly _quoteModel: Model<Quote>
    ) {
        this.name = "quotes";
    }

    public get(uuid: string): LoaderMongo<Quote> {
        let loader = LoaderManager.Mngr.get<LoaderMongo<Quote>>(uuid, this.name);

        if (!loader) {
            loader = LoaderMongo.Create(this.name, this.findByIds.bind(this));
            LoaderManager.Mngr.set(uuid, loader);
        }

        return loader;
    }

    private async findByIds(ids: string[]): Promise<Quote[]> {
        if (!ids || ids.length == 0) { return []; }

        // Aggregation stages preparation
        const objIds: Types.ObjectId[] = ids.map(id => Types.ObjectId(id));
        const match = { "$match": { "_id": { "$in": objIds } } };
        const addFields = { "$addFields": { "__order": { "$indexOfArray": [objIds, "$_id"] } } };
        const sort = { "$sort": { "__order": 1 } };

        return this._quoteModel.aggregate([match, addFields, sort]);
    }
}