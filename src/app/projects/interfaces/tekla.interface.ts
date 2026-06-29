import { SupplyList } from "./supply-list.interface";

export interface ParsedTekla {
    project: {
        reference: string;
    };
    supplyList: SupplyList;
}

export interface TeklaHeader {
    project: string;
    date: string;
    model: string;
}

export enum TeklaPropertyIndex {
    REFERENCE = 0,
    POS = 1,
    MATTER = 2,
    QUANTITY = 3,
    LENGTH = 4,
    AREA = 5,
    WEIGHT = 6
}

export interface TeklaConfig {
    parsed: TeklaParseConfig;
    ignored: string[];
}

export interface TeklaParseConfig {
    [category: string]: {
        regex: RegExp
    };
}

export enum TeklaParsedCategory {
    HEA = "HEA",
    HEB = "HEB",
    HEM = "HEM",
    IPE = "IPE",
    UPN = "UPN",
    UPE = "UPE",
    IPN = "IPN",
    EQUAL_CORNER = "Cornière égale",
    INEQUAL_CORNER = "Cornière inégale",
    T = "T",
    U = "U",
    SQUARE_TUBE = "Tube carré",
    RECTANGLE_TUBE = "Tube rectangle",
    ROUND_TUBE = "Tube rond"
}