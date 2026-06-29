import { CalculatedAmalgamPart, AmalgamInput } from "../interfaces/amalgam.interface";

export class CalculatedAmalgam implements AmalgamInput {

    private _reference: string;
    private _parts: Set<CalculatedAmalgamPart>;
    private _format: number;
    private _loss: number;
    private _neededIterations: number;
    private _isEn1090: boolean;
    private _isBlack: boolean;
    private _isBlasted: boolean;
    private _isPrimaryBlasted: boolean;
    private _isLocked: boolean;
    private _matterId: number;
    private _matterRef: string;
    private _icon: string;
    private _isCut: boolean;
    private _supplyCategoryId: number;
    private _elementId: number;
    private _usedSpace: number;
    private _remark: string;
    private _remarkOnce: boolean;

    public constructor(maxSize: number, model: CalculatedAmalgamPart) {
        this._format = maxSize;
        this._loss = maxSize;
        this._reference = model.reference;
        this._matterId = model.matterId;
        this._matterRef = model.matterRef;
        this._isBlack = model.isBlack;
        this._isBlasted = model.isBlasted;
        this._isPrimaryBlasted = model.isPrimaryBlasted;
        this._isEn1090 = model.isEn1090;
        this._icon = model.icon;
        this._supplyCategoryId = model.supplyCategoryId;
        this._elementId = model.elementId;
        this._isCut = false;
        this._isLocked = false;
        this._parts = new Set<CalculatedAmalgamPart>();
        this._usedSpace = 0;
        this._remark = null;
        this._remarkOnce = false;
    }

    public get reference(): string {  return this._reference; }

    public get parts(): CalculatedAmalgamPart[] { return Array.from(this._parts); }

    public get loss(): number { return this._loss; }

    public get iterations(): number { return this._neededIterations ? this._neededIterations : 0; }

    public set iterations(value: number) { this._neededIterations = value; }

    public get isEn1090(): boolean { return this._isEn1090; }

    public get format(): string { return this._format.toString(); }

    public get matterId(): number { return this._matterId; }

    public get matterRef(): string { return this._matterRef; }

    public get isBlack(): boolean { return this._isBlack; }

    public get isBlasted(): boolean { return this._isBlasted; }

    public get isPrimaryBlasted(): boolean { return this._isPrimaryBlasted; }

    public get icon(): string { return this._icon; }

    public get isLocked(): boolean { return this._isLocked; }

    public get isCut(): boolean { return this._isCut; }

    public get supplyCategoryId(): number { return this._supplyCategoryId; }

    public get elementId(): number { return this._elementId; }

    public get totalLength(): number { return this._usedSpace; }

    public get remark(): string { return this._remark; }

    public addPart(part: CalculatedAmalgamPart): boolean {
        const newLoss = this._loss - part.length;
        if (newLoss < 0) { return false; }

        this._parts.add(part);
        this._loss = newLoss;
        if (part.isEn1090) { this._isEn1090 = true; }
        this._usedSpace += part.length;

        // If no remark, use part's remark. If remark exists and is not the same as added part, void it
        if (!!part.remark) {
            if (!this._remarkOnce) {
                this._remark = part.remark;
                this._remarkOnce = true;
            } else {
                this._remark = !!this._remark && this._remark != part.remark ? null : part.remark;
            }
        }

        return true;
    }

    public addManyParts(parts: CalculatedAmalgamPart[]): boolean {
        return parts.every(part => this.addPart(part));
    }

    public removePart(part: CalculatedAmalgamPart): boolean {
        if (!this._parts.has(part)) { return false; }
        this._parts.delete(part);
        this._loss += part.length;
        this._usedSpace -= part.length;

        return true;
    }

    public setMaxFormat(newFormat: number): CalculatedAmalgam {
        const diff = this._format - newFormat;
        if (this._loss >= diff) {
            this._format = newFormat;
            this._loss -= diff;
        }

        return this;
    }

    public setToCustom(): void {
        this._isCut = true;
    }

    public clone(): CalculatedAmalgam {
        // New model
        const modelFields = [ "reference", "matterId", "matterRef", "isBlack", "isBlasted", "isPrimaryBlasted", "isEn1090", "icon", "supplyCategoryId", "elementId" ];
        const model = {};
        modelFields.forEach(field => model[field] = this[`_${field}`]);

        // Clone amalgam
        const clone = new CalculatedAmalgam(this._format, model);
        clone.addManyParts(this.parts);

        return clone;
    }
}