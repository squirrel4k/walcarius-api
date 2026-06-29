import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UserService } from "../users/services/user.service";
import { AuthUser } from "./interfaces/auth.interfaces";
import { BcryptUtil } from "../../core/utils/bcrypt.util";
import { WinstonLogger } from "../common/logger/winston.logger";
import { MailerManager } from "../mailer/managers/mailer.manager";
import { MAIL_TEMPLATES } from "../mailer/enums/templates.enum";
import { v4 } from "uuid";
import { JwtWrapperService } from "../common/jwt/jwt.service";
import { GRANT_TOKEN, JwtUserPayload } from "../common/jwt/jwt.interface";
import { User } from "../users/interfaces/user.interface";
import { UserHistoryService } from "../users/services/userhistory.service";
import { ERROR_MESSAGE } from "../../core/errors/enum/error.enum";
import { InMemoryStorage } from "../../core/utils/in-memory-storage";
import { PERMISSION_TYPES } from "../users/enums/permissiontypes.enum";
import { PermissionService } from "../permission/services/permission.service";
import { PERMISSION_CATEGORIES } from "../users/enums/permissioncategories.enum";


@Injectable()
export class AuthService {

    public permission: any;

    public constructor(
       // @Inject(forwardRef(() => SmtpConfigService))
        private readonly _userSrv: UserService,
        private readonly _userHistorySrv: UserHistoryService,
        private readonly _jwtSrv: JwtWrapperService,
        private readonly _logger: WinstonLogger,
        private readonly _mailer: MailerManager,
        private readonly _permissionSrv: PermissionService,
        // private readonly _smtpRepo: Repository<SmtpConfigSql>
    ) { }

    /**
    * @description Authenticates a user given found corresponding user in database and given password
    * @author Quentin Wolfs
    * @private
    * @param {User} user
    * @param {string} password
    * @returns {Promise<boolean>}
    * @memberof AuthService
    */
    private async authenticateUser(user: User, password: string): Promise<boolean> {
        if (!user || user.deletedAt != null) { return false; }
        return await BcryptUtil.compare(password, user.password);
    }

    /**
    * @description Log a user in, create or update smtp config and returns the connected user 
    * @author Quentin Wolfs
    * @private
    * @param {string} login
    * @param {string} password
    * @returns {Promise<User>}
    * @memberof AuthService
    */
    private async logAndGetUser(login: string, password: string): Promise<User> {
        const user = await this._userSrv.findByProperty({ username: login });
        const isUserOk = await this.authenticateUser(user, password);
       
        if (!isUserOk) { throw new UnauthorizedException(ERROR_MESSAGE.AUTHENTICATION_FAILED); }

        const history = await this._userHistorySrv.create({ loginId: user.id });

        if (!history) { this._logger.warn(`Could not set history for user ${user.username}.`); }

        return user;
    }

    /**
    * @description Generate the payload if a JWT token
    * @author Quentin Wolfs
    * @private
    * @param {User} user
    * @param {string} accessType
    * @returns {JwtPayload}
    * @memberof AuthService
    */
    private generatePayload(user: User): JwtUserPayload {
        return {
            id: user.id,
            email: user.username,
            isAdmin: user.isAdmin
        };
    }

    /**
    * @description Generate a JWT token string for a user
    * @author Quentin Wolfs
    * @param {string} login
    * @param {string} password
    * @param {string} accessType
    * @returns {Promise<string>}
    * @memberof AuthService
    */
    public async grantAccessToken(login: string, password: string): Promise<AuthUser> {
        const user = await this.logAndGetUser(login, password);

        // Getting permissions from the database force us to use async functions which isn't practical
        // So we'll save them to the local storage and after 10 min it is renewed
        // We use authorized function to write the file only if it is not there or too old
        this.authorized(user.userGroup, PERMISSION_CATEGORIES.QUOTATIONS, null, true);

        delete user.password;
        const token = await this._jwtSrv.genAccessToken(this.generatePayload(user));
        const csrf = v4();

        return { ...user, token, csrf };
    }

    /**
    * @description Determine if the user has the permission to do something
    * @author Raphaël Michaux
    * @param {string} userGroup
    * @param {string} category
    * @param {string|null} type
    * @returns {Boolean}
    * @memberof AuthService
    */
    public authorized(userGroup: string, category: string, type: string | null, force?: boolean): Boolean {
        try {
            // first we get local storage because we don't want this function to be async
            let getData = new InMemoryStorage();
            let data = JSON.parse(getData.getItem('dataPermission'));
            let selectedPerm = data[userGroup][category];

            // if the data is older than 10 minutes or force is true, we'll renew it
            if (force || data.date < Date.now() - 600000) {
                this._permissionSrv.savePermissionsToLocalStorage();
            }

            // testing permissions, if type isn't specified, all three permissions are tested
            switch (type) {
                case PERMISSION_TYPES.READ : return selectedPerm.read;
                case PERMISSION_TYPES.WRITE : return selectedPerm.write;
                case PERMISSION_TYPES.DELETE : return selectedPerm.delete;
                default: return selectedPerm.read && selectedPerm.write && selectedPerm.delete;
            }
        } catch (err) {
            // if something go wrong, we'll (re)create the file for the next request
            this._permissionSrv.savePermissionsToLocalStorage();
            // returning false because we can't get the value without async
            return false;
        }
    }
    
    /**
    * @description Verifies if the user described by the payload exists within the database
    * @author Quentin Wolfs
    * @param {JwtUserPayload} payload
    * @returns {Promise<User>}
    * @memberof AuthService
    */
    public async validateUser(payload: JwtUserPayload): Promise<User> {
        const user = await this._userSrv.findByProperty({ username: payload.email });
        return user && !user.deletedAt ? user : null;
    }

    /**
    * @description Generate a code and send it by email to allow reset for a login
    * @author Quentin Wolfs
    * @param {string} email
    * @param {string} uuid
    * @returns {Promise<boolean>}
    * @memberof AuthService
    */
    public async sendResetPasswordMail(email: string, uuid: string): Promise<boolean> {
        // Find user corresponding to this email in database
        const user: User = await this._userSrv.findByProperty({ username: email });
        if (!user) { throw new UnauthorizedException(ERROR_MESSAGE.NO_USER_WITH_EMAIL); }

        const resetToken = v4();
        const token = await this._jwtSrv.genPasswordToken({ login: user.username, uuid: resetToken }, true);
        await this._userSrv.update(user.id, { resetToken }, uuid);

        return this._mailer.send({
            to: user.username
        }, MAIL_TEMPLATES.RESET_PASSWORD, { user, url: `${process.env.WAL_FRONT_URL}/reset_password?token=${token}` });
    }

    /**
    * @description Reset password from user by new one if his token is valid
    * @author Quentin Wolfs
    * @param {AuthUser} user
    * @param {string} newPassword
    * @param {string} uuid
    * @returns {Promise<AuthUser>}
    * @memberof AuthService
    */
    public async resetPassword(user: AuthUser, newPassword: string, uuid: string): Promise<AuthUser> {
        // Check if token is valid
        if (user.grant != GRANT_TOKEN.SET_PASSWORD) { throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN); }
        if (user.resetToken != user.uuid) { throw new UnauthorizedException(ERROR_MESSAGE.INVALID_TOKEN); }

        // Update database User with new password
        const updatedUser: AuthUser = await this._userSrv.update(user.id, { password: newPassword, resetToken: null }, uuid);

        // Generate new access token
        const authToken = await this._jwtSrv.genAccessToken(this.generatePayload(updatedUser));
        updatedUser.token = authToken;

        return updatedUser;
    }
}