import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { Repository, UpdateResult } from "typeorm";
import { SmtpConfigSql } from "../entities/smtp-config.entity";
import { SmtpConfig, SmtpConfigInput, UpdateSmtpConfig } from "../interfaces/smtp-config.interface";
const { decrypt, encrypt } = require('../../../../assets/encryption.js');

@Injectable()
export class SmtpConfigService {
    
    constructor(
        @InjectRepository(SmtpConfigSql) private readonly _smtpRepo: Repository<SmtpConfigSql>,
    ) { }

    /**
     * @description Create new SmtpConfig 
     * @author Marie Claudia
     * @param {SmtpConfigSql} data
     * @returns {Promise<SmtpConfigSql>}
     * @memberof SmtpConfigService
     */
    public async create(data: SmtpConfigSql): Promise<SmtpConfigSql> {
        return this._smtpRepo.save(data);
    }

    /**
     * @description Find a Smtpconfig by its properties
     * @author Marie claudia
     * @param {SmtpConfig} smtpProperties
     * @returns
     * @memberof SmtpConfigService
     */
    public async findByProperty(smtpProperties: SmtpConfig){
        try {
            let smtp =  await this._smtpRepo.findOne({ where: smtpProperties });
            if(smtp.password){
                smtp.password = decrypt(smtp.password);
            }
            return smtp;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
    * @description Find a smtpconfig by its properties
    * @author Marie claudia
    * @param {SmtpConfig} smtpProperties
    * @returns
    * @memberof SmtpConfigService
    */
    public async findByLoginId(id: number){
        try {
            return await this._smtpRepo.findOne({ where: {loginId : id} });
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
 
    /**
     * @description Update a SmtpConfig with new values
     * @author Marie Claudia
     * @param {number} id
     * @param {UpdateSmtpConfig} data
     * @returns {Promise<SmtpConfig>}
     * @memberof SmtpConfigService
     */
    public async updateSmtpConfig(data: UpdateSmtpConfig, id:number): Promise<any> {
        try { 
            if(data.password){
                let pass = encrypt(data.password);
                data.password = pass.toString('hex');
            }
            const updated: UpdateResult = await this._smtpRepo.update(id,<SmtpConfigSql>data);
            const smtp = (updated && updated.raw && updated.raw.affectedRows > 0) ? await this._smtpRepo.findOne(id) : null;
            return smtp;
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
        
}