BEGIN;
-- -----------------------------------------------------
-- Ajusting old database tables to match Admin
-- -----------------------------------------------------


-- Migration for actionGroupParameters
-- -----------------------------------------------------
ALTER TABLE `actionGroupParameters` 
    CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for actionGroups
-- -----------------------------------------------------
ALTER TABLE `actionGroups` 
    CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for actions
-- -----------------------------------------------------
ALTER TABLE `actions` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for categories
-- -----------------------------------------------------
ALTER TABLE `categories` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for elementGroupMatters
-- -----------------------------------------------------
ALTER TABLE `elementGroupMatters` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for elementGroupNatures
-- -----------------------------------------------------
ALTER TABLE `elementGroupNatures` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for elementGroups
-- -----------------------------------------------------
ALTER TABLE `elementGroups` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for elements
-- -----------------------------------------------------
ALTER TABLE `elements` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;   
ALTER TABLE `elements` ADD COLUMN `isOrigin` TINYINT(4) NOT NULL DEFAULT '0' AFTER `natureValues`;
UPDATE `elements` SET isOrigin = 1 WHERE id > 0;


-- Migration for logins
-- -----------------------------------------------------
ALTER TABLE `logins` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `logins` ADD COLUMN `firstname` VARCHAR(50) DEFAULT NULL AFTER `password`;
ALTER TABLE `logins` ADD COLUMN `lastname` VARCHAR(50) DEFAULT NULL AFTER `firstname`;
ALTER TABLE `logins` ADD COLUMN `resetToken` VARCHAR(50) DEFAULT NULL AFTER `isAdmin`;


-- Migration for matters
-- -----------------------------------------------------
ALTER TABLE `matters` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;


-- Migration for natures
-- -----------------------------------------------------
ALTER TABLE `natures` CHANGE COLUMN `updatedAt` `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP;
ALTER TABLE `natures` ADD COLUMN `displayName` VARCHAR(45) DEFAULT NULL AFTER `redefine`;
ALTER TABLE `natures` ADD COLUMN `unit` VARCHAR(45) DEFAULT NULL AFTER `displayName`;

INSERT INTO `natures` (name, type, regex, min, max, nullable, redefine, displayName, unit) VALUES
    ('reference','STRING',NULL,NULL,NULL,0,1,NULL,NULL),
    ('denomination','STRING',NULL,NULL,NULL,1,1,NULL,NULL),
    ('matterRef','STRING',NULL,NULL,NULL,0,1,NULL,NULL),
    ('quantity','INT',NULL,NULL,NULL,0,1,NULL,NULL),
    ('format','INT',NULL,NULL,NULL,0,1,NULL,'mm'),
    ('isBlack','BOOLEAN',NULL,NULL,NULL,0,1,NULL,NULL),
    ('isBlasted','BOOLEAN',NULL,NULL,NULL,0,1,NULL,NULL),
    ('isPrimaryBlasted','BOOLEAN',NULL,NULL,NULL,0,1,NULL,NULL),
    ('remark','STRING',NULL,NULL,NULL,1,1,NULL,NULL);



-- -----------------------------------------------------
-- Add new tables for Admin
-- -----------------------------------------------------


-- Table `suppliers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `suppliers`;
CREATE TABLE `suppliers` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `code` varchar(10) UNIQUE NOT NULL,
  `name` varchar(100) NOT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `remark` varchar(255) DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `supplierContacts`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplierContacts`;
CREATE TABLE `supplierContacts` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `firstname` varchar(30) DEFAULT NULL,
  `lastname` varchar(30) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `mail` varchar(100) DEFAULT NULL,
  `function` varchar(100) DEFAULT NULL,
  `isFavorite` tinyint(4) NOT NULL DEFAULT '0',
  `language` varchar(10) NOT NULL,
  `supplierId` int(10) unsigned NOT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_suppierContacts_suppliers_idx` (`supplierId`),
  CONSTRAINT `fk_suppierContacts_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `supplyCategories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplyCategories`;
CREATE TABLE `supplyCategories` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `name` varchar(80) NOT NULL,
  `parentSupplyCategoryId` int(10) unsigned DEFAULT NULL,
  `elementGroupId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_supplyCategories_supplyCategories_idx` (`parentSupplyCategoryId`),
  KEY `fk_supplyCategories_elementGroups_idx` (`elementGroupId`),
  CONSTRAINT `fk_supplyCategories_elementGroups` FOREIGN KEY (`elementGroupId`) REFERENCES `elementGroups` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyCategories_supplyCategories` FOREIGN KEY (`parentSupplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

INSERT INTO `supplyCategories` (id, name, parentSupplyCategoryId, elementGroupId) VALUES
    (1,'Sous-traitant',NULL,NULL),
    (2,'Peinture achat',NULL,NULL),
    (3,'Petit outillage',NULL,NULL),
    (4,'Matériel soudure',NULL,NULL),
    (5,'Bardage',NULL,NULL),
    (6,'Location matériel',NULL,NULL),
    (7,'Poutrelle',NULL,NULL),
    (8,'Tube',NULL,NULL),
    (9,'Tôle',NULL,NULL),
    (10,'Boulonnerie',NULL,NULL),
    (11,'Peinture',1,NULL),
    (12,'Galvanisation',1,NULL),
    (13,'Fraisage',1,NULL),
    (14,'HEA',7,1),
    (15,'HEB',7,2),
    (16,'HEM',7,3),
    (17,'IPE',7,4),
    (18,'UPN',7,5),
    (19,'UPE',7,6),
    (20,'IPN',7,7),
    (21,'Cornière égale',7,8),
    (22,'Cornière inégale',7,9),
    (23,'T',7,10),
    (24,'U',7,11),
    (25,'Tube carré',8,12),
    (26,'Tube rectangle',8,13),
    (27,'Tube rond',8,19),
    (28,'S235',9,14),
    (29,'S355',9,15),
    (30,'INOX',9,16),
    (31,'Galva',9,17),
    (32,'Alu',9,18),
    (33,'Consommable atelier',NULL,NULL),
    (34,'Nacelle',6,NULL),
    (35,'Grue',6,NULL);


-- Table structure for table `supplyCategoriesSuppliers`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplyCategoriesSuppliers`;
CREATE TABLE `supplyCategoriesSuppliers` (
  `supplierId` int(10) unsigned NOT NULL,
  `supplyCategoryId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`supplierId`,`supplyCategoryId`),
  KEY `fk_supplyCategoriesSuppliers_supplyCategories_idx` (`supplyCategoryId`),
  CONSTRAINT `fk_supplyCategoriesSuppliers_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyCategoriesSuppliers_supplyCategories` FOREIGN KEY (`supplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


-- Table `supplyCategoryNatures`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplyCategoryNatures`;
CREATE TABLE `supplyCategoryNatures` (
  `natureId` int(10) unsigned NOT NULL,
  `supplyCategoryId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`natureId`,`supplyCategoryId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

INSERT INTO `supplyCategoryNatures` VALUES
    (28,7),(28,8),(28,14),(28,15),(28,16),(28,17),(28,18),(28,19),(28,20),(28,21),(28,22),(28,23),(28,24),(28,25),
    (28,26),(28,27),(29,1),(29,2),(29,3),(29,4),(29,5),(29,6),(29,7),(29,8),(29,9),(29,10),(29,11),(29,12),(29,13),
    (29,14),(29,15),(29,16),(29,17),(29,18),(29,19),(29,20),(29,21),(29,22),(29,23),(29,24),(29,25),(29,26),(29,27),
    (29,28),(29,29),(29,30),(29,31),(29,32),(29,33),(29,34),(29,35),(30,7),(30,8),(30,14),(30,15),(30,16),(30,17),
    (30,18),(30,19),(30,20),(30,21),(30,22),(30,23),(30,24),(30,25),(30,26),(30,27),(31,1),(31,2),(31,3),(31,4),
    (31,5),(31,6),(31,7),(31,8),(31,9),(31,10),(31,11),(31,12),(31,13),(31,14),(31,15),(31,16),(31,17),(31,18),(31,19),
    (31,20),(31,21),(31,22),(31,23),(31,24),(31,25),(31,26),(31,27),(31,28),(31,29),(31,30),(31,31),(31,32),(31,33),(31,34),
    (31,35),(32,7),(32,8),(32,14),(32,15),(32,16),(32,17),(32,18),(32,19),(32,20),(32,21),(32,22),(32,23),(32,24),(32,25),
    (32,26),(32,27),(33,7),(33,8),(33,14),(33,15),(33,16),(33,17),(33,18),(33,19),(33,20),(33,21),(33,22),(33,23),(33,24),
    (33,25),(33,26),(33,27),(34,7),(34,8),(34,14),(34,15),(34,16),(34,17),(34,18),(34,19),(34,20),(34,21),(34,22),(34,23),
    (34,24),(34,25),(34,26),(34,27),(35,7),(35,8),(35,14),(35,15),(35,16),(35,17),(35,18),(35,19),(35,20),(35,21),(35,22),
    (35,23),(35,24),(35,25),(35,26),(35,27),(36,1),(36,2),(36,3),(36,4),(36,5),(36,6),(36,7),(36,8),(36,9),(36,10),(36,11),
    (36,12),(36,13),(36,14),(36,15),(36,16),(36,17),(36,18),(36,19),(36,20),(36,21),(36,22),(36,23),(36,24),(36,25),(36,26),
    (36,27),(36,28),(36,29),(36,30),(36,31),(36,32),(36,33),(36,34),(36,35);


-- Table `projects`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(30) NOT NULL,
  `isEn1090` tinyint(4) NOT NULL DEFAULT '0',
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `supplyLists`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplyLists`;
CREATE TABLE `supplyLists` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `description` varchar(100) DEFAULT NULL,
  `model` varchar(100) DEFAULT NULL,
  `source` varchar(10) NOT NULL,
  `deliveryDate` timestamp NULL DEFAULT NULL,
  `status` varchar(15) NOT NULL,
  `projectId` int(10) unsigned NOT NULL,
  `priceRequestId` int(11) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplyList_projects_idx` (`projectId`),
  CONSTRAINT `fk_supplyList_projects` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `supplyListElements`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplyListElements`;
CREATE TABLE `supplyListElements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(200) DEFAULT NULL,
  `denomination` varchar(200) DEFAULT NULL,
  `matterReference` varchar(50) DEFAULT NULL,
  `quantity` smallint(6) NOT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `format` varchar(100) DEFAULT NULL,
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `remark` varchar(200) DEFAULT NULL,
  `supplyListId` int(10) unsigned NOT NULL,
  `supplyCategoryId` int(10) unsigned DEFAULT NULL,
  `elementId` int(10) unsigned DEFAULT NULL,
  `matterId` int(10) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplyListElements_supplyLists_idx` (`supplyListId`),
  KEY `fk_supplyListElements_supplyCategories_idx` (`supplyCategoryId`),
  KEY `fk_supplyListElements_matters_idx` (`matterId`),
  KEY `fk_supplyListElements_elements_idx` (`elementId`),
  CONSTRAINT `fk_supplyListElements_elements` FOREIGN KEY (`elementId`) REFERENCES `elements` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyListElements_matters` FOREIGN KEY (`matterId`) REFERENCES `matters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyListElements_supplyCategories` FOREIGN KEY (`supplyCategoryId`) REFERENCES `supplyCategories` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyListElements_supplyLists` FOREIGN KEY (`supplyListId`) REFERENCES `supplyLists` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


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


-- Table `supplierOfferElements`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplierOfferElements`;
CREATE TABLE `supplierOfferElements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `price` decimal(10,3) NULL,
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

COMMIT;