interface Number {
    /**
     * @description Add '0' character before a number
     * @param {number} size number of '0' character to add before value.
     * @returns {string}
     * @memberof Number
     */
    padNumber(size: number): string;
}

Number.prototype.padNumber = function(size: number): string {
    const zero: number = size - this.toString().length + 1;
    return Array(+(zero > 0 && zero)).join("0") + this;
};