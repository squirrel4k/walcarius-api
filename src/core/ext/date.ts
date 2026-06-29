interface Date {
    /**
     * @description Returns the timestamp in seconds instead of milliseconds from getTime()
     * @returns {number}
     * @memberof Date
     */
    getTimeSeconds(): number;

    /**
     * @description Format a date to a DDMMYYYY format
     * @param {Date} date
     * @param {string} separator
     * @param {boolean} padNumbers
     * @returns {string}
     * @memberof Date
     */
    formatDate(separator: string, padNumbers: boolean, date?: Date): string;

    /**
     * @description Format a date to a DDMMYYYYhhmm format
     * @author Quentin Wolfs
     * @param {string} dateSeparator
     * @param {string} hourSeparator
     * @param {boolean} padNumbers
     * @param {Date} date
     * @returns {string}
     * @memberof Date
     */
    formatDateTime(dateSeparator: string, hourSeparator: string, separator: string, padNumbers: boolean, date?: Date): string;
}

Date.prototype.getTimeSeconds = function(): number {
    return Math.floor(this.getTime() / 1000);
};

Date.prototype.formatDate = function(separator: string, padNumbers: boolean, date?: Date): string {
    const days: number = date.getDate();
    const months: number = date.getMonth() + 1;

    return `${padNumbers && days < 10 ? `0${days}` : days}${separator}${padNumbers && months < 10 ? `0${months}` : months}${separator}${date.getFullYear()}`;
};

Date.prototype.formatDateTime = function(dateSeparator: string, hourSeparator: string, separator: string, padNumbers: boolean, date?: Date): string {
    const usedDate: Date = date ? date : this;
    const days: number = usedDate.getDate();
    const months: number = usedDate.getMonth() + 1;
    const hours: number = usedDate.getHours();
    const minutes: number = usedDate.getMinutes();

    return `${padNumbers && days < 10 ? `0${days}` : days}${dateSeparator}${padNumbers && months < 10 ? `0${months}` : months}${dateSeparator}${usedDate.getFullYear()}`
        + `${separator}${padNumbers && hours < 10 ? `0${hours}` : hours}${hourSeparator}${padNumbers && minutes < 10 ? `0${minutes}` : minutes}`;
};