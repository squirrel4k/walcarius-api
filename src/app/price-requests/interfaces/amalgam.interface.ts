import { AmalgamPart } from "./amalgam-part.interface";
import { AmalgamGroup } from "./amalgam-group.interface";
import { BarsetGeneration } from "./barset-generation.interface";

export interface AmalgamParam {
    beams?: CategoryParam;
    tubes?: CategoryParam;
}

export interface CategoryParam {
    length?: number;
    otherLengths?: number[];
    isAutoCut?: boolean;
    cutThreshold?: number;
    maxLoss?: number;
}

export interface CalculatedAmalgamPart {
    supplyListElementId?: number;
    reference?: string;
    matterRef?: string;
    length?: number;
    isBlack?: boolean;
    isBlasted?: boolean;
    isPrimaryBlasted?: boolean;
    remark?: string;
    supplyCategoryId?: number;
    elementId?: number;
    matterId?: number;
    isEn1090?: boolean;
    icon?: string;
    isAlreadyInBarset?: boolean;
}
export interface TestPieceRecap extends CalculatedAmalgamPart {
    stackSize?: number;
}

export interface AmalgamConfig {
    usedCategoryIds: number[];
    sizes: { [category: string]: number[] };
    categoryIds: { [category: string]: number[] };
    underSizeThreshold: number;
    default: AmalgamParam;
    parsedFields: string[];
}

export interface Amalgam {
    id?: number;
    loss?: number;
    isLocked?: boolean;
    isInStock?: boolean;
    stockPosition?: string;
    amalgamGroupId?: number;
    amalgamGroup?: AmalgamGroup;
    parts?: AmalgamPart[];
}

export interface AmalgamInput {
    id?: number;
    reference?: string;
    format?: string;
    loss?: number;
    isEn1090?: boolean;
    isBlack?: boolean;
    isBlasted?: boolean;
    isPrimaryBlasted?: boolean;
    isCut?: boolean;
    isLocked?: boolean;
    isInStock?: boolean;
    isManual?: boolean;
    icon?: string;
    remark?: string;
    matterRef?: string;
    matterId?: number;
    priceRequestId?: number;
    supplyCategoryId?: number;
    elementId?: number;
    parts?: AmalgamPart[];
}

export interface AmalgamFilter {
    priceRequestId?: number;
}

export enum AmalgamCategory {
    BEAM = "beams",
    TUBE = "tubes"
}

export interface AmalgamGenerationResult {
    amalgams: Amalgam[];
    barsetGeneration: BarsetGeneration;
}