import { LANG } from "../enums/language.enum";
import { join } from "path";
import { FileUtil } from "./file.util";
import { Logger } from "@nestjs/common";

export class TranslationUtil {

    private static _translations: { [lang: string]: any };

    /**
     * @description Init translations in application for requested languages if their JSON file is found
     * @author Quentin Wolfs
     * @static
     * @param {LANG[]} languages
     * @param {Logger} [logger]
     * @memberof TranslationUtil
     */
    public static async init(languages: LANG[], logger?: Logger) {
        for (const lang of languages) {
            const tlPath = join(process.env.WAL_I18N_PATH, `${lang}.json`);
            if (await FileUtil.exists(tlPath)) {
                const translations = JSON.parse(await FileUtil.readFileAsync(tlPath));
                TranslationUtil.addTranslation(lang, translations);
            } else {
                if (logger) { logger.warn(`Couln't find translations for [${lang}] at ${tlPath}`); }
            }
        }
    }

    /**
     * @description Add translation to memory storage
     * @author Quentin Wolfs
     * @private
     * @static
     * @param {LANG} lang
     * @param {*} data
     * @memberof TranslationUtil
     */
    private static addTranslation(lang: LANG, data: any): void {
        if (!TranslationUtil._translations) { TranslationUtil._translations = {}; }
        TranslationUtil._translations[lang] = data;
    }

    /**
     * @description Translate a key into its value in the selected language
     * @author Quentin Wolfs
     * @static
     * @param {string} key
     * @param {LANG} lang
     * @returns {string}
     * @memberof TranslationUtil
     */
    public static translate(key: string, lang: LANG): string {
        try {
            const path: string[] = key.split(".");
            let currentTranslation = TranslationUtil._translations[lang] ? TranslationUtil._translations[lang] : TranslationUtil._translations[LANG.FR];

            while (path.length > 0) {
                const currentPath = path.shift();
                if (currentTranslation[currentPath]) {
                    currentTranslation = currentTranslation[currentPath];
                } else {
                    return key;
                }
            }

            return currentTranslation;
        } catch (err) {
            return key;
        }
    }
}