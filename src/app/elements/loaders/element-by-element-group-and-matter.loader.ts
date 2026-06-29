import { Injectable } from "@nestjs/common";
import { LoaderManager } from "../../../core/dataloader/loader.manager";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { LoaderCustom } from "../../../core/dataloader/custom.loader";
import { ElementSql } from "../entities/element.entity";
import { Element } from "../interfaces/element.interface";

// tslint:disable-next-line:interface-over-type-literal
type LoaderKey = {
    id: number;
    matterId: number;
};

@Injectable()
export class ElementByElementGroupAndMatterLoader {

    public readonly name: string;

    public constructor (
        @InjectRepository(ElementSql) private readonly _elementRepo: Repository<ElementSql>
    ) {
        this.name = "elementsByElementGroupAndMatter";
    }

    public get(uuid: string): LoaderCustom<LoaderKey, Element[]> {
        let loader = LoaderManager.Mngr.get<LoaderCustom<LoaderKey, Element[]>>(uuid, this.name);

        if (!loader) {
            loader = LoaderCustom.Create(this.name, this.findByIds.bind(this));
            LoaderManager.Mngr.set(uuid, loader);
        }

        return loader;
    }

    private async findByIds(ids: LoaderKey[]): Promise<Element[][]> {
        const sqlIds: string[] = ids.map(id => `(${id.id}, ${id.matterId})`);
        const elements = await this._elementRepo.createQueryBuilder("e")
            .where(`(e.elementGroupId, e.matterId) IN (${sqlIds.join(", ")})`)
            .getMany();

        return ids.map(id => elements.filter(element => element.elementGroupId == id.id && element.matterId == id.matterId));
    }
}