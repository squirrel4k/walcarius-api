import { Controller, Post, UseInterceptors, UploadedFiles, Get, Param, Res } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { diskStorage } from 'multer';
import { FileUtil } from "../../../core/utils/file.util";
import { Response } from "express";
import { GRANT_TOKEN } from '../../common/jwt/jwt.interface';
import { Access } from '../../../core/decorators/access.decorator';
import { ReceivedFile } from '../../../core/interfaces/file.interface';
import { createReadStream } from 'fs';
import { ScanPdfService } from '../services/scan-pdf.service';
import { ScanPdfSql } from '../entities/scan-pdf.entity';
import { PurchaseOrder } from '../../purchase-orders/interfaces/purchase-order.interface';
import { PurchaseOrderSql } from '../../purchase-orders/entities/purchase-order.entity';
import { PurchaseOrderService } from '../../purchase-orders/services/purchase-order.service';

import { ErrorUtil } from '../../../core/utils/error.util';
const PATH = require('path')

@Controller('/api/scan')
export class ScanPdfController {
 
  constructor(
        private readonly _dataSource: DataSource,
        private readonly _scanPdfSrv: ScanPdfService,
    private readonly  _purchaseOrderSrv: PurchaseOrderService,
    ) {
  }

  @Get("/:url")
  // @Access(GRANT_TOKEN.FRONT_ACCESS)
  public async getScanPdf(@Param("url") url: string, @Res() res: Response) {
    // check if ScanPdf exist in DB
    const scanPdf: ScanPdfSql = await this._scanPdfSrv.findByUrl(url)
    if (!scanPdf) { throw new Error("Entity not found."); }

    // check purchaseOrder
    const purchaseOrder: PurchaseOrder = scanPdf.purchaseOrder;
    if (!purchaseOrder) { throw new Error("PurchaseOrder not found."); }
    
    // check permission
    const hasPerm = true;  // todo : has permission
    if (!hasPerm) { throw new Error("You don't have the permission to access this file"); }

    // check if file exist on local storage
    const filePath: string = process.cwd() + PATH.sep + 'filesPdf' + PATH.sep + scanPdf.url;
    if (!(await FileUtil.exists(filePath))) { throw new Error("The file doesn't exist."); }

    // name of the file when downloaded
    const filename: string = "bdc-scan_" + purchaseOrder.reference + "_" + scanPdf.id + ".pdf";

    // define headers
    res.header("Content-disposition", "inline; filename=" + filename);
    res.header("Content-type", "application/pdf");

    // send file
    createReadStream(filePath).pipe(res);
  }

  @Post("/:purchaseOrderId")
  @Access(GRANT_TOKEN.FRONT_ACCESS)
  @UseInterceptors(
    FilesInterceptor('pdf[]',10, {
      storage: diskStorage({
        destination: './filesPdf',
      }),
    }),
  )
  async uploadMultipleFiles(@Param("purchaseOrderId") purchaseOrderId: number, @UploadedFiles() files:  ReceivedFile[]) {
    return await this._dataSource.transaction(async transaction => {
      // check if PurchaseOrder exist in DB
      const purchaseOrder: PurchaseOrderSql = await this._purchaseOrderSrv.getById(purchaseOrderId, transaction);
      if (!purchaseOrder) { throw new Error("PurchaseOrder not found."); }
  
      const response = [];
      files.forEach(file => {
        // build response for ?
        const fileReponse = {
          originalname: file.originalname,
          filename: file.filename,
          path: file.path,
        };
  
        // save scan data in DB
        const newScanPdf = new ScanPdfSql();
        newScanPdf.purchaseOrderId = purchaseOrder.id;
        newScanPdf.name = file.originalname;
        newScanPdf.url = file.filename;
        
        this._scanPdfSrv.create(newScanPdf);
  
        response.push(fileReponse);
      });
  
      return response;
    }).catch(err => { throw ErrorUtil.get(err); });
  }

}

