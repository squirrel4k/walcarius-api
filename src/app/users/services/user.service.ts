import { Injectable } from "@nestjs/common";
import { User, UserInput } from "../interfaces/user.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { UserSql } from "../entities/user.entity";
import { Repository, UpdateResult } from "typeorm";
import { BcryptUtil } from "../../../core/utils/bcrypt.util";
import { UserLoader } from "../loaders/user.loader";
import { ErrorUtil } from "../../../core/utils/error.util";
import { BaseSqlService } from "../../../core/services/base-sql.service";

@Injectable()
export class UserService extends BaseSqlService<UserSql, UserInput, UserInput> {

    constructor(
        @InjectRepository(UserSql) private readonly  _userRepo: Repository<UserSql>,
        private readonly userLoader: UserLoader,
    ) {
        super(_userRepo, userLoader, UserSql, true);
    }

    /**
     * @description Find a user by its properties
     * @author Quentin Wolfs
     * @param {User} userProperties
     * @returns
     * @memberof UserService
     */
    public async findByProperty(userProperties: User) {
        try {
            return await this._userRepo.findOne({ where: userProperties });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }


    /**
    * @description Get a User from database by its id
    * @author Quentin Wolfs
    * @param {number} id
    * @param {string} uuid
    * @returns {Promise<User>}
    * @memberof UserService
    */
    public async getByIdUser(id: number, uuid: string): Promise<User> {
        try {
            return await this.userLoader.get(uuid).load(id);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
    * @description Update a User with new values
    * @author Marie Claudia
    * @param {number} id
    * @param {User} data
    * @param {string} uuid
    * @returns {Promise<User>}
    * @memberof UserService
    */
    public async updateUser(id: number, data: User, uuid: string): Promise<User> {
        try {
            if (data.password) { data.password = await BcryptUtil.hash(data.password); }

            const updated: UpdateResult = await this._userRepo.update(id, data);
            const user = (updated && updated.raw && updated.raw.affectedRows > 0) ? await this.getById(id, uuid) : null;
            return user;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Create new User
     * @author Marie Claudia
     * @param {User} data
     * @returns {Promise<UserSql>}
     * @memberof UserService
     */
    public async createUser(data: UserSql): Promise<User> {
        try {
            if (data.password) data.password = await BcryptUtil.hash(data.password);

            const user = await this._userRepo.save(data);
            return user;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}