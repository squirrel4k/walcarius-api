export const Is = new class {

    public integer(obj: unknown): boolean {
        return Number.isInteger(obj);
    }

    public float(obj: unknown): boolean {
        return !!((obj as number) % 1);
    }

    public boolean(obj: unknown): boolean {
        return typeof obj === "boolean";
    }

    public string(obj: unknown): boolean {
        return typeof obj === "string";
    }
}
