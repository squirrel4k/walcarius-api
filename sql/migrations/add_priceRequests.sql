-- -----------------------------------------------------
-- Table `priceRequests`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `priceRequests`;
CREATE TABLE `priceRequests` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(20) UNIQUE NOT NULL,
  `remark` text DEFAULT NULL,
  `loginId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_priceRequests_logins_idx` (`loginId`),
  CONSTRAINT `fk_priceRequests_logins` FOREIGN KEY (`loginId`) REFERENCES `logins` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `barsetGenerations`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `barsetGenerations`;
CREATE TABLE `barsetGenerations` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `beamLength` smallint(5) unsigned NOT NULL,
  `beamOtherLengths` json NOT NULL,
  `beamIsAutoCut` tinyint(4) NOT NULL DEFAULT '0',
  `beamCutThreshold` smallint(5) unsigned DEFAULT NULL,
  `beamMaxLoss` smallint(5) unsigned DEFAULT NULL,
  `tubeLength` smallint(5) unsigned NOT NULL,
  `tubeOtherLengths` json NOT NULL,
  `tubeIsAutoCut` tinyint(4) NOT NULL DEFAULT '0',
  `tubeCutThreshold` smallint(5) unsigned DEFAULT NULL,
  `tubeMaxLoss` smallint(5) unsigned DEFAULT NULL,
  `generationDuration` mediumint(8) unsigned DEFAULT NULL,
  `partsTotalLength` int(10) unsigned DEFAULT NULL,
  `amalgamsTotalLength` int(10) unsigned DEFAULT NULL,
  `partsQuantity` mediumint(8) DEFAULT NULL,
  `amalgamsQuantity` mediumint(8) DEFAULT NULL,
  `totalLoss` int(11) GENERATED ALWAYS AS (`amalgamsTotalLength` - `partsTotalLength`) VIRTUAL,
  `lossPercent` DECIMAL(5,2) GENERATED ALWAYS AS (((`amalgamsTotalLength` - `partsTotalLength`) / `amalgamsTotalLength`) * 100) VIRTUAL,
  `priceRequestId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_barsetGenerations_priceRequests_idx` (`priceRequestId`),
  CONSTRAINT `fk_barsetGenerations_priceRequests` FOREIGN KEY (`priceRequestId`) REFERENCES `priceRequests` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `priceRequestAdditionnalCosts`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `priceRequestAdditionnalCosts`;
CREATE TABLE `priceRequestAdditionnalCosts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `denomination` varchar(200) NULL DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `priceRequestId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_priceRequestAdditionnalCosts_priceRequests_idx` (`priceRequestId`),
  CONSTRAINT `fk_priceRequestAdditionnalCosts_priceRequests` FOREIGN KEY (`priceRequestId`) REFERENCES `priceRequests` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `amalgamGroups`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `amalgamGroups`;
CREATE TABLE `amalgamGroups` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(45) NOT NULL,
  `format` varchar(15) NOT NULL,
  `isEn1090` tinyint(4) NOT NULL DEFAULT '0',
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isCut` tinyint(4) NOT NULL DEFAULT '0',
  `matterReference` varchar(50) DEFAULT NULL,
  `icon` varchar(45) DEFAULT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `supplyCategoryId` int(10) unsigned NOT NULL,
  `matterId` int(10) unsigned DEFAULT NULL,
  `elementId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_amalgamGroups_supplyCategory_idx` (`supplyCategoryId`),
  KEY `fk_amalgamGroups_matters_idx` (`matterId`),
  KEY `fk_amalgamGroups_elements_idx` (`elementId`),
  CONSTRAINT `fk_amalgamGroups_elements` FOREIGN KEY (`elementId`) REFERENCES `elements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_amalgamGroups_matters` FOREIGN KEY (`matterId`) REFERENCES `matters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_amalgamGroups_supplyCategory` FOREIGN KEY (`supplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `amalgams`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `amalgams`;
CREATE TABLE `amalgams` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `loss` int(11) NOT NULL,
  `isLocked` tinyint(4) NOT NULL DEFAULT '0',
  `isInStock` tinyint(4) NOT NULL DEFAULT '0',
  `stockPosition` varchar(50) NULL DEFAULT NULL,
  `amalgamGroupId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_amalgams_amalgamGroups_idx` (`amalgamGroupId`),
  CONSTRAINT `fk_amalgams_amalgamGroups` FOREIGN KEY (`amalgamGroupId`) REFERENCES `amalgamGroups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `amalgamParts`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `amalgamParts`;
CREATE TABLE `amalgamParts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `amalgamId` int(10) unsigned NOT NULL,
  `supplyListElementId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_amalgamParts_supplyListElements_idx` (`supplyListElementId`),
  KEY `fk_amalgamParts_amalgams_idx` (`amalgamId`),
  CONSTRAINT `fk_amalgamParts_amalgams` FOREIGN KEY (`amalgamId`) REFERENCES `amalgams` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_amalgamParts_supplyListElements` FOREIGN KEY (`supplyListElementId`) REFERENCES `supplyListElements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `priceRequestElements`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `priceRequestElements`;
CREATE TABLE `priceRequestElements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `remark` varchar(200) DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `weight` decimal(10, 3) NULL DEFAULT NULL,
  `priceRequestId` int(10) unsigned NOT NULL,
  `supplyListElementId` int(10) unsigned DEFAULT NULL,
  `amalgamGroupId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_priceRequestElements_priceRequests_idx` (`priceRequestId`),
  KEY `fk_priceRequestElements_supplyListElements_idx` (`supplyListElementId`),
  KEY `fk_priceRequestElements_amalgamGroups_idx` (`amalgamGroupId`),
  CONSTRAINT `fk_priceRequestElements_amalgamGroups` FOREIGN KEY (`amalgamGroupId`) REFERENCES `amalgamGroups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_priceRequestElements_priceRequests` FOREIGN KEY (`priceRequestId`) REFERENCES `priceRequests` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_priceRequestElements_supplyListElements` FOREIGN KEY (`supplyListElementId`) REFERENCES `supplyListElements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `priceRequestElementOptions`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `priceRequestElementOptions`;
CREATE TABLE `priceRequestElementOptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `denomination` varchar(200) NULL DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `priceRequestElementId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_priceRequestElementOptions_priceRequestElements_idx` (`priceRequestElementId`),
  CONSTRAINT `fk_priceRequestElementOptions_priceRequestElements` FOREIGN KEY (`priceRequestElementId`) REFERENCES `priceRequestElements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `variants`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `variants`;
CREATE TABLE `variants` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(50) DEFAULT NULL,
  `denomination` varchar(200) DEFAULT NULL,
  `matterReference` varchar(50) DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `format` varchar(20) DEFAULT NULL,
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isCut` tinyint(4) NOT NULL DEFAULT '0',
  `isEn1090` tinyint(4) NOT NULL DEFAULT '0',
  `remark` varchar(200) DEFAULT NULL,
  `supplyCategoryId` int(10) unsigned DEFAULT NULL,
  `matterId` int(10) unsigned DEFAULT NULL,
  `elementId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_variants_supplyCategories_idx` (`supplyCategoryId`),
  KEY `fk_variants_matters_idx` (`matterId`),
  KEY `fk_variants_elements_idx` (`elementId`),
  CONSTRAINT `fk_variants_elements` FOREIGN KEY (`elementId`) REFERENCES `elements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_variants_matters` FOREIGN KEY (`matterId`) REFERENCES `matters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_variants_supplyCategories` FOREIGN KEY (`supplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `variantOptions`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `variantOptions`;
CREATE TABLE `variantOptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(20) NOT NULL,
  `denomination` varchar(200) NULL DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `price` decimal(10,3) NOT NULL,
  `unit` varchar(20) NOT NULL,
  `variantId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_variantOptions_variants_idx` (`variantId`),
  CONSTRAINT `fk_variantOptions_variants` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplierOffers`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplierOffers`;
CREATE TABLE `supplierOffers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(20) NOT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `isSent` tinyint(4) NOT NULL DEFAULT '0',
  `supplierId` int(10) unsigned NOT NULL,
  `supplierContactId` int(10) unsigned DEFAULT NULL,
  `priceRequestId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplierOffers_suppliers_idx` (`supplierId`),
  KEY `fk_supplierOffers_supplierContacts_idx` (`supplierContactId`),
  KEY `fk_supplierOffers_priceRequests_idx` (`priceRequestId`),
  CONSTRAINT `fk_supplierOffers_priceRequests` FOREIGN KEY (`priceRequestId`) REFERENCES `priceRequests` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierOffers_supplierContacts` FOREIGN KEY (`supplierContactId`) REFERENCES `supplierContacts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierOffers_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplierOfferAdditionnalCosts`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplierOfferAdditionnalCosts`;
CREATE TABLE `supplierOfferAdditionnalCosts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `price` decimal(10,3) NOT NULL,
  `supplierOfferId` int(10) unsigned NOT NULL,
  `priceRequestAdditionnalCostId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplierOfferAdditionnalCosts_supplierOffers_idx` (`supplierOfferId`),
  KEY `fk_supplierOfferAdditionnalCosts_priceRequestACs_idx` (`priceRequestAdditionnalCostId`),
  CONSTRAINT `fk_supplierOfferAdditionnalCosts_supplierOffers` FOREIGN KEY (`supplierOfferId`) REFERENCES `supplierOffers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierOfferAdditionnalCosts_priceRequestACs` FOREIGN KEY (`priceRequestAdditionnalCostId`) REFERENCES `priceRequestAdditionnalCosts` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplierOfferElements`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplierOfferElements`;
CREATE TABLE `supplierOfferElements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `price` decimal(10,3) NOT NULL,
  `deliveryDate` timestamp NULL DEFAULT NULL,
  `isSelected` tinyint(4) NOT NULL DEFAULT '0',
  `selectedQuantity` smallint(6) DEFAULT NULL,
  `supplierOfferId` int(10) unsigned NOT NULL,
  `priceRequestElementId` int(10) unsigned DEFAULT NULL,
  `variantId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplierOfferElements_supplierOffers_idx` (`supplierOfferId`),
  KEY `fk_supplierOfferElements_priceRequestElements_idx` (`priceRequestElementId`),
  KEY `fk_supplierOfferElements_variants_idx` (`variantId`),
  CONSTRAINT `fk_supplierOfferElements_priceRequestElements` FOREIGN KEY (`priceRequestElementId`) REFERENCES `priceRequestElements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierOfferElements_supplierOffers` FOREIGN KEY (`supplierOfferId`) REFERENCES `supplierOffers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierOfferElements_variants` FOREIGN KEY (`variantId`) REFERENCES `variants` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplierOfferElementOptions`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplierOfferElementOptions`;
CREATE TABLE `supplierOfferElementOptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `price` decimal(10,3) DEFAULT NULL,
  `supplierOfferElementId` int(10) unsigned NOT NULL,
  `priceRequestElementOptionId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplierOfferElementOptions_supplierOfferElements_idx` (`supplierOfferElementId`),
  KEY `fk_supplierOfferElementOptions_priceRequestElementOptions_idx` (`priceRequestElementOptionId`),
  CONSTRAINT `fk_supplierOfferElementOptions_supplierOfferElements` FOREIGN KEY (`supplierOfferElementId`) REFERENCES `supplierOfferElements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierOfferElementOptions_priceRequestElementOptions` FOREIGN KEY (`priceRequestElementOptionId`) REFERENCES `priceRequestElementOptions` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplierOfferAdditionnalCosts`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplierOfferAdditionnalCosts`;
CREATE TABLE `supplierOfferAdditionnalCosts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `type` varchar(50) NOT NULL,
  `denomination` varchar(200) DEFAULT NULL,
  `price` decimal(10,3) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `supplierOfferId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplierOfferAdditionnalCosts_supplierOffers_idx` (`supplierOfferId`),
  CONSTRAINT `fk_supplierOfferAdditionnalCosts_supplierOffers` FOREIGN KEY (`supplierOfferId`) REFERENCES `supplierOffers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- -----------------------------------------------------
-- Table `supplierOfferElementOptions`
-- -----------------------------------------------------

DROP TABLE IF EXISTS `supplierOfferElementOptions`;
CREATE TABLE `supplierOfferElementOptions` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `denomination` varchar(200) NOT NULL,
  `price` decimal(10,3) NOT NULL,
  `quantity` int(11) NOT NULL DEFAULT '1',
  `supplierOfferElementId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_supplierOfferElementOptions_supplierOfferElements_idx` (`supplierOfferElementId`),
  CONSTRAINT `fk_supplierOfferElementOptions_supplierOfferElements` FOREIGN KEY (`supplierOfferElementId`) REFERENCES `supplierOfferElements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;