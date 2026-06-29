import { Resolver, Query, Args, ResolveField, Parent, Mutation } from "@nestjs/graphql";
import { SupplierContact, SupplierContactInput, SupplierContactUpdate } from "../interfaces/supplier-contact.interface";
import { SupplierContactService } from "../services/supplier-contact.service";
import { SupplierService } from "../services/supplier.service";
import { Supplier } from "../interfaces/supplier.interface";
import { UseInterceptors } from "@nestjs/common";
import { GqlLoggerInterceptor } from "../../common/interceptors/gql-logger.interceptor";
import { Access } from "../../../core/decorators/access.decorator";
import { GRANT_TOKEN } from "../../common/jwt/jwt.interface";
import { UUID } from "../../../core/decorators/uuid.decorator";
import { DataSource } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";

@Resolver("SupplierContact")
@UseInterceptors(GqlLoggerInterceptor)
export class SupplierContactResolver {

    constructor(
        private readonly _dataSource: DataSource,
        private readonly _supplierContactSrv: SupplierContactService,
        private readonly _supplierSrv: SupplierService
    ) { }

    @Query("supplierContacts")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSupplierContacts(@Args("supplierId") supplierId: number): Promise<SupplierContact[]> {
        return this._supplierContactSrv.getList({ supplierId });
    }

    @Query("supplierContact")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async getSupplierContact(@Args("id") id: number, @UUID() uuid: string): Promise<SupplierContact> {
        return this._supplierContactSrv.getById(id, uuid);
    }

    @Mutation("createSupplierContact")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async createSupplierContact(@Args("data") data: SupplierContactInput): Promise<SupplierContact> {
        return this._supplierContactSrv.create(data);
    }

    @Mutation("updateSupplierContact")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async updateSupplierContact(@Args("id") id: number, @Args("data") data: SupplierContactUpdate, @UUID() uuid: string): Promise<SupplierContact> {
        return this._supplierContactSrv.update(id, data, uuid);
    }

    @Mutation("deleteSupplierContact")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async deleteSupplierContact(@Args("id") id: number): Promise<boolean> {
        return this._supplierContactSrv.delete(id);
    }

    @Mutation("setSupplierContactFavorite")
    @Access(GRANT_TOKEN.FRONT_ACCESS)
    public async setSupplierContactFavorite(@Args("id") id: number, @Args("supplierId") supplierId: number): Promise<boolean> {
        return await this._dataSource.transaction(async transaction => {
            return await this._supplierContactSrv.setFavorite(id, supplierId, transaction);
        }).catch(err => { throw ErrorUtil.get(err); });
    }

    @ResolveField("supplier")
    public async getSupplier(@Parent() supplierContact: SupplierContact, @UUID() uuid: string): Promise<Supplier> {
        return this._supplierSrv.getById(supplierContact.supplierId, uuid);
    }
}