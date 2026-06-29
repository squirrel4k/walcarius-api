import * as jwt from "jsonwebtoken";

export const JwtUtil = new class {

    /**
     * @description Refresh a jwt without checking if signature is valid
     * @author Quentin Wolfs
     * @param {string} token
     * @param {string} secret
     * @param {(number | string)} [expire]
     * @returns {Promise<string>}
     */
    public async refreshToken(token: string, secret: string, expire?: number | string): Promise<string> {
        const decoded: any = jwt.decode(token);
        // Delete JWT-specific data
        delete decoded.iat;
        delete decoded.exp;

        return jwt.sign(decoded, secret, expire ? { expiresIn: expire } : null);
    }
};