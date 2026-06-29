DROP TABLE IF EXISTS `scanPdf`;
CREATE TABLE `scanPdf` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `purchaseOrderId` INT unsigned  NOT NULL,
  `url` varchar(100) NOT NULL,
  `name` varchar(100) NOT NULL,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_PURCHASEORDER_ID_PURCHASEORDER_idx` (`purchaseOrderId`),
  CONSTRAINT `FK_PURCHASEORDER_ID_PURCHASEORDER` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchaseOrders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
