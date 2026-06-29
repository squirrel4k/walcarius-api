import { PERMISSION_CATEGORIES } from "../enums/permissioncategories.enum";
import { PERMISSION_TYPES } from "../enums/permissiontypes.enum";
import { USER_GROUPS } from "../enums/usergroups.enum";

/**
 * @description First level is the group, second level is the category, third level is the type
 *              For each level, the value can be an object or a boolean 
 *              If there is a boolean on the first or second level, all following levels take this value
 */
export const USER_PERMISSIONS: object = {
    [USER_GROUPS.ADMINISTRATOR]: {
        [PERMISSION_CATEGORIES.QUOTATIONS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: true,
            [PERMISSION_TYPES.DELETE]: true
        },
        [PERMISSION_CATEGORIES.PROJECTS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PRICE_REQUESTS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PURCHASE_ORDERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SUPPLIERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.CATALOG]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.USERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SEE_PRICES]: {
            [PERMISSION_TYPES.READ]: false,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
    },
    [USER_GROUPS.QUOTER]: {
        [PERMISSION_CATEGORIES.QUOTATIONS]: true,
        [PERMISSION_CATEGORIES.PROJECTS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PRICE_REQUESTS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PURCHASE_ORDERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SUPPLIERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.CATALOG]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.USERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SEE_PRICES]: {
            [PERMISSION_TYPES.READ]: false,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
    },
    [USER_GROUPS.DESIGN_OFFICE]: {
        [PERMISSION_CATEGORIES.QUOTATIONS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PROJECTS]: true,
        [PERMISSION_CATEGORIES.PRICE_REQUESTS]: true,
        [PERMISSION_CATEGORIES.PURCHASE_ORDERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SUPPLIERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.CATALOG]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.USERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SEE_PRICES]: {
            [PERMISSION_TYPES.READ]: false,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
    },
    [USER_GROUPS.WORKSHOP]: {
        [PERMISSION_CATEGORIES.QUOTATIONS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PROJECTS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PRICE_REQUESTS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.PURCHASE_ORDERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SUPPLIERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.CATALOG]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.USERS]: {
            [PERMISSION_TYPES.READ]: true,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
        [PERMISSION_CATEGORIES.SEE_PRICES]: {
            [PERMISSION_TYPES.READ]: false,
            [PERMISSION_TYPES.WRITE]: false,
            [PERMISSION_TYPES.DELETE]: false
        },
    },
};