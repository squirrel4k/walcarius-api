import { Injectable } from "@nestjs/common";
import { LoaderMongo } from "../../../core/dataloader/mongo/mongo.loader";
import { QuoteProject } from "../interfaces/quote-project.interface";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { LoaderManager } from "../../../core/dataloader/loader.manager";

@Injectable()
export class QuoteProjectLoader {

    public readonly name: string;

    public constructor (
        @InjectModel("projects") private readonly _quoteProjectModel: Model<QuoteProject>
    ) {
        this.name = "projects";
    }

    public get(uuid: string): LoaderMongo<QuoteProject> {
        let loader = LoaderManager.Mngr.get<LoaderMongo<QuoteProject>>(uuid, this.name);

        if (!loader) {
            loader = LoaderMongo.Create(this.name, this.findByIds.bind(this));
            LoaderManager.Mngr.set(uuid, loader);
        }

        return loader;
    }

    private async findByIds(ids: string[]): Promise<QuoteProject[]> {
        if (!ids || ids.length == 0) { return []; }

        // Aggregation stages preparation
        const objIds: Types.ObjectId[] = ids.map(id => Types.ObjectId(id));
        const match = { "$match": { "_id": { "$in": objIds } } };
        const addFields = { "$addFields": { "__order": { "$indexOfArray": [objIds, "$_id"] } } };
        const sort = { "$sort": { "__order": 1 } };

        const quoteProjects = await this._quoteProjectModel.aggregate([match, addFields, sort]);
        return ids.map(id => quoteProjects.find(project => project._id.toString() == id));
    }
}