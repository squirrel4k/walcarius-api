export const Is = new class {

    public integer(obj: any): boolean {
        return Number.isInteger(obj);
    }

    public float(obj: any): boolean {
        return !!(obj % 1);
    }

    public boolean(obj: any): boolean {
        return typeof obj === "boolean";
    }

    public string(obj: any): boolean {
        return typeof obj === "string";
    }
};