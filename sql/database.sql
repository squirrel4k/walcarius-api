SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='TRADITIONAL,ALLOW_INVALID_DATES';

-- Note : last updated for migrate_31012020.sql

-- Schema creation
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `wal_beta` DEFAULT CHARACTER SET utf8 ;
USE `wal_beta` ;


-- Table `categories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `categories`;
CREATE TABLE `categories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `icon` VARCHAR(45) NOT NULL,
  `parentCategoryId` INT UNSIGNED NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `FK_CATEGORY_PARENT_CATEGORY_idx` (`parentCategoryId` ASC),
  CONSTRAINT `FK_CATEGORY_PARENT_CATEGORY`
    FOREIGN KEY (`parentCategoryId`)
    REFERENCES `categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `elementGroups`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `elementGroups`;
CREATE TABLE `elementGroups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `icon` VARCHAR(45) NOT NULL,
  `useClass` VARCHAR(100) NOT NULL,
  `categoryId` INT UNSIGNED NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_ELEMENTGROUP_CATEGORY_idx` (`categoryId` ASC),
  CONSTRAINT `FK_ELEMENTGROUP_CATEGORY`
    FOREIGN KEY (`categoryId`)
    REFERENCES `categories` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `matters`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `matters`;
CREATE TABLE `matters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(60) NOT NULL,
  `en1090Name` VARCHAR(60) NULL,
  `pricePerKg` FLOAT NOT NULL,
  `kgByLiter` FLOAT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`)
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `elements`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `elements`;
CREATE TABLE `elements` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `elementGroupId` INT UNSIGNED NOT NULL,
  `matterId` INT UNSIGNED NOT NULL,
  `natureValues` JSON NOT NULL,
  `isOrigin` TINYINT NOT NULL DEFAULT 0,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `FK_ELEMENT_ELEMENTGROUP_idx` (`elementGroupId` ASC),
  INDEX `FK_ELEMENT_MATTER_idx` (`matterId` ASC),
  CONSTRAINT `FK_ELEMENT_ELEMENTGROUP`
    FOREIGN KEY (`elementGroupId`)
    REFERENCES `elementGroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_ELEMENT_MATTER`
    FOREIGN KEY (`matterId`)
    REFERENCES `matters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `natures`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `natures`;
CREATE TABLE `natures` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `type` ENUM('STRING', 'INT', 'FLOAT', 'BOOLEAN') NOT NULL,
  `regex` VARCHAR(255) NULL,
  `min` FLOAT NULL,
  `max` FLOAT NULL,
  `nullable` TINYINT(1) NOT NULL DEFAULT 0,
  `redefine` TINYINT(1) NOT NULL DEFAULT 0,
  `displayName` VARCHAR(45) NULL,
  `unit` VARCHAR(45) NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC)
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `elementGroupNatures`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `elementGroupNatures` ;
CREATE TABLE `elementGroupNatures` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `elementGroupId` INT UNSIGNED NOT NULL,
  `natureId` INT UNSIGNED NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  INDEX `FK_ELEMENTGROUPNATURE_ELEMENTGROUP_idx` (`elementGroupId` ASC),
  INDEX `FK_ELEMENTGROUPNATURE_NATURE_idx` (`natureId` ASC),
  CONSTRAINT `FK_ELEMENTGROUPNATURE_ELEMENTGROUP`
    FOREIGN KEY (`elementGroupId`)
    REFERENCES `elementGroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_ELEMENTGROUPNATURE_NATURE`
    FOREIGN KEY (`natureId`)
    REFERENCES `natures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `logins`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `logins` ;
CREATE TABLE `logins` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `firstname` VARCHAR(50) NULL DEFAULT NULL,
  `lastname` VARCHAR(50) NULL DEFAULT NULL,
  `isAdmin` TINYINT(1) NOT NULL DEFAULT 0,
  `resetToken` VARCHAR(50) DEFAULT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC)
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `smtp`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `smtp` ;
CREATE TABLE `smtp` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `loginId` INT UNSIGNED  NOT NULL DEFAULT 0,
  `username` VARCHAR(255) NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `host` VARCHAR(50) NULL DEFAULT NULL,
  `port` INT UNSIGNED NOT NULL DEFAULT 0,
  `encryption` VARCHAR(255) NULL,
  `authMode` VARCHAR(255) NULL,
  `active` BOOLEAN NOT NULL DEFAULT 0, 
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  UNIQUE INDEX `username_UNIQUE` (`username` ASC)
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `loginHistories`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `loginHistories` ;
CREATE TABLE `loginHistories` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fromIp` VARCHAR(45) NULL,
  `loginId` INT UNSIGNED NOT NULL,
  `date` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC),
  CONSTRAINT `FK_LOGINHISTORIES_LOGINS`
    FOREIGN KEY (`loginId`)
    REFERENCES `logins` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `actionGroups`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `actionGroups` ;
CREATE TABLE `actionGroups` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `useClass` VARCHAR(100) NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `id_UNIQUE` (`id` ASC)
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `elementGroupMatters`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `elementGroupMatters` ;
CREATE TABLE `elementGroupMatters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `elementGroupId` INT UNSIGNED NOT NULL,
  `matterId` INT UNSIGNED NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_ELEMENTGROUP_MATTER_ELEMENTGROUP_idx` (`elementGroupId` ASC),
  INDEX `FK_ELEMENTGROUP_MATTER_MATTER_idx` (`matterId` ASC),
  CONSTRAINT `FK_ELEMENTGROUP_MATTER_ELEMENTGROUP`
    FOREIGN KEY (`elementGroupId`)
    REFERENCES `elementGroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_ELEMENTGROUP_MATTER_MATTER`
    FOREIGN KEY (`matterId`)
    REFERENCES `matters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `actionGroupParameters`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `actionGroupParameters` ;
CREATE TABLE `actionGroupParameters` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `actionGroupId` INT UNSIGNED NOT NULL,
  `parameterId` INT UNSIGNED NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_ACTIONPARAMETERS_ACTION_idx` (`actionGroupId` ASC),
  INDEX `FK_ACTIONPARAMETERS_NATURE_idx` (`parameterId` ASC),
  CONSTRAINT `FK_ACTIONGROUPPARAMETERS_ACTIONGROUP`
    FOREIGN KEY (`actionGroupId`)
    REFERENCES `actionGroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_ACTIONGROUPPARAMETERS_NATURE`
    FOREIGN KEY (`parameterId`)
    REFERENCES `natures` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `actions`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `actions` ;
CREATE TABLE `actions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(45) NOT NULL,
  `actionGroupId` INT UNSIGNED NOT NULL,
  `matterId` INT UNSIGNED NULL,
  `natureValues` JSON NOT NULL,
  `createdAt` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` TIMESTAMP NULL ON UPDATE CURRENT_TIMESTAMP,
  `deletedAt` TIMESTAMP NULL,
  PRIMARY KEY (`id`),
  INDEX `FK_ACTION_ACTIONGROUP_idx` (`actionGroupId` ASC),
  INDEX `FK_ACTION_MATTER_idx` (`matterId` ASC),
  CONSTRAINT `FK_ACTION_ACTIONGROUP`
    FOREIGN KEY (`actionGroupId`)
    REFERENCES `actionGroups` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `FK_ACTION_MATTER`
    FOREIGN KEY (`matterId`)
    REFERENCES `matters` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


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
  `isAlreadyInBarset` TINYINT(4) NOT NULL DEFAULT 0,
  `projectId` int(10) unsigned NOT NULL,
  `priceRequestId` int(11) unsigned DEFAULT NULL,
  `createdAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updatedAt` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_supplyList_projects_idx` (`projectId`),
  KEY `fk_supplyList_priceRequests_idx` (`priceRequestId`),
  CONSTRAINT `fk_supplyList_projects` FOREIGN KEY (`projectId`) REFERENCES `projects` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplyList_priceRequests` FOREIGN KEY (`priceRequestId`) REFERENCES `priceRequests` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;


-- Table `supplyListElements`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplyListElements`;
CREATE TABLE `supplyListElements` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `reference` varchar(200) DEFAULT NULL,
  `denomination` varchar(200) DEFAULT NULL,
  `matterReference` varchar(50) DEFAULT NULL,
  `quantity` decimal(8,2) NOT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `format` varchar(100) DEFAULT NULL,
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `length` DECIMAL(8,2) NULL,
  `width` DECIMAL(8,2) NULL,
  `thickness` DECIMAL(8,2) NULL,
  `quantityUnit` varchar(20) NULL,
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
  `status` varchar(20) DEFAULT NULL,
  `isValidated` TINYINT(4) NOT NULL DEFAULT 0,
  `isDone` TINYINT(4) NOT NULL DEFAULT 0,
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
  `isManual` tinyint(4) NOT NULL DEFAULT '0',
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
  `quantity` decimal(8,2) NOT NULL,
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
  `reference` varchar(30) NOT NULL,
  `supplierReference` VARCHAR(50) DEFAULT NULL,
  `remark` varchar(200) DEFAULT NULL,
  `isSent` tinyint(4) NOT NULL DEFAULT '0',
  `sendingDate` TIMESTAMP NULL DEFAULT NULL,
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
  `quantity` decimal(8,2) NOT NULL,
  `weight` decimal(10,3) DEFAULT NULL,
  `format` varchar(20) DEFAULT NULL,
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isCut` tinyint(4) NOT NULL DEFAULT '0',
  `isEn1090` tinyint(4) NOT NULL DEFAULT '0',
  `length` DECIMAL(8,2) NULL,
  `width` DECIMAL(8,2) NULL,
  `thickness` DECIMAL(8,2) NULL,
  `quantityUnit` varchar(20) NULL,
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
  `remark` TEXT DEFAULT NULL,
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
  `quantity` decimal(8,2) NULL DEFAULT NULL,
  `denomination` varchar(200) NULL DEFAULT NULL,
  `isEn1090` tinyint(4) NOT NULL DEFAULT '0',
  `isBlack` tinyint(4) NOT NULL DEFAULT '0',
  `isBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `isPrimaryBlasted` tinyint(4) NOT NULL DEFAULT '0',
  `format` varchar(20) NULL DEFAULT NULL,
  `weight` decimal(10,3) NULL DEFAULT NULL,
  `matterReference` varchar(20) NULL DEFAULT NULL,
  `length` DECIMAL(8,2) NULL,
  `width` DECIMAL(8,2) NULL,
  `thickness` DECIMAL(8,2) NULL,
  `quantityUnit` VARCHAR(20) NULL,
  `remark` varchar(200) NULL DEFAULT NULL,
  `deliveryDate` timestamp NULL DEFAULT NULL,
  `realDeliveryDate` TIMESTAMP NULL DEFAULT NULL,
  `price` decimal(10,3) NULL DEFAULT NULL,
  `unit` varchar(20) NULL,
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


-- Table `supplierMatters`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `supplierMatters`;
CREATE TABLE `supplierMatters` (
  `supplierId` int(10) unsigned NOT NULL,
  `matterId` int(10) unsigned NOT NULL,
  PRIMARY KEY (`supplierId`,`matterId`),
  KEY `fk_supplierMatters_matters_idx` (`matterId`),
  KEY `fk_supplierMatters_suppliers_idx` (`supplierId`),
  CONSTRAINT `fk_supplierMatters_suppliers` FOREIGN KEY (`supplierId`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  CONSTRAINT `fk_supplierMatters_matters` FOREIGN KEY (`matterId`) REFERENCES `matters` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
