import * as mime from "mime-types";
import { v4 } from "uuid";
import { Response } from "express";
import { URL } from "url";
import { F_OK } from "constants";
import { join } from "path";
import { unlinkSync, createWriteStream, createReadStream, access, readFile } from "fs";

export const FileUtil = new class {

    public write(upload: Promise<any>, dirPath: string): Promise<string> {
        return new Promise((resolve, reject) => {
            upload.then(file => {
                const { stream, filename } = file;
                const id = v4();
                const fullPath: string = join(dirPath, `${id}-${filename}`);
                stream.on("error", error => {
                    if (stream.truncated) {
                        // Delete the truncated file
                        unlinkSync(fullPath);
                        reject(error);
                    }
                })
                .pipe(createWriteStream(fullPath))
                .on("error", error => reject(error))
                .on("finish", () => resolve(fullPath));
            }).catch(err => {
                reject(err);
            });
        });
    }

    public async download(fileUri: string, fileName: string, res: Response, deleteAfter: boolean): Promise<void> {
        if (!(await this.exists(fileUri))) {
            throw new Error("The asked file doesn't exist.");
        }
        const contentType = this.mime(fileUri);
        // Set headers
        res.header("Content-disposition", "inline; filename=" + fileName);
        res.header("Content-type", contentType);

        createReadStream(fileUri).pipe(res);
        if (deleteAfter) {
            res.on("finish", () => {
                unlinkSync(fileUri);
            });
        }
    }

    public mime(fileUri: string): string {
        const fileName: string = fileUri.split("/").pop();
        return mime.contentType(fileName).toString().split(";")[0];
    }

    /**
     * @description Verifies asynchronously if file exists
     * @author Quentin Wolfs
     * @param {(string | Buffer | URL)} path
     * @returns {Promise<boolean>}
     */
    public exists(path: string | Buffer | URL): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            access(path, F_OK, (err) => {
                resolve(err ? false : true);
            });
        });
    }

    /**
     * @description Wrapper for async/await of fs.readFile
     * @author Quentin Wolfs
     * @param {*} path
     */
    public readFileAsync(path: string | Buffer | URL): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            readFile(path, (err, data) => {
                err ? reject(err) : resolve(data.toString());
            });
        });
    }
};