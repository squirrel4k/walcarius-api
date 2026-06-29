import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserHistorySql } from "../entities/userhistory.entity";
import { Repository } from "typeorm";
import { UserHistory } from "../interfaces/userhistory.interface";

@Injectable()
export class UserHistoryService {

    constructor(
        @InjectRepository(UserHistorySql) private readonly _userHistoryRepo: Repository<UserHistorySql>
    ) { }

    /**
     * @description Create new User history record
     * @author Quentin Wolfs
     * @param {UserHistory} data
     * @returns {Promise<UserHistory>}
     * @memberof UserHistoryService
     */
    public async create(data: UserHistory): Promise<UserHistory> {
        return this._userHistoryRepo.save(data);
    }
}