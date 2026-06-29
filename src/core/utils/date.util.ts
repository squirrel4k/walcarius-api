enum DatePattern {
    FULL_YEAR = "YYYY",
    YEAR = "YY",
    MONTH = "MM",
    DAY = "DD",
    HOURS = "hh",
    MINUTES = "mm",
    SECONDS = "ss"
}

export const DateUtil = new class {

    /**
     * @description Returns the timestamp in seconds instead of milliseconds from getTime()
     * @author Quentin Wolfs
     * @param {Date} date
     * @returns {number}
     */
    public getTimeSeconds(date: Date): number {
        if (date === null || date === undefined) { return null; }
        return Math.floor(date.getTime() / 1000);
    }

    /**
     * @description Displays a Date object into readable string. Usable formats :
     * YYYY - Full year
     * YY   - Last two digits of year
     * MM   - Month
     * DD   - Day of month
     * hh   - Hours
     * mm   - Minutes
     * ss   - Seconds
     * Example : DD/MM/YYYY -> 17/08/2019
     * @author Quentin Wolfs
     * @param {Date} date
     * @param {string} format
     * @returns {string}
     */
    public displayDate(date: Date, format: string): string {
        if (!date) { return format; }
        let formatted = format;
        const padNumber = (num: number, size: number) => {
            const zero: number = size - num.toString().length + 1;
            return Array(+(zero > 0 && zero)).join("0") + num;
        };

        if (format.indexOf(DatePattern.FULL_YEAR) !== -1) {
            formatted = formatted.replace(DatePattern.FULL_YEAR, date.getFullYear().toString());
        }
        if (format.indexOf(DatePattern.YEAR) !== -1) {
            formatted = formatted.replace(DatePattern.YEAR, date.getFullYear().toString().substr(-2));
        }
        if (format.indexOf(DatePattern.MONTH) !== -1) {
            formatted = formatted.replace(DatePattern.MONTH, padNumber(date.getMonth() + 1, 2));
        }
        if (format.indexOf(DatePattern.DAY) !== -1) {
            formatted = formatted.replace(DatePattern.DAY, padNumber(date.getDate(), 2));
        }
        if (format.indexOf(DatePattern.HOURS) !== -1) {
            formatted = formatted.replace(DatePattern.HOURS, padNumber(date.getHours(), 2));
        }
        if (format.indexOf(DatePattern.MINUTES) !== -1) {
            formatted = formatted.replace(DatePattern.MINUTES, padNumber(date.getMinutes(), 2));
        }
        if (format.indexOf(DatePattern.SECONDS) !== -1) {
            formatted = formatted.replace(DatePattern.SECONDS, padNumber(date.getSeconds(), 2));
        }

        return formatted;
    }
};