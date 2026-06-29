import * as Bcrypt from "bcryptjs";

export const BcryptUtil = new class {

    /**
     * @description Hashes asynchronously a value using Bcrypt
     * @author Quentin Wolfs
     * @param {string} value
     * @returns {Promise<string>}
     * @memberof BcryptUtil
     */
    public async hash(value: string): Promise<string> {
        const saltRounds: number = 10;
        return Bcrypt.hash(value, saltRounds);
    }

    /**
     * @description Compare asynchronously if a value is the same as a hashed one
     * @author Quentin Wolfs
     * @param {string} value
     * @param {string} hashed
     * @returns {Promise<boolean>}
     * @memberof BcryptUtil
     */
    public async compare(value: string, hashed: string): Promise<boolean> {
        return Bcrypt.compare(value, hashed);
    }
};