-- Migration for priceRequests
-- -----------------------------------------------------
ALTER TABLE `priceRequests` ADD COLUMN `status` VARCHAR(20) DEFAULT NULL AFTER `remark`;
ALTER TABLE `priceRequests` ADD COLUMN `isValidated` TINYINT(4) NOT NULL DEFAULT 0 AFTER `status`;


-- Migration for supplierOffers
-- -----------------------------------------------------
ALTER TABLE `supplierOffers` ADD COLUMN `supplierReference` VARCHAR(50) DEFAULT NULL AFTER `reference`;
ALTER TABLE `supplierOffers` ADD COLUMN `sendingDate` TIMESTAMP NULL DEFAULT NULL AFTER `isSent`;


-- Migration for purchaseOrders
-- -----------------------------------------------------
ALTER TABLE `purchaseOrders` ADD COLUMN `remark` TEXT DEFAULT NULL AFTER `sendingDate`;


-- Migration for supplyCategories
-- -----------------------------------------------------
INSERT INTO `supplyCategories` (`id`, `name`, `parentSupplyCategoryId`) VALUES
    (36, "Livraison", NULL);
INSERT INTO `supplyCategoryNatures` (`natureId`, `supplyCategoryId`) VALUES
    (29, 36), (31, 36), (36, 36);


-- Migration for purchaseOrderElements
-- -----------------------------------------------------
ALTER TABLE `purchaseOrderElements` ADD COLUMN `realDeliveryDate` TIMESTAMP NULL DEFAULT NULL AFTER `deliveryDate`;