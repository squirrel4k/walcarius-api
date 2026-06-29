import { Injectable } from "@nestjs/common";
import { ElementService } from "../../elements/services/element.service";
import { EntityManager } from "typeorm";
import { Element } from "../../elements/interfaces/element.interface";
import { ConversionUtil, AreaUnit, LengthUnit, VolumeUnit } from "../../../core/utils/conversion.util";
import { WeightData } from "../interfaces/weight-calculator.interface";
import { Matter } from "../../elements/interfaces/matter.interface";
import { WinstonLogger } from "../../common/logger/winston.logger";

@Injectable()
export class WeightCalculatorManager {

    public constructor(
        private readonly _elementSrv: ElementService,
        private readonly _logger: WinstonLogger
    ) { }

    /**
     * @description Get weight of an AmalgamGroup/Variant if a corresponding Element, Matter, format & category is set. Returns 0 otherwise.
     * @author Quentin Wolfs
     * @param {WeightData} data
     * @param {Matter[]} matters
     * @param {(string | EntityManager)} extra
     * @returns {Promise<number>}
     * @memberof WeightCalculatorManager
     */
    public async getWeight(data: WeightData, matters: Matter[], extra: string | EntityManager): Promise<number> {
        if (!data.matterId || !(data.format || (data.length && data.thickness && data.width)) || !data.supplyCategoryId) {
            // Cannot calculate weight if those parameters aren't given
            return 0;
        }
        const element = data.elementId ? await this._elementSrv.getById(data.elementId, extra): undefined;
        const weight = await this.getWeightByVolume(element, data, matters);

        return +weight.toFixed(3);
    }

    /**
     * @description Calculates weight by volume of the element multiplied by the matter weight by liter
     * @author Quentin Wolfs
     * @private
     * @param {Element} element
     * @param {WeightData} data
     * @param {Matter[]} matters
     * @param {(string | EntityManager)} extra
     * @returns {Promise<number>}
     * @memberof WeightCalculatorManager
     */
    private async getWeightByVolume(element: Element, data: WeightData, matters: Matter[]): Promise<number> {
        const matter = matters.find(mat => mat.id == data.matterId);
        if (!matter) {
            this._logger.warn(`Couldn't find matter [${data.matterId}] for weight calculation`);
            return 0;
        }
        if(data.format){
            if(!element) {
                this._logger.warn(`Couldn't find element for weight calculation`);
                return 0;
            }
            const volume = ConversionUtil.convert(element.natureValues["A"] as number, AreaUnit.MM_2, AreaUnit.M_2) * ConversionUtil.convert(+data.format, LengthUnit.MM, LengthUnit.M);
            return ConversionUtil.convert(volume, VolumeUnit.M_3, VolumeUnit.L) * matter.kgByLiter;
        } else if (data.length && data.width && data.thickness) {
            return ((+data.length * +data.width * +data.thickness) / 1000000) * matter.kgByLiter;
        }
        return 0;

    }
}