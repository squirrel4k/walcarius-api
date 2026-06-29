import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { Repository, UpdateResult } from "typeorm";
import { PermissionSql } from "../entities/permission.entity";
import { IPermission, UpdatePermission } from "../interfaces/permission.interface";
import { USER_GROUPS } from "../../users/enums/usergroups.enum";
import { InMemoryStorage } from "../../../core/utils/in-memory-storage";
@Injectable()
export class PermissionService {
    
    constructor(
        @InjectRepository(PermissionSql) private readonly _permissionRepo: Repository<PermissionSql>
    ) { }

    /**
     * @description Find a Permission by its properties
     * @author Marie claudia
     * @param {IPermission} permissionProperties
     * @returns
     * @memberof PermissionService
     */
    public async findByProperty(permissionProperties: IPermission){
        try {
            let permission =  await this._permissionRepo.find({ where: permissionProperties } as any);
            return permission;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Find all
     * @author Raphaël M
     * @returns
     * @memberof PermissionService
     */
    public async findAll(){
        try {
            return await this._permissionRepo.find({});
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }


    /**
     * @description Update a Permission type with new values
     * @author Marie Claudia
     * @param {number} id
     * @param {UpdatePermission} data
     * @returns {Promise<IPermission>}
     * @memberof PermissionService
     */
    public async updatePermission(data: UpdatePermission, id:number): Promise<IPermission> {
        try { 
            const updated: UpdateResult = await this._permissionRepo.update(id,<PermissionSql>data);
            this.savePermissionsToLocalStorage();
            const permission = (updated && updated.raw && updated.raw.affectedRows > 0) ? await this._permissionRepo.findOneBy({ id }) : null;
            return permission;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
    * @description Save permissions to local storage
    * @author Raphaël Michaux
    * @returns {void}
    * @memberof UserService
    */
    public savePermissionsToLocalStorage(): void {
        this.findAll().then((res) => {
            let dataToSave: any = {
                [USER_GROUPS.ADMINISTRATOR]: {},
                [USER_GROUPS.DESIGN_OFFICE]: {},
                [USER_GROUPS.QUOTER]: {},
                [USER_GROUPS.WORKSHOP]: {},
                date: Date.now()
            }
            res.forEach(perm => {
                dataToSave[perm.userGroup][perm.category] = perm;
            });

            let localStorage = new InMemoryStorage();
            localStorage.setItem('dataPermission', JSON.stringify(dataToSave));
        });
    }

}