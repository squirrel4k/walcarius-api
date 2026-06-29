import { AmalgamConfig, AmalgamCategory } from "../interfaces/amalgam.interface";

export const amalgamConfig: AmalgamConfig = {
    usedCategoryIds: [
        7,  // "Poutrelle"
        14, // "HEA"
        15, // "HEB"
        16, // "HEM"
        17, // "IPE"
        18, // "UPN"
        19, // "UPE"
        20, // "IPN"
        21, // "Cornière égale",
        22, // "Cornière inégale",
        23, // "T",
        24, // "U",
        8,  // "Tube",
        25, // "Tube carré",
        26, // "Tube rectangle",
        27, // "Tube rond"
    ],
    sizes: {
        [AmalgamCategory.BEAM]: [6000, 10000, 11000, 12000, 13000, 14000, 15000, 16000, 17000, 18000, 19000, 24000],
        [AmalgamCategory.TUBE]: [6000, 12000]
    },
    categoryIds: {
        [AmalgamCategory.BEAM]: [7, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24],
        [AmalgamCategory.TUBE]: [8, 25, 26, 27]
    },
    underSizeThreshold: 6000,
    default: {
        [AmalgamCategory.BEAM]: {
            length: 12000,
            otherLengths: [6000, 13000, 14000, 15000],
            isAutoCut: false,
            cutThreshold: 3000,
            maxLoss: 1000
        },
        [AmalgamCategory.TUBE]: {
            length: 12000,
            otherLengths: [6000],
            isAutoCut: false,
            cutThreshold: 3000,
            maxLoss: 1000
        }
    },
    parsedFields: [
        "reference",
        "loss",
        "isEn1090",
        "format",
        "matterId",
        "matterRef",
        "isBlack",
        "isBlasted",
        "isPrimaryBlasted",
        "icon",
        "isLocked",
        "isCut",
        "supplyCategoryId",
        "elementId",
        "remark"
    ]
};