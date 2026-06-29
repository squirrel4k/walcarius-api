import { Injectable } from "@nestjs/common";
import { LoaderManager } from "../../../core/dataloader/loader.manager";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { SupplierOfferElementSql } from "../entities/supplier-offer-element.entity";
import { SupplierOfferElement } from "../interfaces/supplier-offer-element.interface";
import { LoaderCustom } from "../../../core/dataloader/custom.loader";

// tslint:disable-next-line:interface-over-type-literal
type LoaderKey = {
    id: number;
    supplierOfferId: number;
};

@Injectable()
export class SOElementByPossiblePRElementLoader {

    public readonly name: string;

    public constructor (
        @InjectRepository(SupplierOfferElementSql) private readonly _supplierOfferElementRepo: Repository<SupplierOfferElementSql>
    ) {
        this.name = "SOElementsByPossiblePRElement";
    }

    public get(uuid: string): LoaderCustom<LoaderKey, SupplierOfferElement[]> {
        let loader = LoaderManager.Mngr.get<LoaderCustom<LoaderKey, SupplierOfferElement[]>>(uuid, this.name);

        if (!loader) {
            loader = LoaderCustom.Create(this.name, this.findByIds.bind(this));
            LoaderManager.Mngr.set(uuid, loader);
        }

        return loader;
    }

    private async findByIds(ids: LoaderKey[]): Promise<SupplierOfferElement[][]> {
        const sqlIds: string[] = ids.map(id => `(${id.id}, ${id.supplierOfferId})`);
        const supplierOfferElements = await this._supplierOfferElementRepo.createQueryBuilder("soe")
            .where(`(soe.priceRequestElementId, soe.supplierOfferId) IN (${sqlIds.join(", ")})`)
            .getMany();

        return ids.map(id => supplierOfferElements.filter(soe => soe.priceRequestElementId == id.id && soe.supplierOfferId == id.supplierOfferId));
    }
}