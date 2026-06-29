export enum LengthUnit {
    MM = -3,
    CM = -2,
    DM = -1,
    M = 0,
    DAM = 1,
    HM = 2,
    KM = 3
}

export enum AreaUnit {
    MM_2 = -6,
    CM_2 = -4,
    DM_2 = -2,
    M_2 = 0,
    DAM_2 = 2,
    HM_2 = 4,
    KM_2 = 6,
    ARE = 2,
    HECTARE = 4
}

export enum WeightUnit {
    G = 0,
    DAG = 1,
    HG = 2,
    KG = 3,
    T = 6
}

export enum VolumeUnit {
    MM_3 = -6,
    CM_3 = -3,
    ML = -3,
    CL = -2,
    DL = -1,
    DM_3 = 0,
    L = 0,
    M_3 = 3
}

export const ConversionUtil = new class {
    /**
     * @description Convert a number from a base unit to a new unit. These "unit" are enum that represents the exponent of 10 of each unit.
     * Example : MM = 0, CM = 1, M = 3.
     * Examples of those enums can be found in the class
     * @author Quentin Wolfs
     * @param {number} value
     * @param {*} baseUnit
     * @param {*} newUnit
     * @returns {number}
     */
    public convert<T>(value: number, baseUnit: T, newUnit: T): number {
        if (baseUnit < newUnit) {
            return value / Math.pow(10, +newUnit - +baseUnit);
        } else if (baseUnit > newUnit) {
            return value * Math.pow(10, +baseUnit - +newUnit);
        } else {
            return value;
        }
    }
};