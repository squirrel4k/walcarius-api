-- -----------------------------------------------------
-- Table `purchaseOrders`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `purchaseOrders`;
CREATE TABLE `purchaseOrders` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(20) UNIQUE NOT NULL,
  `status` varchar(20) NOT NULL,
  `sendingDate` timestamp NULL DEFAULT NULL,
  `projectId` int(10) unsigned DEFAULT NULL,
  `supplierId` int(10) unsigned DEFAULT NULL,
  `supplierContactId` int(10) unsigned DEFAULT NULL,
  `priceRequestId` int(10) unsigned DEFAULT NULL,
  `loginId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchaseOrders_projects_idx` (`projectId`),
  KEY `fk_purchaseOrders_suppliers_idx` (`supplierId`),
  KEY `fk_purchaseOrders_supplierContacts_idx` (`supplierContactId`),
  KEY `fk_purchaseOrders_priceRequests_idx` (`priceRequestId`),
  KEY `fk_purchaseOrders_logins_idx` (`loginId`),
  CONSTRAINT `fk_purchaseOrders_projects` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchaseOrders_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchaseOrders_supplierContact` FOREIGN KEY (`supplierContactId`) REFERENCES `supplierContacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchaseOrders_priceRequest` FOREIGN KEY (`priceRequestId`) REFERENCES `priceRequests` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchaseOrders_logins` FOREIGN KEY (`loginId`) REFERENCES `logins` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `purchaseOrderAdditionnalCosts`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `purchaseOrderAdditionnalCosts`;
CREATE TABLE `purchaseOrderAdditionnalCosts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `denomination` varchar(200) NULL DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `price` decimal(10,3) NULL DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `purchaseOrderId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchaseOrderAdditionnalCosts_purchaseOrders_idx` (`purchaseOrderId`),
  CONSTRAINT `fk_purchaseOrderAdditionnalCosts_purchaseOrders` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchaseOrders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `purchaseOrderElements`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `purchaseOrderElements`;
CREATE TABLE `purchaseOrderElements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `quantity` smallint(6) NULL DEFAULT NULL,
  `denomination` varchar(200) NULL DEFAULT NULL,
  `isEn1090` tinyint(4) NOT NULL DEFAULT '0',
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `format` varchar(20) NULL DEFAULT NULL,
  `weight` decimal(10,3) NULL DEFAULT NULL,
  `matterReference` varchar(20) NULL DEFAULT NULL,
  `remark` varchar(200) NULL DEFAULT NULL,
  `deliveryDate` timestamp NULL DEFAULT NULL,
  `price` decimal(10,3) NULL DEFAULT NULL,
  `isPrinted` tinyint(4) NOT NULL DEFAULT '0',
  `printedQuantity` smallint(6) NOT NULL DEFAULT 0,
  `purchaseOrderId` int(10) unsigned NOT NULL,
  `supplierOfferElementId` int(10) unsigned DEFAULT NULL,
  `supplyCategoryId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchaseOrderElements_purchaseOrders_idx` (`purchaseOrderId`),
  KEY `fk_purchaseOrderElements_supplierOfferElements_idx` (`supplierOfferElementId`),
  KEY `fk_purchaseOrderElements_supplyCategories_idx` (`supplyCategoryId`),
  CONSTRAINT `fk_purchaseOrderElements_purchaseOrders` FOREIGN KEY (`purchaseOrderId`) REFERENCES `purchaseOrders` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchaseOrderElements_supplierOfferElements` FOREIGN KEY (`supplierOfferElementId`) REFERENCES `supplierOfferElements` (`id`) ON DELETE SET NULL ON UPDATE NO ACTION,
  CONSTRAINT `fk_purchaseOrderElements_supplyCategories` FOREIGN KEY (`supplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `purchaseOrderElementOptions`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `purchaseOrderElementOptions`;
CREATE TABLE `purchaseOrderElementOptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `denomination` varchar(200) NULL DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `price` decimal(10,3) NULL DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `purchaseOrderElementId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_purchaseOrderElementOptions_purchaseOrderElements_idx` (`purchaseOrderElementId`),
  CONSTRAINT `fk_purchaseOrderElementOptions_purchaseOrderElements` FOREIGN KEY (`purchaseOrderElementId`) REFERENCES `purchaseOrderElements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;
