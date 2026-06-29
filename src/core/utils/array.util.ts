export const ArrayUtil = new class {

    /**
     * @description Split an the elements of an array that meet or not the condition specified in a callback function into two separate arrays
     * @author Quentin Wolfs
     * @template T
     * @param {T[]} array
     * @param {(value: T, index?: number, array?: T[]) => boolean} callbackFn
     * @returns {{ valid: T[], invalid: T[] }}
     */
    public splitArray<T>(array: T[], callbackFn: (value: T, index?: number, array?: T[]) => boolean): { valid: T[], invalid: T[] } {
        const valid: T[] = [];
        const invalid: T[] = [];

        array.forEach((val, index, completeArray) => {
            callbackFn(val, index, completeArray) ?
                valid.push(val) :
                invalid.push(val);
        });

        return { valid, invalid };
    }

    /**
     * @description Returns the substraction of the second array from the first array (A1 - A2)
     * @author Quentin Wolfs
     * @template T
     * @param {T[]} firstArray
     * @param {T[]} secondArray
     * @returns {T[]}
     */
    public substractArray<T>(firstArray: T[], secondArray: T[]): T[] {
        const secondSet: Set<T> = new Set(secondArray);

        return Array.from(firstArray.filter(element => !secondSet.has(element)));
    }

    /**
     * @description Find the first element in array that match the predicament and removes it (mutate the array)
     * @author Quentin Wolfs
     * @template T
     * @param {T[]} array
     * @param {(value, index?: number, array?: T[]) => boolean} callBackFn
     * @returns {T}
     */
    public findAndRemove<T>(array: T[], callBackFn: (value, index?: number, array?: T[]) => boolean): T {
        const index = array.findIndex(callBackFn);

        return index > -1 ? array.splice(index, 1).shift() : null;
    }
};