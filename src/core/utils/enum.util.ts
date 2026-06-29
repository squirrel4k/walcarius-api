export const EnumUtil = new class {

    /**
     * @description Returns the keys of a given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @returns {string[]}
     */
    public getKeys(enumeration: any): string[] {
        return Object.keys(enumeration).filter(key => isNaN(parseInt(key, 10)));
    }

    /**
     * @description Return the first key that corresponds to the asked value in the given enum. Returns undefined if not in enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @param {(string | number)} value
     * @returns {string}
     */
    public getKey(enumeration: any, value: string | number): string {
        return this.getKeys(enumeration).find(key => enumeration[key] === value);
    }

    /**
     * @description Returns the values of a given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @returns {(T[])}
     */
    public getValues<T>(enumeration: any): T[] {
        return this.getKeys(enumeration).map(key => enumeration[key]);
    }

    /**
     * @description Returns the stringified values of a given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @returns {string[]}
     */
    public getStringValues(enumeration: any): string[] {
        return this.getKeys(enumeration).map(key => enumeration[key].toString());
    }

    /**
     * @description Checks wether the given value exists in the given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @param {T} value
     * @returns {boolean}
     */
    public inValues<T>(enumeration: any, value: T): boolean {
        return this.getValues<T>(enumeration).some(enumValue => enumValue === value);
    }
};