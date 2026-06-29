import { Controller, Get, Param, Res } from "@nestjs/common"
import { Response } from "express";
import { createReadStream,existsSync } from "fs";
import { join } from "path";


@Controller('filesPdf')
export class FileController {
  @Get(':name')
  getFile(@Res() res: Response,@Param("name") name : string) {
    try {
        if (existsSync(`filesPdf/${name}`)) {
            const file = createReadStream(join(process.cwd(), `filesPdf/${name}`));
            file.pipe(res); 
        }
  
    } catch (error) {
        console.log(error);
        
    }

  }
}