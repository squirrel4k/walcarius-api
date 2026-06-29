interface Object {
    /**
     * @description Return all functions of an object.
     * @author Houtekiet Yves
     * @returns {Function[]}
     * @memberof Object
     */
    getFunctions(): Function[];
}

Object.prototype.getFunctions = function() {
    return Object.keys(Object.getPrototypeOf(this)).map(key => this[key]);
};