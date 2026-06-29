import { TeklaParsedCategory, TeklaConfig } from "../interfaces/tekla.interface";

export const teklaConfig: TeklaConfig = {
    parsed: {
        [TeklaParsedCategory.HEA]: {
            regex: /^HEAA?\d+(?:-\d+)?$/
        },
        [TeklaParsedCategory.HEB]: {
            regex: /^HEB\d+(?:-\d+)?$/
        },
        [TeklaParsedCategory.HEM]: {
            regex: /^HEM\d+$/
        },
        [TeklaParsedCategory.IPE]: {
            regex: /^IPE\d+(?:[\-/]\d+)?$/
        },
        [TeklaParsedCategory.UPN]: {
            regex: /^UNP\d+$/
        },
        [TeklaParsedCategory.UPE]: {
            regex: /^UPE\d+$/
        },
        [TeklaParsedCategory.IPN]: {
            regex: /^INP\d+$/
        },
        [TeklaParsedCategory.EQUAL_CORNER]: {
            regex: /^(?:H|L)(?:\d+(?:\.\d+)?)\/(?:\d+(?:\.\d+)?)$/
        },
        [TeklaParsedCategory.INEQUAL_CORNER]: {
            regex: /^(?:H|L)(?:\d+(?:\.\d+)?)\/(?:\d+(?:\.\d+)?)\/(?:\d+(?:\.\d+)?)$/
        },
        [TeklaParsedCategory.T]: {
            regex: /^T\d+$/
        },
        [TeklaParsedCategory.U]: {
            regex: /^UNP\d+\/\d+$/
        },
        [TeklaParsedCategory.SQUARE_TUBE]: {
            // SQUARE -> Barre pleine ajoutée depuis exemple fichier Tekla. Peut éventuellement bouger dans une autre catégorie par la suite
            regex: /^(?:(?:KK?(?:\d+(?:\.\d+)?)+\/(?:\d+(?:\.\d+)?)+)|(SQUARE ?\d+\*\d+))$/
        },
        [TeklaParsedCategory.RECTANGLE_TUBE]: {
            regex: /^KK?(?:\d+(?:\.\d+)?)+\/(?:\d+(?:\.\d+)?)+\/(?:\d+(?:\.\d+)?)+$/
        },
        [TeklaParsedCategory.ROUND_TUBE]: {
            regex: /^B(?:\d+(?:\.\d+)?)+\/(?:\d+(?:\.\d+)?)+$/
        }
    },
    ignored: [ "PL", "MOER", "STRIP", "TEARPL", "_M", "RST", "R12", "RING" ]
};