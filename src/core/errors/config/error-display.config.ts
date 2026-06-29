import { ERROR_MESSAGE } from "../enum/error.enum";
import { LANG } from "../../../core/enums/language.enum";

interface ErrorDisplayConfig {
    [ message: string ]: {
        code: number,
        infoKey: string;
    };
}

export const ErrorDisplay: ErrorDisplayConfig = {
    // 400 - Bad Requests
    [ERROR_MESSAGE.BAD_REQUEST]: {
        code: 40000,
        infoKey: "bad_request"
    },
    [ERROR_MESSAGE.NO_SUPPLIER_OFFER]: {
        code: 40001,
        infoKey: "no_supplier_offer"
    },
    [ERROR_MESSAGE.PRICE_REQUEST_ALREADY_SENT]: {
        code: 40002,
        infoKey: "price_request_already_sent"
    },
    [ERROR_MESSAGE.SUPPLIER_OFFER_NOT_EMPTY]: {
        code: 40003,
        infoKey: "supplier_offer_not_empty"
    },
    [ERROR_MESSAGE.NO_MAIL_FOR_SUPPLIER]: {
        code: 40004,
        infoKey: "no_mail_for_supplier"
    },
    [ERROR_MESSAGE.INVALID_FILE]: {
        code: 40005,
        infoKey: "invalid_file"
    },
    [ERROR_MESSAGE.INVALID_FILE_FORMAT]: {
        code: 40006,
        infoKey: "invalid_file_format"
    },
    [ERROR_MESSAGE.PROJECT_HAS_ASSIGNED_SUPPLY_LIST]: {
        code: 40007,
        infoKey: "project_has_assigned_supply_list"
    },
    [ERROR_MESSAGE.SUPPLY_LIST_ALREADY_ASSIGNED]: {
        code: 40008,
        infoKey: "supply_list_already_assigned"
    },
    [ERROR_MESSAGE.SUPPLY_LIST_CONTAINS_SENT_ELEMENTS]: {
        code: 40009,
        infoKey: "supply_list_contains_sent_elements"
    },
    [ERROR_MESSAGE.SUPPLY_LIST_CONTAINS_ENCODED_PRICES]: {
        code: 40010,
        infoKey: "supply_list_contains_encoded_prices"
    },
    [ERROR_MESSAGE.SUPPLY_LIST_IN_LOCKED_AMALGAMS]: {
        code: 40011,
        infoKey: "supply_list_in_locked_amalgams"
    },
    [ERROR_MESSAGE.SUPPLY_LIST_NOT_IN_PRICE_REQUEST]: {
        code: 40012,
        infoKey: "supply_list_not_in_price_request"
    },
    [ERROR_MESSAGE.NO_PURCHASE_ORDER_ELEMENT]: {
        code: 40013,
        infoKey: "no_purchase_order_element"
    },
    [ERROR_MESSAGE.PURCHASE_ORDER_ALREADY_SENT]: {
        code: 40014,
        infoKey: "purchase_order_already_sent"
    },
    [ERROR_MESSAGE.NO_PURCHASE_ORDER]: {
        code: 40015,
        infoKey: "no_purchase_order"
    },
    [ERROR_MESSAGE.QUOTE_PROJECT_NOT_EMPTY]: {
        code: 40016,
        infoKey: "quote_project_not_empty"
    },
    [ERROR_MESSAGE.SUPPLIER_CODE_ALREADY_EXISTS]: {
        code: 40017,
        infoKey: "supplier_code_already_exists"
    },
    [ERROR_MESSAGE.PURCHASE_ORDER_IS_CANCELLED]: {
        code: 40018,
        infoKey: "purchase_order_is_cancelled"
    },
    [ERROR_MESSAGE.INVALID_ASKED_STICKER_FORMAT]: {
        code: 40019,
        infoKey: "invalid_asked_sticker_format"
    },
    [ERROR_MESSAGE.PRICE_REQUEST_ALREADY_IN_PURCHASE_ORDER]: {
        code: 40020,
        infoKey: "price_request_already_in_purchase_order"
    },
    [ERROR_MESSAGE.INVALID_ELEMENTS_FOR_PURCHASE_ORDER]: {
        code: 40021,
        infoKey: "invalid_elements_for_purchase_order"
    },
    [ERROR_MESSAGE.INVALID_ADD_COSTS_FOR_PURCHASE_ORDER]: {
        code: 40022,
        infoKey: "invalid_additionnal_costs_for_purchase_order"
    },
    [ERROR_MESSAGE.INVALID_AMALGAM_PARTS_QUANTITY]: {
        code: 40023,
        infoKey: "invalid_amalgam_parts_quantity"
    },
    // 401 - Unauthorized
    [ERROR_MESSAGE.UNAUTHORIZED]: {
        code: 40100,
        infoKey: "unauthorized"
    },
    [ERROR_MESSAGE.AUTHENTICATION_FAILED]: {
        code: 40101,
        infoKey: "authentication_failed"
    },
    [ERROR_MESSAGE.INVALID_TOKEN]: {
        code: 40102,
        infoKey: "invalid_token"
    },
    [ERROR_MESSAGE.NO_USER_WITH_EMAIL]: {
        code: 40103,
        infoKey: "no_user_with_email"
    },
    // 403 - Forbidden
    [ERROR_MESSAGE.FORBIDDEN]: {
        code: 40300,
        infoKey: "forbidden"
    },
    // 404 - Not found
    [ERROR_MESSAGE.NOT_FOUND]: {
        code: 40400,
        infoKey: "not_found"
    },
    [ERROR_MESSAGE.NO_FILE_FOUND]: {
        code: 40401,
        infoKey: "no_file_found"
    },
    // 500 - Internal Server Exception
    [ERROR_MESSAGE.INTERNAL_SERVER_ERROR]: {
        code: 50000,
        infoKey: "internal_server_error"
    },
    [ERROR_MESSAGE.IMPOSSIBLE_FILE_MOVE]: {
        code: 50001,
        infoKey: "impossible_file_move"
    },
    [ERROR_MESSAGE.PDF_CONFIGURATION_NOT_FOUND]: {
        code: 50002,
        infoKey: "pdf_configuration_not_found"
    },
    [ERROR_MESSAGE.UNABLE_TO_ASSIGN_SUPPLY_LIST]: {
        code: 50003,
        infoKey: "unable_to_assign_supply_list"
    },
    [ERROR_MESSAGE.UNABLE_TO_FREE_SUPPLY_LIST]: {
        code: 50004,
        infoKey: "unable_to_free_supply_list"
    },
    [ERROR_MESSAGE.UNABLE_TO_REGEN_AMALGAMS]: {
        code: 50004,
        infoKey: "unable_to_regen_amalgams"
    },
    // 501 - Not Implemented
    [ERROR_MESSAGE.NOT_IMPLEMENTED]: {
        code: 50100,
        infoKey: "not_implemented"
    },
    [ERROR_MESSAGE.FOOTER_NOT_IMPLEMENTED]: {
        code: 50101,
        infoKey: "footer_not_implemented"
    },
    [ERROR_MESSAGE.HEADER_NOT_IMPLEMENTED]: {
        code: 50102,
        infoKey: "header_not_implemented"
    },
    // 600 - Unknown
    [ERROR_MESSAGE.UNKNOWN_ERROR]: {
        code: 60000,
        infoKey: "unknown_error"
    }
};