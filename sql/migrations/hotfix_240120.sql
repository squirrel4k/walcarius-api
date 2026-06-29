BEGIN;
-- -----------------------------------------------------
-- Changing all INT for thickness / width / length
-- -----------------------------------------------------


-- Migration for supplyListElements
-- -----------------------------------------------------
ALTER TABLE `supplyListElements` CHANGE COLUMN `thickness` `thickness` DECIMAL(8,2) NULL;
ALTER TABLE `supplyListElements` CHANGE COLUMN `width` `width` DECIMAL(8,2) NULL;
ALTER TABLE `supplyListElements` CHANGE COLUMN `length` `length` DECIMAL(8,2) NULL;


-- Migration for variants
-- -----------------------------------------------------
ALTER TABLE `variants` CHANGE COLUMN `thickness` `thickness` DECIMAL(8,2) NULL;
ALTER TABLE `variants` CHANGE COLUMN `width` `width` DECIMAL(8,2) NULL;
ALTER TABLE `variants` CHANGE COLUMN `length` `length` DECIMAL(8,2) NULL;


-- Migration for purchaseOrderElements
-- -----------------------------------------------------
ALTER TABLE `purchaseOrderElements` CHANGE COLUMN `thickness` `thickness` DECIMAL(8,2) NULL;
ALTER TABLE `purchaseOrderElements` CHANGE COLUMN `width` `width` DECIMAL(8,2) NULL;
ALTER TABLE `purchaseOrderElements` CHANGE COLUMN `length` `length` DECIMAL(8,2) NULL;

COMMIT;