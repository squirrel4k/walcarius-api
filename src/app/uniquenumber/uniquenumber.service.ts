import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NUMBER_CONFIG } from "./uniquenumber.config";
import { User } from "../users/interfaces/user.interface";
import { UniqueNumberConfiguration, NUMBER_TYPE } from "./uniquenumber.interface";
import { ReservedNumber } from "./reserved-number.entity";
import "../../core/ext/number";

@Injectable()
export class UniqueNumberService {

    private _config: { [numberType: number]: UniqueNumberConfiguration };

    constructor(
        @InjectRepository(ReservedNumber)
        private readonly _reservedNumberRepo: Repository<ReservedNumber>
    ) {
        this._config = NUMBER_CONFIG;
    }

    /**
     * @description Release a currently locked Unique Number
     * @param {NUMBER_TYPE} type
     * @param {User} user
     * @returns {Promise<boolean>}
     */
    public async freeNumber(type: NUMBER_TYPE, user: User): Promise<boolean> {
        if (!user || !user.username) { return false; }
        const result = await this._reservedNumberRepo.delete({ type, username: user.username });
        return result.affected > 0;
    }

    /**
     * @description Get the next available Unique Number based on configuration options
     * @param {NUMBER_TYPE} type
     * @param {User} user
     * @param {string} lastFromDb
     * @returns {Promise<string>}
     */
    public async getNumber(type: NUMBER_TYPE, user: User, lastFromDb: string): Promise<string> {
        const hasMail: boolean = user != null && user.username != null;

        if (hasMail) {
            const existing = await this._reservedNumberRepo.findOne({ type, username: user.username });
            if (existing) { return existing.number; }
        }

        const storedNumbers = await this._getStoredNumbers(type);
        const now: Date = new Date();
        const lastIncrement = await this.getLastIncrement(type, lastFromDb, storedNumbers);

        let newNumber = this.getNumberWithDate(type, now);
        newNumber = this.injectNumber(type, newNumber, lastIncrement + 1);

        if (hasMail) {
            const reserved = this._reservedNumberRepo.create({ type, username: user.username, number: newNumber });
            await this._reservedNumberRepo.save(reserved);
        }

        return newNumber;
    }

    /**
     * @description Fetch all reserved numbers for a given type as "username:number" strings
     */
    private async _getStoredNumbers(type: NUMBER_TYPE): Promise<string[]> {
        const rows = await this._reservedNumberRepo.find({ type });
        return rows.map(r => `${r.username}:${r.number}`);
    }

    /**
     * @description Get search pattern for last Unique Number in database
     * @author Quentin Wolfs
     * @param {NUMBER_TYPE} type
     * @returns {string}
     * @memberof UniqueNumberService
     */
    public getLastNumberSearchPattern(type: NUMBER_TYPE): string {
        let search = this.getNumberWithDate(type, new Date());
        // Replace x by wildcard
        search = search.replace(/x/g, this._config[type].wildcard);

        return search;
    }

    /**
     * @description Returns the last increment value used in either the cache and the database
     * @author Quentin
     * @param {NUMBER_TYPE} type
     * @param {string} lastFullNumberfromDb
     * @param {string[]} storedNumbers
     * @returns {Promise<number>}
     * @memberof UniqueNumberService
     */
    private async getLastIncrement(type: NUMBER_TYPE, lastFullNumberfromDb: string,  storedNumbers: string[]): Promise<number> {
        const lastFromDb = lastFullNumberfromDb ? this.extractNumber(type, lastFullNumberfromDb) : 0;
        const lastFromCache = this.getLastIncrementFromCache(type, storedNumbers);

        return Math.max(lastFromDb, lastFromCache);
    }

    /**
     * @description Returns the last increment value from the reserved numbers
     */
    private getLastIncrementFromCache(type: NUMBER_TYPE, storedNumbers: string[]): number {
        let max: number = 0;
        storedNumbers.forEach((val) => {
            const number: string = val.split(":").pop();
            const curVal = this.extractNumber(type, number);
            max = max > curVal ? max : curVal;
        });
        return max;
    }

    private getNumberWithDate(type: NUMBER_TYPE, date: Date): string {
        let number = this._config[type].format;
        number = number.replace(/YYYY/, this.yearReplace(type, date, true));
        number = number.replace(/YY/, this.yearReplace(type, date, false));
        number = number.replace(/MM/, this.monthReplace(type, date));
        return number;
    }

    /**
     * @description Replace the month by its value or by a wildcard
     */
    private monthReplace(type: NUMBER_TYPE, date: Date): string {
        return this._config[type].monthlyRAZ ? ((date.getMonth() + 1).padNumber(2)).toString() : `${this._config[type].wildcard}${this._config[type].wildcard}`;
    }

    /**
     * @description Replace the year by its value or by a wildcard
     */
    private yearReplace(type: NUMBER_TYPE, date: Date, isFullYear: boolean): string {
        const baseWildcard = `${this._config[type].wildcard}${this._config[type].wildcard}`;
        if (isFullYear) {
            return this._config[type].yearlyRAZ ? date.getFullYear().toString() : baseWildcard + baseWildcard;
        } else {
            return this._config[type].yearlyRAZ ? (date.getFullYear() % 100).toString() : baseWildcard;
        }
    }

    /**
     * @description Extract the increment from a number
     */
    private extractNumber(type: NUMBER_TYPE, number: string): number {
        const start = this._config[type].format.indexOf("x");
        const end = this._config[type].format.lastIndexOf("x");

        return Number.parseInt(number.substr(start, end), 10);
    }

    /**
     * @description Inject the increment into a formatted number
     */
    private injectNumber(type: NUMBER_TYPE, base: string, number: number): string {
        const start = this._config[type].format.indexOf("x");
        const end = this._config[type].format.lastIndexOf("x");
        const pad = (end + 1) - start;

        return base.replace(this._config[type].format.substr(start, end), number.padNumber(pad).toString());
    }
}