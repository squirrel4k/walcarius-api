export const EnumUtil = new class {

    /**
     * @description Returns the keys of a given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @returns {string[]}
     */
    public getKeys(enumeration: Record<string, string | number>): string[] {
        return Object.keys(enumeration).filter(key => isNaN(parseInt(key, 10)));
    }

    /**
     * @description Return the first key that corresponds to the asked value in the given enum. Returns undefined if not in enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @param {(string | number)} value
     * @returns {string}
     */
    public getKey(enumeration: Record<string, string | number>, value: string | number): string {
        return this.getKeys(enumeration).find(key => enumeration[key] === value);
    }

    /**
     * @description Returns the values of a given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @returns {(T[])}
     */
    public getValues<T>(enumeration: Record<string, string | number>): T[] {
        return this.getKeys(enumeration).map(key => enumeration[key]) as unknown as T[];
    }

    /**
     * @description Returns the stringified values of a given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @returns {string[]}
     */
    public getStringValues(enumeration: Record<string, string | number>): string[] {
        return this.getKeys(enumeration).map(key => enumeration[key].toString());
    }

    /**
     * @description Checks wether the given value exists in the given enum
     * @author Quentin Wolfs
     * @param {*} enumeration
     * @param {T} value
     * @returns {boolean}
     */
    public inValues<T>(enumeration: Record<string, T>, value: T): boolean {
        return this.getValues(enumeration as any).includes(value);
    }
}
