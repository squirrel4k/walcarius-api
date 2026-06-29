-- Migration for purchaseOrderElements
-- -----------------------------------------------------
ALTER TABLE `purchaseOrderElements` ADD COLUMN `unit` VARCHAR(20) NULL AFTER `price`;


-- Migration for supplierOffers
-- -----------------------------------------------------
ALTER TABLE `supplierOffers` CHANGE COLUMN `reference` `reference` VARCHAR(30) NOT NULL;


-- Migration for supplyLists
-- -----------------------------------------------------
ALTER TABLE `supplyLists` ADD COLUMN `isAlreadyInBarset` TINYINT(4) NOT NULL DEFAULT 0 AFTER `status`;


-- Migration for natures
-- -----------------------------------------------------
INSERT INTO `natures` (`id`, `name`, `type`, `nullable`, `redefine`) VALUES
    (37, "length", "INT", 0, 1),
    (38, "width", "INT", 0, 1),
    (39, "thickness", "INT", 0, 1),
    (40, "quantityUnit", "STRING", 0, 1);


-- Migration for supplyCategoryNatures
-- -----------------------------------------------------
DELETE FROM `supplyCategoryNatures` WHERE `natureId` = 29 AND `supplyCategoryId` IN (9, 28, 29, 30, 31, 32);
INSERT INTO `supplyCategoryNatures` (`natureId`, `supplyCategoryId`) VALUES
    (30, 9), (30, 28), (30, 29), (30, 30), (30, 31), (30, 32),
    (37, 9), (37, 28), (37, 29), (37, 30), (37, 31), (37, 32),
    (38, 9), (38, 28), (38, 29), (38, 30), (38, 31), (38, 32),
    (39, 9), (39, 28), (39, 29), (39, 30), (39, 31), (39, 32),
    (40, 9), (40, 28), (40, 29), (40, 30), (40, 31), (40, 32);


-- Migration for supplyListElements
-- -----------------------------------------------------
ALTER TABLE `supplyListElements` CHANGE COLUMN `quantity` `quantity` DECIMAL(8,2) NOT NULL;
ALTER TABLE `supplyListElements` ADD COLUMN `length` MEDIUMINT NULL AFTER `isPrimaryBlasted`;
ALTER TABLE `supplyListElements` ADD COLUMN `width` MEDIUMINT NULL AFTER `length`;
ALTER TABLE `supplyListElements` ADD COLUMN `thickness` MEDIUMINT NULL AFTER `width`;
ALTER TABLE `supplyListElements` ADD COLUMN `quantityUnit` VARCHAR(20) NULL AFTER `thickness`;


-- Migration for variants
-- -----------------------------------------------------
ALTER TABLE `variants` CHANGE COLUMN `quantity` `quantity` DECIMAL(8,2) NOT NULL;
ALTER TABLE `variants` ADD COLUMN `length` MEDIUMINT NULL AFTER `isEn1090`;
ALTER TABLE `variants` ADD COLUMN `width` MEDIUMINT NULL AFTER `length`;
ALTER TABLE `variants` ADD COLUMN `thickness` MEDIUMINT NULL AFTER `width`;
ALTER TABLE `variants` ADD COLUMN `quantityUnit` VARCHAR(20) NULL AFTER `thickness`;


-- Migration for priceRequestElements
-- -----------------------------------------------------
ALTER TABLE `priceRequestElements` CHANGE COLUMN `quantity` `quantity` DECIMAL(8,2) NOT NULL;


-- Migration for purchaseOrderElements - part 2
-- -----------------------------------------------------
ALTER TABLE `purchaseOrderElements` CHANGE COLUMN `quantity` `quantity` DECIMAL(8,2) NOT NULL;
ALTER TABLE `purchaseOrderElements` ADD COLUMN `length` MEDIUMINT NULL AFTER `matterReference`;
ALTER TABLE `purchaseOrderElements` ADD COLUMN `width` MEDIUMINT NULL AFTER `length`;
ALTER TABLE `purchaseOrderElements` ADD COLUMN `thickness` MEDIUMINT NULL AFTER `width`;
ALTER TABLE `purchaseOrderElements` ADD COLUMN `quantityUnit` VARCHAR(20) NULL AFTER `thickness`;