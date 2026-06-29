import { Injectable } from "@nestjs/common";
import { ParsedTekla, TeklaHeader, TeklaConfig, TeklaPropertyIndex } from "../interfaces/tekla.interface";
import { teklaConfig } from "../config/tekla.config";
import { SupplyListElement } from "../interfaces/supply-list-element.interface";
import { MatterService } from "../../elements/services/matter.service";
import { Matter } from "../../elements/interfaces/matter.interface";
import { ElementService } from "../../elements/services/element.service";
import { SupplyCategory } from "../../suppliers/interfaces/supply-category.interface";
import { SupplyCategoryService } from "../../suppliers/services/supply-category.service";

@Injectable()
export class TeklaParserService {

    private _config: TeklaConfig;

    public constructor(
        private readonly _matterSrv: MatterService,
        private readonly _elementSrv: ElementService,
        private readonly _supplyCategorySrv: SupplyCategoryService
    ) {
        this._config = teklaConfig;
    }

    /**
     * @description Parse Tekla Csv file
     * @author Quentin Wolfs
     * @param {string} rawTekla
     * @returns {ParsedTekla}
     * @memberof TeklaParserService
     */
    public async parseCsv(rawTekla: string): Promise<ParsedTekla> {
        // Remove extra space at the start of each line
        rawTekla = rawTekla.replace(/(^ {5})|(\n {5})/g, "");
        const teklaLines = rawTekla.split("\r");

        // Get all Matter beforehand
        const categories: SupplyCategory[] = await this._supplyCategorySrv.getList();
        const matters: Matter[] = await this._matterSrv.matterList();

        // Parse content of the Teka file
        const header = this.parseHeader(teklaLines.splice(0, 8));
        const { elements, references } = this.parseContent(teklaLines, matters, categories);

        // Match each element with its counterpart in database
        const fullElements = await this.matchElementIds(elements, references);

        return this.formatResponse(header, fullElements);
    }

    /**
     * @description Parse header of the Tekla file
     * @author Quentin Wolfs
     * @private
     * @param {string[]} headerLines
     * @returns {TeklaHeader}
     * @memberof TeklaParserService
     */
    private parseHeader(headerLines: string[]): TeklaHeader {
        return {
            project: headerLines[2].match(/Project: +([^;]*);*$/)[1],
            date: headerLines[3].match(/Datum: +([^;]*);*$/)[1],
            model: headerLines[2].split("Project")[0].split(" - ")[0].match(/Model: ([^;]*);*$/)[1].trim()
        };
    }

    /**
     * @description Parse content of the Tekla file (without header)
     * @author Quentin Wolfs
     * @private
     * @param {string[]} lines
     * @param {Matter[]} matters
     * @param {SupplyCategory[]} categories
     * @returns {{ elements: SupplyListElement[], references: string[] }}
     * @memberof TeklaParserService
     */
    private parseContent(lines: string[], matters: Matter[], categories: SupplyCategory[]): { elements: SupplyListElement[], references: string[] } {
        const parsedElements: SupplyListElement[] = [];
        const references: Set<string> = new Set<string>();
        let parsed: SupplyListElement;
        lines.forEach(line => {
            parsed = this.parseLine(line, matters, categories);
            if (parsed) {
                parsedElements.push(parsed);

                // Update DB lookup array
                if (parsed.supplyCategoryId !== null) {
                    references.add(parsed.reference);
                }
            }
        });

        return { elements: parsedElements, references: Array.from(references) };
    }

    /**
     * @description Parse line from Tekla into a SupplyListElement
     * @author Quentin Wolfs
     * @private
     * @param {string} line
     * @param {Matter[]} matters
     * @param {SupplyCategory[]} categories
     * @returns {SupplyListElement}
     * @memberof TeklaParserService
     */
    private parseLine(line: string, matters: Matter[], categories: SupplyCategory[]): SupplyListElement {
        // Split by property and remove extra spaces
        const props = line.split(/ *; */);

        // Only lines with enough props are real usable lines
        if (props.length > 6 && props[TeklaPropertyIndex.REFERENCE].length > 0 && props[TeklaPropertyIndex.LENGTH].length > 0) {
            const foundId = this.matchCategoryId(props[0], categories);
            if (foundId !== -1) {
                return this.formatElement(props, foundId, matters);
            }
        }

        return null;
    }

    /**
     * @description Match the categoryId corresponding to a given reference
     * @author Quentin Wolfs
     * @private
     * @param {string} ref
     * @param {SupplyCategory[]} categories
     * @returns {number}
     * @memberof TeklaParserService
     */
    private matchCategoryId(ref: string, categories: SupplyCategory[]): number {
        if (!this.isRefParsable(ref)) {
            return -1;
        }
        const foundCategory = Object.keys(this._config.parsed).find(category => {
            return this._config.parsed[category].regex.test(ref);
        });

        return foundCategory ? categories.find(cat => cat.name == foundCategory).id : null;
    }

    /**
     * @description Verifies if a reference doesn't start by an ignored type
     * @author Quentin Wolfs
     * @private
     * @param {string} reference
     * @returns {boolean}
     * @memberof TeklaParserService
     */
    private isRefParsable(reference: string): boolean {
        return new RegExp(`^((?!(${this._config.ignored.join("|")})).)*$`).test(reference);
    }

    /**
     * @description Format a Tekla line to a SupplyListElement
     * @author Quentin Wolfs
     * @private
     * @param {string[]} props
     * @param {number} categoryId
     * @param {Matter[]} matters
     * @returns {SupplyListElement}
     * @memberof TeklaParserService
     */
    private formatElement(props: string[], categoryId: number, matters: Matter[]): SupplyListElement {
        return {
            reference: props[TeklaPropertyIndex.REFERENCE],
            denomination: props[TeklaPropertyIndex.POS],
            matterRef: props[TeklaPropertyIndex.MATTER],
            matterId: this.findMatterId(props[TeklaPropertyIndex.MATTER], matters),
            quantity: +props[TeklaPropertyIndex.QUANTITY],
            format: props[TeklaPropertyIndex.LENGTH],
            weight: +props[TeklaPropertyIndex.WEIGHT],
            isBlack: true,
            supplyCategoryId: categoryId
        };
    }

    /**
     * @description Find Matter ID corresponding to its reference in Tekla file
     * @author Quentin Wolfs
     * @private
     * @param {string} reference
     * @param {Matter[]} matters
     * @returns {number}
     * @memberof TeklaParserService
     */
    private findMatterId(reference: string, matters: Matter[]): number {
        const foundMatter = matters.find(matter => {
            const searchName = matter.en1090Name ? matter.en1090Name : matter.name;
            return new RegExp(`^${searchName}.*$`).test(reference);
        });

        return foundMatter ? foundMatter.id : null;
    }

    /**
     * @description Try to match every element with their counterpart in database
     * @author Quentin Wolfs
     * @private
     * @param {SupplyListElement[]} elements
     * @param {strign[]} references
     * @returns {Promise<SupplyListElement[]>}
     * @memberof TeklaParserService
     */
    private async matchElementIds(elements: SupplyListElement[], references: string[]): Promise<SupplyListElement[]> {
        const foundElements = await this._elementSrv.findElementsFromTekla(references);

        return elements.map(element => {
            if (element.supplyCategoryId !== null && element.matterId !== null) {
                const matchedElement = foundElements.find(el => el.name == element.reference);
                element.elementId = matchedElement ? matchedElement.id : null;
            }

            return element;
        });
    }

    /**
     * @description Format response from parsing the CSV file
     * @author Quentin Wolfs
     * @private
     * @param {TeklaHeader} header
     * @param {SupplyListElement[]} elements
     * @returns {ParsedTekla}
     * @memberof TeklaParserService
     */
    private formatResponse(header: TeklaHeader, elements: SupplyListElement[]): ParsedTekla {
        return {
            project: {
                reference: header.project
            },
            supplyList: {
                model: header.model,
                elements: elements
            }
        };
    }
}