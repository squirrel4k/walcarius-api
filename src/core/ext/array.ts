interface Array<T> {
    /**
     * @description Create a two dimension array split by property value.
     * @author Houtekiet Yves
     * @param {string} propertyName The property name which is used to split array
     * @returns {T[][]}
     * @memberof Array
     */
    divideByProperty(propertyName: string): T[][];

    /**
     * @description Filter an array with a field which should be unique.
     * @author Houtekiet Yves
     * @param {string} fieldName The field name
     * @returns {T[]}
     * @memberof Array
     */
    uniqueBy(fieldName: string): T[];

    /**
     * @description Return first index matching all properties value in parameters.
     * @author Houtekiet Yves
     * @param {*} obj
     * @returns {number}
     * @memberof Array
     */
    firstIndexMatching(obj: any): number;

    /**
     * @description Return true if there is an item with property equals to given value in array.
     * @author Houtekiet Yves
     * @param {string} property Name of the property
     * @param {*} value Value of the property
     * @returns {boolean}
     * @memberof Array
     */
    containItemWith(property: string, value: any): boolean;

    /**
     * @description Create an array with only unique value.
     * @author Houtekiet Yves
     * @returns {T[]}
     * @memberof Array
     */
    unique(): T[];

    /**
     * @description Create a flattened array with multidimensionnal array.
     * @author Houtekiet Yves
     * @returns {T}
     * @memberof Array
     */
    flat(): T;

    /**
     * @description Turn an associative array into object.
     * @author Houtekiet Yves
     * @returns {*}
     * @memberof Array
     */
    toObject<U>(predicate?: (a: T) => { key: string, value: U }): any;

    /**
     * @description Delete the first item that match predicate in array
     * @author Gaetan
     * @param {(a: T, index: number) => boolean} predicate
     * @returns {T[]}
     * @memberof Array
     */
    deleteFirst(predicate: (a: T, index?: number) => boolean): T[];

    /**
     * @description Check if two array are equals (ONLY PRIMARY TYPE)
     * @author Houtekiet Yves
     * @param {Array<T>} a
     * @returns {boolean}
     * @memberof Array
     */
    equals(a: Array<T>): boolean;
}

Array.prototype.equals = function(a: Array<any>) {
    return this.length === a.length && this.every((v, i) => v === a[i]);
};

Array.prototype.deleteFirst = function (predicate: (a: any, index?: number) => boolean) {
    let i: any;
    for (i in this) {
        if (predicate(this[i], +i)) { break; }
    }
    return [ ...this.slice(0, +i), ...this.slice(+i + 1) ];
};

Array.prototype.divideByProperty = function(propertyName: string) {
    const result: any[] = [];
    const distinctValues: any[] = [];

    this.forEach(element => {
        if (distinctValues.indexOf(element[propertyName]) == -1) {
            distinctValues.push(element[propertyName]);
            result.push(this.filter(i => i[propertyName] == element[propertyName]));
        }
    });

    return result;
};

Array.prototype.uniqueBy = function(fieldName: string) {
    const result: any[] = [];
    const inserted: any[] = [];

    this.forEach((item) => {
        if (inserted.indexOf(item[fieldName]) === -1) {
            inserted.push(item[fieldName]);
            result.push(item);
        }
    });

    return result;
};

Array.prototype.firstIndexMatching = function(obj: any): number {
    const keys: string[] = Object.keys(obj);
    let result: number = -1;

    this.forEach((item, index) => {
        let match: boolean = true;
        keys.forEach(k => { if (item[k] !== obj[k]) { match = false; } });

        if (match && result === -1) { result = index; }
    });

    return result;
};

Array.prototype.containItemWith = function(property: string, value: any): boolean {
    let result: boolean = false;
    this.forEach(i => { if (i[property] === value) { result = true; } });
    return result;
};

Array.prototype.unique = function () {
    return this.filter((value, index) => this.indexOf(value) === index);
};

Array.prototype.flat = function() {
    return this.reduce((flat, toFlatten) => {
        return flat.concat(Array.isArray(toFlatten) ? toFlatten.flat() : toFlatten);
    }, []);
};

Array.prototype.toObject = function(predicate?: (a: any) => { key: string, value: any }): any {
    const obj: any = {};

    this.forEach((value, index) => {
        let result: { key: string, value: any } = { key: index, value: value };
        if (predicate) { result = predicate(value); }

        obj[result.key] = result.value;
    });

    return obj;
};