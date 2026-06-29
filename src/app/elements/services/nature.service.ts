import { Injectable } from "@nestjs/common";
import { NatureType, Nature } from "../interfaces/nature.interface";
import { Is } from "../../../core/utils/is";
import { NatureByElementGroupLoader } from "../loaders/nature-by-element-group.loader";
import { NatureByActionGroupLoader } from "../loaders/nature-by-action-group.loader";
import { ErrorUtil } from "../../../core/utils/error.util";

@Injectable()
export class NatureService {

    public constructor (
        private readonly _natureByElementGroupLoader: NatureByElementGroupLoader,
        private readonly _natureByActionGroupLoader: NatureByActionGroupLoader
    ) { }

    public elementNatureValues(values: Record<string, unknown>, natures: Nature[], oldValues?: Record<string, unknown>): Record<string, unknown> {
        const result: Record<string, unknown> = {};

        natures.forEach(nature => {
            const oldValue: unknown = oldValues ? oldValues[nature.name] : null;
            const inputValue: unknown = values ? values[nature.name] : null;
            const value: unknown = inputValue || oldValue || null;

            if (!nature.nullable && !nature.redefine && !value) {
                throw new Error(`The nature ${nature.name} is mandatory please provide a value.`);
            }
            if (!this.natureValueMatchType(nature.type, value, nature.regex)) {
                let errorMessage: string = `The nature ${nature.name} must be a ${nature.type.toLowerCase()}`;
                if (nature.type === "STRING" && nature.regex) {
                    errorMessage += " with a valid format.";
                } else { errorMessage += "."; }

                throw new Error(errorMessage);
            }

            result[nature.name] = nature.type !== "STRING" ? +value : value;
        });

        return result;
    }

    /**
     * @description Checks if value matches Nature type
     * @author Quentin Wolfs
     * @private
     * @param {NatureType} type
     * @param {*} value
     * @param {string} regex
     * @returns {boolean}
     * @memberof NatureService
     */
    private natureValueMatchType(type: NatureType, value: unknown, regex: string): boolean {
        switch (type) {
            case "STRING":
                return Is.string(value) && (!regex || new RegExp(regex).test(value as string));
            case "INT":
                return Is.integer(+value);
            case "FLOAT":
                return Is.float(+value) || Is.integer(+value);
            case "BOOLEAN":
                return Is.boolean(+value);
        }
    }

    /**
     * @description Get list of all Nature related to an ElementGroup using Dataloader
     * @author Quentin Wolfs
     * @param {number} elementGroupId
     * @param {string} uuid
     * @returns {Promise<Nature[]>}
     * @memberof NatureService
     */
    public async getNaturesByElementGroup(elementGroupId: number, uuid: string): Promise<Nature[]> {
        try {
            return this._natureByElementGroupLoader.get(uuid).load(elementGroupId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Get list of all Nature related to an ActionGroup using Dataloader
     * @author Quentin Wolfs
     * @param {number} actionGroupId
     * @param {string} uuid
     * @returns {Promise<Nature[]>}
     * @memberof NatureService
     */
    public async getNaturesByActionGroup(actionGroupId: number, uuid: string): Promise<Nature[]> {
        try {
            return this._natureByActionGroupLoader.get(uuid).load(actionGroupId);
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }
}
