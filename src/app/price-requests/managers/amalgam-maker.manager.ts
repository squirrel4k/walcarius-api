import { Injectable } from "@nestjs/common";
import { AmalgamConfig, CalculatedAmalgamPart, AmalgamInput, AmalgamCategory, CategoryParam, AmalgamParam } from "../interfaces/amalgam.interface";
import { SupplyListElementService } from "../../projects/services/supply-list-element.service";
import { amalgamConfig } from "../config/amalgam.config";
import { CalculatedAmalgam } from "../util/calculated-amalgam.class";
import { SupplyListElement, AmalgamSupplyListElement } from "../../projects/interfaces/supply-list-element.interface";
import { ArrayUtil } from "../../../core/utils/array.util";
import { EnumUtil } from "../../../core/utils/enum.util";
import { EntityManager } from "typeorm";
import { ErrorUtil } from "../../../core/utils/error.util";
import { BarsetGenerationService } from "../services/barset-generation.service";
import { BarsetGeneration } from "../interfaces/barset-generation.interface";

// tslint:disable-next-line: interface-over-type-literal
type AmalgamResult = {
    amalgams: AmalgamInput[],
    generation: BarsetGeneration
};

@Injectable()
export class AmalgamMakerManager {

    private _config: AmalgamConfig;

    public constructor(
        private readonly _supplyListElementSrv: SupplyListElementService,
        private readonly _barsetGenerationSrv: BarsetGenerationService
    ) {
        this._config = amalgamConfig;
    }

    /*********************
    * REAL CLASS METHODS *
    **********************/

    /**
     * @description Generate Amalgams for a given PriceRequest
     * @author Quentin Wolfs
     * @param {number} priceRequestId
     * @param {AmalgamParam} params
     * @param {AmalgamInput[]} locked
     * @param {EntityManager} transaction
     * @returns {Promise<Amalgam[]>}
     * @memberof AmalgamMakerManager
     */
    public async genAmalgams(priceRequestId: number, params: AmalgamParam, locked: AmalgamInput[], transaction: EntityManager): Promise<AmalgamResult> {
        // Prepare parameters for amalgam generation
        const generationData: BarsetGeneration = await this._barsetGenerationSrv.getOneBy({ priceRequestId: priceRequestId }, transaction);
        const usedParams: AmalgamParam = this.getUsedParams(generationData, params);

        // Get parts from related SupplyListElements
        const baseParts: CalculatedAmalgamPart[][] = await this.getAmalgamParts(priceRequestId, transaction);
        const parts: CalculatedAmalgamPart[][] = this.removeLockedParts(baseParts, locked);
        const splittedParts = this.splitParts(parts);
        let amalgams: CalculatedAmalgam[] = [];
        const startTime: Date = new Date();

        // Generate amalgams
        EnumUtil.getStringValues(AmalgamCategory).forEach(category => {
            splittedParts[category].forEach(partArray => {
                const amalgamableParts = ArrayUtil.splitArray(partArray, part => !part.isAlreadyInBarset);
                const generated = this.makeAmalgamsA5(amalgamableParts.valid, usedParams[category]);
                const alreadyDone = this.generateAlreadyDone(amalgamableParts.invalid);
                amalgams = [...amalgams, ...generated, ...alreadyDone];
            });
        });

        const generationResult = locked && Array.isArray(locked) ? [...locked, ...amalgams] : amalgams;
        return {
            amalgams: this.convertToPlain(generationResult),
            generation: this.addGenerationStats(generationData, parts, generationResult, startTime, usedParams)
        };
    }

    /**
     * @description Split parts into categories for amalgam generation
     * @author Quentin Wolfs
     * @private
     * @param {CalculatedAmalgamPart[][]} amalgamParts
     * @returns {{ [category: string]: CalculatedAmalgamPart[][] }}
     * @memberof AmalgamMakerManager
     */
    private splitParts(amalgamParts: CalculatedAmalgamPart[][]): { [category: string]: CalculatedAmalgamPart[][] } {
        const categories = EnumUtil.getStringValues(AmalgamCategory);
        const splitted: { [category: string]: CalculatedAmalgamPart[][] } = {};
        categories.forEach(cat => splitted[cat] = []);

        amalgamParts.forEach(parts => {
            if (parts.length > 0) {
                let found: boolean = false;
                for (let i = 0; !found && i < categories.length; i++) {
                    if (this._config.categoryIds[categories[i]].includes(parts[0].supplyCategoryId)) {
                        found = true;
                        splitted[categories[i]].push(parts);
                    }
                }
            }
        });

        return splitted;
    }

    /**
     * @description Remove locked parts from usable parts
     * @author Quentin Wolfs
     * @private
     * @param {CalculatedAmalgamPart[][]} parts
     * @param {AmalgamInput[]} locked
     * @returns {CalculatedAmalgamPart[][]}
     * @memberof AmalgamMakerManager
     */
    private removeLockedParts(parts: CalculatedAmalgamPart[][], locked: AmalgamInput[]): CalculatedAmalgamPart[][] {
        if (!locked) { return parts; }

        locked.forEach(lockedAmalgam => {
            lockedAmalgam.parts.forEach(lockedPart => {
                parts.some(partArray => {
                    return ArrayUtil.findAndRemove(partArray, (part => part.supplyListElementId == lockedPart.supplyListElementId )) != null;
                });
            });
        });

        return parts;
    }

    /**
     * @description Get all CalculatedAmalgamParts from the database and grouped by reference, options and matter
     * @author Quentin Wolfs
     * @private
     * @param {number} priceRequestId
     * @param {EntityManager} manager
     * @returns {Promise<AmalgamPart[][]>}
     * @memberof AmalgamMakerManager
     */
    private async getAmalgamParts(priceRequestId: number, manager: EntityManager): Promise<CalculatedAmalgamPart[][]> {
        try {
            const elements = await this._supplyListElementSrv.getSupplyListElementForAmalgam(priceRequestId, this._config.usedCategoryIds, manager);

            return elements.length > 0 ? this.groupAmalgamParts(elements) : [];
        } catch (e) {
            throw ErrorUtil.get(e);
        }
    }

    /**
     * @description Group each CalculatedAmalgamParts by reference, options and matter
     * @author Quentin Wolfs
     * @private
     * @param {SupplyListElement[]} elements
     * @returns {AmalgamPart[][]}
     * @memberof AmalgamMakerManager
     */
    private groupAmalgamParts(elements: AmalgamSupplyListElement[]): CalculatedAmalgamPart[][] {
        const baseElement = elements[0];

        const valid: CalculatedAmalgamPart[] = [];
        const invalid: AmalgamSupplyListElement[] = [];

        elements.forEach(element => {
            if (this.areTwoElementsSame(baseElement, element)) {
                for (let i = 0; i < element.quantity; i++) {
                    valid.push(this.formatAmalgamPart(element));
                }
            } else {
                invalid.push(element);
            }
        });

        return invalid.length > 0 ? [valid, ...this.groupAmalgamParts(invalid)] : [valid];
    }

    /**
     * @description Check if two SupplyListElements have the same ref, options & matter
     * @author Quentin Wolfs
     * @private
     * @param {SupplyListElement} base
     * @param {SupplyListElement} other
     * @returns {boolean}
     * @memberof AmalgamMakerManager
     */
    private areTwoElementsSame(base: SupplyListElement, other: SupplyListElement): boolean {
        return base.reference == other.reference
                && base.isBlack == other.isBlack
                && base.isBlasted == other.isBlasted
                && base.isPrimaryBlasted == other.isPrimaryBlasted
                && base.isEn1090 == other.isEn1090
                && (base.matterId == other.matterId || base.matterRef == other.matterRef);
    }

    /**
     * @description Format a AmalgamSupplyListElement into an CalculatedAmalgamPart
     * @author Quentin Wolfs
     * @private
     * @param {AmalgamSupplyListElement} element
     * @returns {AmalgamPart}
     * @memberof AmalgamMakerManager
     */
    private formatAmalgamPart(element: AmalgamSupplyListElement): CalculatedAmalgamPart {
        return {
            ...element,
            supplyListElementId: element.id,
            length: +element.format
        };
    }

    /**
     * @description Get sum of a property within an array
     * @author Quentin Wolfs
     * @private
     * @param {CalculatedAmalgam[]} amalgams
     * @param {string} property
     * @returns {number}
     * @memberof AmalgamMakerManager
     */
    private computeArrayTotalProperty(amalgams: CalculatedAmalgam[], property: string): number {
        return amalgams.length > 0 ? amalgams.map(amalgam => amalgam[property]).reduce((prev, curr) => prev + curr) : 0;
    }

    /**
     * @description Get Amalgam Params used for this generation
     * @author Quentin Wolfs
     * @private
     * @param {BarsetGeneration} generationData
     * @param {AmalgamParam} params
     * @returns {AmalgamParam}
     * @memberof AmalgamMakerManager
     */
    private getUsedParams(generationData: BarsetGeneration, params: AmalgamParam): AmalgamParam {
        return {
            beams: {
                length: params && params.beams && params.beams.length ? params.beams.length : generationData.beamLength,
                otherLengths: params && params.beams && params.beams.otherLengths ? params.beams.otherLengths : generationData.beamOtherLengths,
                isAutoCut: params && params.beams && params.beams.isAutoCut ? params.beams.isAutoCut : generationData.beamIsAutoCut,
                cutThreshold: params && params.beams && params.beams.cutThreshold ? params.beams.cutThreshold : generationData.beamCutThreshold,
                maxLoss: params && params.beams && params.beams.maxLoss ? params.beams.maxLoss : generationData.beamMaxLoss
            },
            tubes: {
                length: params && params.tubes && params.tubes.length ? params.tubes.length : generationData.tubeLength,
                otherLengths: params && params.tubes && params.tubes.otherLengths ? params.tubes.otherLengths : generationData.tubeOtherLengths,
                isAutoCut: params && params.tubes && params.tubes.isAutoCut ? params.tubes.isAutoCut : generationData.tubeIsAutoCut,
                cutThreshold: params && params.tubes && params.tubes.cutThreshold ? params.tubes.cutThreshold : generationData.tubeCutThreshold,
                maxLoss: params && params.tubes && params.tubes.maxLoss ? params.tubes.maxLoss : generationData.tubeMaxLoss
            },
        };
    }

    /**
     * @description Convert an array of CalculatedAmalgam into plain objet AmalgamInput
     * @author Quentin Wolfs
     * @private
     * @param {(CalculatedAmalgam|AmalgamInput)[]} amalgams
     * @returns {AmalgamInput[]}
     * @memberof AmalgamMakerManager
     */
    private convertToPlain(amalgams: (CalculatedAmalgam|AmalgamInput)[]): AmalgamInput[] {
        return amalgams.map(calculated => {
            if (!(calculated instanceof CalculatedAmalgam)) { return calculated; }
            const amalgam: AmalgamInput = {};
            this._config.parsedFields.forEach(field => amalgam[field] = ''+calculated[field] === 'NaN' ? 0 : calculated[field]);
            amalgam.parts = calculated.parts;

            return amalgam;
        });
    }

    /**
     * @description Add statistics about this amalgam generation to the BarsetGeneration
     * @author Quentin Wolfs
     * @private
     * @param {BarsetGeneration} data
     * @param {CalculatedAmalgamPart[][]} parts
     * @param {((AmalgamInput | CalculatedAmalgam)[])} generationResult
     * @param {Date} startTime
     * @returns {BarsetGeneration}
     * @memberof AmalgamMakerManager
     */
    private addGenerationStats(
        data: BarsetGeneration,
        parts: CalculatedAmalgamPart[][],
        generationResult: (AmalgamInput | CalculatedAmalgam)[],
        startTime: Date,
        usedParams: AmalgamParam
    ): BarsetGeneration {
        // Compute Parts stats
        let partsTotalLength: number = 0;
        let partsQuantity: number = 0;

        // Compute Amalgams stats
        let amalgamsTotalLength: number = 0;
        const amalgamsQuantity: number = generationResult.length;
        generationResult.forEach(amalgam => {
            amalgamsTotalLength += !isNaN(+amalgam.format) ? +amalgam.format : 0;
            amalgam.parts.forEach(part => {
                partsTotalLength += !isNaN(+part.length) ? +part.length : 0;
            });
            partsQuantity += !isNaN(+amalgam.parts.length) ? +amalgam.parts.length : 0;
        });

        return {
            id: data.id,
            ...(this._barsetGenerationSrv.formatNewParams(usedParams)),
            generationDuration: Date.now() - startTime.getTime(),
            partsTotalLength,
            amalgamsTotalLength,
            totalLoss: amalgamsTotalLength - partsTotalLength,
            lossPercent: ((amalgamsTotalLength - partsTotalLength) / amalgamsTotalLength) * 100,
            partsQuantity,
            amalgamsQuantity
        };
    }

    /******************
    *    ALGORITHMS   *
    *******************/


    /*  Algorithme 1 :
        - Prendre le plus grand
        - Vérifier la longueur restante à combler pour arriver à une certaine longueur
        - Tester chaque combinaison possible (dans les bonnes tailles) pour cette longueur
        - Garder celle qui a la plus petite perte
        - Recommencer au début avec les éléments utilisés retirés des éléments possibles
    */

    private makeAmalgamsA1(availablePieces: CalculatedAmalgamPart[], maxSize: number, amalgams: CalculatedAmalgam[]): CalculatedAmalgam[] {
        // If no more pieces, return array
        if (availablePieces.length == 0) { return amalgams; }
        const counter = { cpt: 0 };

        // Gen new CalculatedAmalgam
        const newAmalgam: CalculatedAmalgam = new CalculatedAmalgam(maxSize, availablePieces[0]);
        const fillResult = this.findBestCandidateA1(newAmalgam.parts, newAmalgam.loss, availablePieces, counter);
        newAmalgam.addManyParts(fillResult.pieces);
        newAmalgam.iterations = counter.cpt;
        amalgams.push(newAmalgam);

        // Try again with remaining pieces
        return this.makeAmalgamsA1(ArrayUtil.substractArray(availablePieces, newAmalgam.parts), maxSize, amalgams);
    }

    private findBestCandidateA1(usedPieces: CalculatedAmalgamPart[], fillableLength: number, availablePieces: CalculatedAmalgamPart[], counter: any): { pieces: CalculatedAmalgamPart[], loss: number } {
        counter.cpt++;
        // Only keep pieces of the right size
        const usablePieces = availablePieces.filter(piece => piece.length <= fillableLength);
        if (usablePieces.length == 0) { return { pieces: usedPieces, loss: fillableLength }; }

        // Find candidates for each possible piece
        const candidates: { pieces: CalculatedAmalgamPart[], loss: number }[] = usablePieces.map((piece, index, array) => {
            return this.findBestCandidateA1([...usedPieces, piece], fillableLength - piece.length, [...array.slice(0, index), ...array.slice(index + 1)], counter);
        });

        // Return only best candidate (MINIMAL LOSS)
        const reduced = candidates.reduce((prev, curr) => prev.loss < curr.loss ? prev : curr );
        return reduced;
    }

    /*  Algorithme 2 :
        - Trier les éléments par taille
        - Prendre le plus grand élément possible pour la longueur restante
        - Recommencer jusqu'à ce qu'il n'y ait plus d'élément possible
        - Recommencer au début avec les éléments utilisés retirés des éléments possibles
    */

    private makeAmalgamsA2(availablePieces: CalculatedAmalgamPart[], maxSize: number, amalgams: CalculatedAmalgam[]): CalculatedAmalgam[] {
        // If no more pieces, return array
        if (availablePieces.length == 0) { return amalgams; }
        const counter = { cpt: 0 };
        const model = availablePieces[0];

        // Gen new CalculatedAmalgam
        const newAmalgam: CalculatedAmalgam = new CalculatedAmalgam(maxSize, model);
        const fillResult = this.findBestCandidateA2(newAmalgam.parts, newAmalgam.loss, availablePieces, counter);
        newAmalgam.addManyParts(fillResult.pieces);
        newAmalgam.iterations = counter.cpt;
        amalgams.push(newAmalgam);

        // Try again with remaining pieces
        return this.makeAmalgamsA2(ArrayUtil.substractArray(availablePieces, newAmalgam.parts), maxSize, amalgams);
    }

    private findBestCandidateA2(usedPieces: CalculatedAmalgamPart[], fillableLength: number, availablePieces: CalculatedAmalgamPart[], counter?: any): { pieces: CalculatedAmalgamPart[], loss: number } {
        if (counter) { counter.cpt++; }
        // Get the biggest piece that fills the length
        const usablePieces = availablePieces.filter(piece => piece.length <= fillableLength);
        if (usablePieces.length == 0) { return { pieces: usedPieces, loss: fillableLength }; }

        // Find next piece to place
        return this.findBestCandidateA2([...usedPieces, usablePieces[0]], fillableLength - usablePieces[0].length, usablePieces.slice(1), counter);
    }

    private fillEn1090A2(amalgams: CalculatedAmalgam[], availablePieces: CalculatedAmalgamPart[], filled: CalculatedAmalgam[]): { filled: CalculatedAmalgam[], remaining: CalculatedAmalgamPart[] } {
        const amalgam = amalgams.shift();
        if (!amalgam) { return { filled, remaining: availablePieces }; }

        const counter = { cpt: amalgam.iterations };
        const fill = this.findBestCandidateA2(amalgam.parts, amalgam.loss, availablePieces, { cpt: amalgam.iterations });
        if (fill.pieces.length != amalgam.parts.length) {
            amalgam.addManyParts(ArrayUtil.substractArray(fill.pieces, amalgam.parts));
            amalgam.iterations = counter.cpt;
        }

        filled.push(amalgam);

        return this.fillEn1090A2(amalgams, ArrayUtil.substractArray(availablePieces, fill.pieces), filled);
    }

    /*  Algorithme 3 :
        - Trier les éléments par taille
        - Prendre le plus grand élément possible pour la longueur restante
        - Recommencer jusqu'à ce qu'il n'y ait plus d'élément possible
        - Tester la même chose avec des tailles plus grande et vérifier si on obtient moins de perte et sélectionner la solution avec le moins de perte
        - Recommencer au début avec les éléments utilisés retirés des éléments possibles
    */

    private makeAmalgamsA3(availablePieces: CalculatedAmalgamPart[], baseSize: number, maxSize: number, amalgams: CalculatedAmalgam[], category: string): CalculatedAmalgam[] {
        // If no more pieces, return array
        if (availablePieces.length == 0) { return amalgams; }
        const counter = { cpt: 0 };
        const model = availablePieces[0];


        // Define possible amalgam sizes
        const maxSizes: number[] = this.getPossibleSizes(baseSize, maxSize, category);

        // Gen new CalculatedAmalgam
        const fillResults = maxSizes.map(size => this.findBestCandidateA2([], size, availablePieces, counter));
        const lessLossResult = fillResults.reduce((prev, curr, index) => {
            if (prev.loss > curr.loss) {
                curr["index"] = index;
                return curr;
            }
            return prev;
        });
        const newAmalgam: CalculatedAmalgam = new CalculatedAmalgam(maxSizes[lessLossResult["index"] ? lessLossResult["index"] : 0], model);
        newAmalgam.addManyParts(lessLossResult.pieces);
        newAmalgam.iterations = counter.cpt;

        if (this.canAmalgamBeReduced(newAmalgam, this._config.underSizeThreshold)) {
            newAmalgam.setMaxFormat(this._config.underSizeThreshold);
        }
        amalgams.push(newAmalgam);

        // Try again with remaining pieces
        return this.makeAmalgamsA3(ArrayUtil.substractArray(availablePieces, newAmalgam.parts), baseSize, maxSize, amalgams, category);
    }

    private getPossibleSizes(baseSize: number, maxSize: number, category: string): number[] {
        return [baseSize, ...this._config.sizes[category].filter(s => s > baseSize && s <= maxSize)].sort((a, b) => a > b ? 1 : -1);
    }

    private canAmalgamBeReduced(amalgam: CalculatedAmalgam, threshold: number): boolean {
        return amalgam.parts.length > 0 ? amalgam.parts.map(p => p.length).reduce((p, c) => p + c) <= threshold : true;
    }

    /*  Algorithme 4 :
        - Prendre un élément aléatoire parmis les éléments possibles pour la longueur restante
        - Recommencer jusqu'à ce qu'il n'y ait plus d'élément possible
        - Tester la même chose avec des tailles plus grande et vérifier si on obtient moins de perte et sélectionner la solution avec le moins de perte
        - Recommencer au début avec les éléments utilisés retirés des éléments possibles
    */

    private makeAmalgamsA4(availablePieces: CalculatedAmalgamPart[], params: CategoryParam, amalgams: CalculatedAmalgam[]): CalculatedAmalgam[] {
        // If no more pieces, return array
        if (availablePieces.length == 0) { return amalgams; }
        const counter = { cpt: 0 };
        const model = availablePieces[Math.floor(Math.random() * availablePieces.length)];

        // Define possible amalgam sizes
        const maxSizes: number[] = [params.length];

        // Gen new CalculatedAmalgam
        const fillResults = maxSizes.map(size => this.findBestCandidateA4([], size, availablePieces, counter));
        let newAmalgam: CalculatedAmalgam;
        if (this.hasCandidates(fillResults)) {
            const lessLossResult =  fillResults.reduce((prev, curr, index) => {
                if (prev.loss > curr.loss) {
                    curr["index"] = index;
                    return curr;
                }
                return prev;
            });
            newAmalgam = new CalculatedAmalgam(maxSizes[lessLossResult["index"] ? lessLossResult["index"] : 0], model);
            newAmalgam.addManyParts(lessLossResult.pieces);
        } else {
            newAmalgam = new CalculatedAmalgam(availablePieces[0].length, availablePieces[0]);
            newAmalgam.addPart(availablePieces[0]);
            newAmalgam.setToCustom();
        }
        newAmalgam.iterations = counter.cpt;

        if (this.canAmalgamBeReduced(newAmalgam, this._config.underSizeThreshold)) {
            newAmalgam.setMaxFormat(this._config.underSizeThreshold);
        }
        amalgams.push(newAmalgam);

        // Try again with remaining pieces
        return this.makeAmalgamsA4(ArrayUtil.substractArray(availablePieces, newAmalgam.parts), params, amalgams);
    }

    private findBestCandidateA4(usedPieces: CalculatedAmalgamPart[], fillableLength: number, availablePieces: CalculatedAmalgamPart[], counter?: any): { pieces: CalculatedAmalgamPart[], loss: number } {
        if (counter) { counter.cpt++; }
        // Filter pieces depending if they are small enough to fit the length
        const usablePieces = availablePieces.filter(piece => piece.length <= fillableLength);
        if (usablePieces.length == 0) { return { pieces: usedPieces, loss: fillableLength }; }

        // Get a random piece from pieces that are usable on this length
        const index = Math.floor(Math.random() * usablePieces.length);

        // Find next piece to place
        return this.findBestCandidateA4([...usedPieces, usablePieces[index]], fillableLength - usablePieces[index].length, [...usablePieces.slice(0, index), ...usablePieces.slice(index + 1)], counter);
    }

    private hasCandidates(fillResults: { pieces: CalculatedAmalgamPart[], loss: number }[]): boolean {
        return fillResults.some(result => result.pieces.length > 0);
    }

    /*  Algorithme 5 :
        - Trier les éléments par taille décroissante
        - Effecturer une association par "Best fit decreasing" et "First fit decreasing"
        - Si d'autres longueurs sont possibles, tenter le shift pour chaque résultat
        - Garder la meilleure configuration entre les deux
        - Si une coupe automatique est demandée, couper les amalgames au dessus du seuil donné
    */

    private makeAmalgamsA5(availablePieces: CalculatedAmalgamPart[], params: CategoryParam): CalculatedAmalgam[] {
        if (availablePieces.length === 0) { return []; }

        // Sort pieces by decreasing order
        availablePieces = availablePieces.sort((a, b) => a.length > b.length ? -1 : 1);
        const sizeAboveLength = ArrayUtil.splitArray(params.otherLengths, (oLength => oLength > params.length));

        let BFAmalgams = this.bestFit(availablePieces, params);
        let FFAmalgams = this.firstFit(availablePieces, params);

        // If other lengths possibles, try to shift them
        if (sizeAboveLength.valid.length > 0) {
            BFAmalgams = this.shiftMovables(BFAmalgams, params.maxLoss, sizeAboveLength.valid);
            FFAmalgams = this.shiftMovables(FFAmalgams, params.maxLoss, sizeAboveLength.valid);
        }
        // Reduce amalgams with total length of parts lower than 6000 to format 6000
        BFAmalgams = this.reduceAmalgamLengths(BFAmalgams, sizeAboveLength.invalid);
        FFAmalgams = this.reduceAmalgamLengths(FFAmalgams, sizeAboveLength.invalid);

        const BFLoss = this.computeArrayTotalProperty(BFAmalgams, "loss");
        const FFLoss = this.computeArrayTotalProperty(FFAmalgams, "loss");

        const usedAmalgams = BFLoss < FFLoss ? BFAmalgams : FFAmalgams;

        // Auto-cut if needed
        if (params.isAutoCut) {
            usedAmalgams.forEach(amalgam => {
                if (amalgam.loss >= params.cutThreshold && amalgam.parts.length == 1) { amalgam.setToCustom(); }
            });
        }

        return usedAmalgams;
    }

    /**
     * @description Performs a "Best fit" heuristic on available parts to determine amalgam repartition. Is "decreasing" and a lot more efficient if given parts
     * are sorted non-increasingly.
     * @author Quentin Wolfs
     * @private
     * @param {CalculatedAmalgamPart[]} availablePieces
     * @param {CategoryParam} params
     * @returns {CalculatedAmalgam[]}
     * @memberof AmalgamMakerManager
     */
    private bestFit(availablePieces: CalculatedAmalgamPart[], params: CategoryParam): CalculatedAmalgam[] {
        const amalgams: CalculatedAmalgam[] = [];
        // Can only init amalgams with sizes >= base length
        const assignableLengths = [params.length, ...params.otherLengths.filter(len => len >= params.length)];

        availablePieces.forEach(part => {
            let min = null;
            let bestIndex = 0;

            // Look for possible amalgam that would be filled the fullest
            amalgams.forEach((amalgam, index) => {
                if (amalgam.loss >= part.length && amalgam.loss - part.length < min) {
                    bestIndex = index;
                    min = amalgam.loss - part.length;
                }
            });

            if (min === null) {
                // Take all possible sizes that are greater or equal than part length
                const availableSizes = assignableLengths.filter(len => len >= part.length);
                // Use the minimum size of all available if there is at least one size available. If not, create a custom amalgam using the part length as size
                const newAmalgam = new CalculatedAmalgam(availableSizes.length > 0 ? Math.min(...availableSizes) : part.length, part);
                newAmalgam.addPart(part);
                amalgams.push(newAmalgam);
            } else {
                amalgams[bestIndex].addPart(part);
            }
        });

        return amalgams;
    }

    /**
     * @description Performs a "First fit" heuristic on available parts to determine amalgam repartition. Is "decreasing" and a lot more efficient if given parts
     * are sorted non-increasingly.
     * @author Quentin Wolfs
     * @private
     * @param {CalculatedAmalgamPart[]} availablePieces
     * @param {CategoryParam} params
     * @returns {CalculatedAmalgam[]}
     * @memberof AmalgamMakerManager
     */
    private firstFit(availablePieces: CalculatedAmalgamPart[], params: CategoryParam): CalculatedAmalgam[] {
        const amalgams: CalculatedAmalgam[] = [];
        // Can only init amalgams with sizes >= base length
        const assignableLengths = [params.length, ...params.otherLengths.filter(len => len >= params.length)];

        availablePieces.forEach(part => {
            // Search the first amalgam where the part would fit
            const suitableAmalgam = amalgams.find(amalgam => amalgam.loss >= part.length);

            if (suitableAmalgam !== undefined) {
                suitableAmalgam.addPart(part);
            } else {
                // Take all possible sizes that are greater or equal than part length
                const availableSizes = assignableLengths.filter(len => len >= part.length);
                // Use the minimum size of all available if there is at least one size available. If not, create a custom amalgam using the part length as size
                const newAmalgam = new CalculatedAmalgam(availableSizes.length > 0 ? Math.min(...availableSizes) : part.length, part);
                newAmalgam.addPart(part);
                amalgams.push(newAmalgam);
            }
        });

        return amalgams;
    }

    /**
     * @description Try to shift all amalgam parts from amalgams with losses over given threshold into others amalgams by changing their size
     * @author Quentin Wolfs
     * @private
     * @param {CalculatedAmalgam[]} amalgams
     * @param {number} shiftThreshold
     * @param {number[]} sizes
     * @returns {CalculatedAmalgam[]}
     * @memberof AmalgamMakerManager
     */
    private shiftMovables(amalgams: CalculatedAmalgam[], shiftThreshold: number, sizes: number[]): CalculatedAmalgam[] {
        if (amalgams.length <= 1) { return amalgams; }
        // Sum of all amalgam's loss
        let currentLoss = amalgams.map(amalgam => amalgam.loss).reduce((prev, curr) => prev + curr);

        for (let i = amalgams.length - 1; i > 0; i--) {
            // Only try to shift when amalgam's loss is above given threshold
            if (amalgams[i].loss >= shiftThreshold) {
                const copy = amalgams[i].clone();
                const parts = copy.parts;
                const others = amalgams.filter((am, index) => index !== i).map(amalgam => amalgam.clone());

                if (others.length > 0) {
                    parts.forEach(part => {
                        let done: boolean = false;
                        for (let k = 0; !done && k < others.length; k++) {
                            // Check new length with current parts + new parts
                            const minSize = +others[k].format - others[k].loss + part.length;
                            const usableSize = sizes.find(size => minSize <= size);

                            // If found a usable size, shift part from current amalgam to found amalgam
                            if (usableSize) {
                                done = copy.removePart(part);
                                if (done) {
                                    others[k].setMaxFormat(usableSize);
                                    others[k].addPart(part);
                                }
                            }
                        }
                    });

                    // Check new sum of all losses after shift
                    let newLoss = others.map(amalgam => amalgam.loss).reduce((prev, curr) => prev + curr);
                    if (copy.parts.length > 0) { newLoss += copy.loss; }

                    // If new loss is better, replace previous amalgams by new configuration
                    if (newLoss < currentLoss) {
                        amalgams = others;
                        if (copy.parts.length > 0) { amalgams.push(copy); }
                        currentLoss = newLoss;
                    }
                }
            }
        }

        return amalgams;
    }

    /**
     * @description Reduce all amalgams that are small enough to fit in the given sizes
     * @author Quentin Wolfs
     * @param {CalculatedAmalgam[]} amalgams
     * @param {number[]} underSizes
     * @returns {CalculatedAmalgam[]}
     * @memberof AmalgamMakerManager
     */
    public reduceAmalgamLengths(amalgams: CalculatedAmalgam[], underSizes: number[]): CalculatedAmalgam[] {
        return amalgams.map(amalgam => {
            const newSize = underSizes.find(size => amalgam.totalLength <= size);
            return newSize ? amalgam.setMaxFormat(newSize) : amalgam;
        });
    }

    /**
     * @description Generate already done amalgams for parts that are in a SupplyList tagged as "AlreadyInBarset"
     * @author Quentin Wolfs
     * @private
     * @param {CalculatedAmalgamPart[]} parts
     * @returns {CalculatedAmalgam[]}
     * @memberof AmalgamMakerManager
     */
    private generateAlreadyDone(parts: CalculatedAmalgamPart[]): CalculatedAmalgam[] {
        return parts.map(part => {
            const amalgam = new CalculatedAmalgam(part.length, part);
            amalgam.addPart(part);
            return amalgam;
        });
    }
}