export const ObjectUtil = new class {

    public CsvToJson(content: string, headers?: string[]): any[] {
        const lines: string[] = content.replace(/\r/g, "").split("\n");

        const result = lines.filter(l => l !== "").map(line => {
            const values: string[] = line.split(";");
            const obj: any = !!headers ? {} : [];
            values.forEach((value, index) => {
                if (headers) {
                    obj[headers[index]] = value;
                } else {
                    obj.push(value);
                }
            });

            return obj;
        });

        return result;
    }

    /**
     * @description Provide a clone of the given object without any reference to his origin
     * @author Houtekiet Yves
     * @template T
     * @param {T} obj
     * @param {*} [hash=new WeakMap()]
     * @returns {T}
     */
    public deepClone<T>(obj: T, hash = new WeakMap()): T {
        if (Object(obj) !== obj) { return obj; } // primitives
        if (hash.has(<any>obj)) { return hash.get(<any>obj); }// cyclic reference
        const result = obj instanceof Date ? new Date(obj)
                    : obj instanceof RegExp ? new RegExp(obj.source, obj.flags)
                    : obj.constructor ? new (<any>obj).constructor()
                    : Object.create(null);
        hash.set(<any>obj, result);
        if (obj instanceof Map) {
            Array.from(obj, ([key, val]) => result.set(key, this.deepClone(val, hash)) );
        }
        return Object.assign(result, ...Object.keys(obj).map (
            key => ({ [key]: this.deepClone(obj[key], hash) }) ));
    }

    /**
     * @description Verifies equality between two objects, checking fields given or all fields of first object
     * @author Quentin Wolfs
     * @template T
     * @param {T} a
     * @param {T} b
     * @param {string[]} [fields]
     * @returns {boolean}
     */
    public equals<T>(a: T, b: T, fields?: string[]): boolean {
        const usedFields: string[] = fields ? fields : Object.keys(a);

        return usedFields.every(field => a[field] == b[field]);
    }

    /**
     * @description Verifies equality between two objects, checking fields given or all fields of first object. Accepts "|" operator in given fields
     * to indicate a OR relation between two fields (ex: age|height => a.age == b.age || a.height == b.height)
     * @author Quentin Wolfs
     * @template T
     * @param {T} a
     * @param {T} b
     * @param {string[]} [fields]
     * @returns {boolean}
     */
    public equalsWithOperators<T>(a: T, b: T, fields?: string[]): boolean {
        const usedFields: string[] = fields ? fields : Object.keys(a);

        return usedFields.every(field => {
            if (field.includes("|")) {
                return field.split("|").some(subField => a[subField] == b[subField]);
            } else {
                return a[field] == b[field];
            }
        });
    }
};